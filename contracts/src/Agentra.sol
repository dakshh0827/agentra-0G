// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Agentra is ERC721URIStorage, AccessControl, Pausable, ReentrancyGuard {
    address public feeCollector;

    // The price of 1 Native 0G Token in USD (scaled to 18 decimals)
    uint256 public current0GPriceUSD;

    uint256 public constant PLATFORM_FEE_PERCENTAGE = 20;
    uint256 public constant ESCROW_TIMEOUT = 24 hours; // Auto-refund window

    uint256 private _nextTokenId = 1;
    uint256 public txCounter;

    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");

    enum AgentTier { Standard, Professional, Enterprise }
    enum SubPeriod { Monthly, Yearly }
    enum TxStatus { Pending, Resolved, Refunded }
    enum TxType { Access, Comms }

    struct AgentInfo {
        AgentTier tier;
        uint256 monthlyPriceUSD; // Stored in USD (18 decimals)
        bool commsEnabled;
        uint256 commsPricePerCallUSD; // Stored in USD (18 decimals)
    }

    struct PendingTx {
        uint256 id;
        address user;
        uint256 agentId;
        uint256 weiAmount; // Exact Native 0G locked in escrow
        TxType txType;
        SubPeriod period;
        TxStatus status;
        uint256 timestamp; // To track the 24-hour timeout
    }

    mapping(uint256 => AgentInfo) public agents;
    mapping(uint256 => mapping(address => uint256)) public accessRegistry;
    mapping(uint256 => PendingTx) public pendingTransactions;

    // -------------------------------------------------------
    // Events
    // -------------------------------------------------------
    event PriceUpdated(uint256 new0GPriceUSD);
    event AgentDeployed(uint256 indexed agentId, address indexed creator, AgentTier tier, uint256 listingFeePaidUSD);
    
    event TxPending(uint256 indexed txId, address indexed user, uint256 indexed agentId, TxType txType, uint256 weiAmount);
    event TxResolved(uint256 indexed txId, address indexed user, uint256 indexed agentId);
    event TxRefunded(uint256 indexed txId, address indexed user, uint256 indexed agentId);
    event AgentCommsToggled(uint256 indexed agentId, bool enabled);
    event AgentCommsPriceUpdated(uint256 indexed agentId, uint256 newPrice);

    // -------------------------------------------------------
    // Constructor
    // -------------------------------------------------------
    constructor(address _feeCollector) ERC721("Agentra INFT", "AGNT") {
        require(_feeCollector != address(0), "Fee collector cannot be zero");
        feeCollector = _feeCollector;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
        _grantRole(RESOLVER_ROLE, msg.sender);

        current0GPriceUSD = 1 ether; // Fallback safety price
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // -------------------------------------------------------
    // USD -> Wei Conversion Logic
    // -------------------------------------------------------
    function update0GPrice(uint256 _newPriceUSD) external onlyRole(ORACLE_ROLE) {
        require(_newPriceUSD > 0, "Price cannot be zero");
        current0GPriceUSD = _newPriceUSD;
        emit PriceUpdated(_newPriceUSD);
    }

    function getRequiredWei(uint256 _usdAmount) public view returns (uint256) {
        require(current0GPriceUSD > 0, "Oracle price not set");
        // If USD amount is 0 (e.g. Web2 sets a free tier), require 0 Wei
        if (_usdAmount == 0) return 0; 
        return (_usdAmount * 1e18) / current0GPriceUSD;
    }

    // -------------------------------------------------------
    // Core: 3 Distinct Deployment Functions (Web2 Provides Fee)
    // -------------------------------------------------------
    function deployStandardAgent(
        uint256 _monthlyPriceUSD,
        string memory _metadataURI,
        bool _commsEnabled,
        uint256 _commsPricePerCallUSD,
        uint256 _listingFeeUSD
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        return _deployAgent(AgentTier.Standard, _monthlyPriceUSD, _metadataURI, _commsEnabled, _commsPricePerCallUSD, _listingFeeUSD);
    }

    function deployProfessionalAgent(
        uint256 _monthlyPriceUSD,
        string memory _metadataURI,
        bool _commsEnabled,
        uint256 _commsPricePerCallUSD,
        uint256 _listingFeeUSD
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        return _deployAgent(AgentTier.Professional, _monthlyPriceUSD, _metadataURI, _commsEnabled, _commsPricePerCallUSD, _listingFeeUSD);
    }

    function deployEnterpriseAgent(
        uint256 _monthlyPriceUSD,
        string memory _metadataURI,
        bool _commsEnabled,
        uint256 _commsPricePerCallUSD,
        uint256 _listingFeeUSD
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        return _deployAgent(AgentTier.Enterprise, _monthlyPriceUSD, _metadataURI, _commsEnabled, _commsPricePerCallUSD, _listingFeeUSD);
    }

    // Private helper to handle the actual deployment logic
    function _deployAgent(
        AgentTier _tier,
        uint256 _monthlyPriceUSD,
        string memory _metadataURI, 
        bool _commsEnabled,
        uint256 _commsPricePerCallUSD,
        uint256 _listingFeeUSD
    ) private returns (uint256) {
        uint256 requiredWei = getRequiredWei(_listingFeeUSD);
        require(msg.value >= requiredWei, "Insufficient Native 0G sent");

        // Refund any excess 0G sent by the user
        if (msg.value > requiredWei) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - requiredWei}("");
            require(success, "Refund failed");
        }

        // Send platform fee to collector (if fee is > 0)
        if (requiredWei > 0) {
            (bool feeSuccess, ) = payable(feeCollector).call{value: requiredWei}("");
            require(feeSuccess, "Fee transfer failed");
        }

        uint256 tokenId = _nextTokenId++;
        
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _metadataURI);

        agents[tokenId] = AgentInfo({
            tier: _tier,
            monthlyPriceUSD: _monthlyPriceUSD,
            commsEnabled: _commsEnabled,
            commsPricePerCallUSD: _commsPricePerCallUSD
        });

        accessRegistry[tokenId][msg.sender] = type(uint256).max;

        emit AgentDeployed(tokenId, msg.sender, _tier, _listingFeeUSD);
        return tokenId;
    }

    // -------------------------------------------------------
    // Core: Purchase Access (ESCROW)
    // -------------------------------------------------------
    function purchaseAccess(uint256 _agentId, SubPeriod _period) external payable nonReentrant whenNotPaused {
        require(ownerOf(_agentId) != address(0), "Agent does not exist");
        AgentInfo storage agent = agents[_agentId];

        uint256 totalUsdCost = _period == SubPeriod.Yearly ? agent.monthlyPriceUSD * 12 : agent.monthlyPriceUSD;
        uint256 requiredWei = getRequiredWei(totalUsdCost);
        
        require(msg.value >= requiredWei, "Insufficient Native 0G sent");

        if (msg.value > requiredWei) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - requiredWei}("");
            require(success, "Refund failed");
        }

        txCounter++;
        pendingTransactions[txCounter] = PendingTx({
            id: txCounter,
            user: msg.sender,
            agentId: _agentId,
            weiAmount: requiredWei,
            txType: TxType.Access,
            period: _period,
            status: TxStatus.Pending,
            timestamp: block.timestamp
        });

        emit TxPending(txCounter, msg.sender, _agentId, TxType.Access, requiredWei);
    }

    // -------------------------------------------------------
    // Core: Initiate Agent Comms (ESCROW)
    // -------------------------------------------------------
    function initiateAgentComms(uint256 _callerAgentId, uint256 _targetAgentId) external payable nonReentrant whenNotPaused {
        require(ownerOf(_callerAgentId) != address(0), "Caller agent missing");
        require(ownerOf(_targetAgentId) != address(0), "Target agent missing");
        
        AgentInfo storage targetAgent = agents[_targetAgentId];
        require(targetAgent.commsEnabled, "Target comms disabled");
        require(targetAgent.commsPricePerCallUSD > 0, "Target comms price zero");

        uint256 requiredWei = getRequiredWei(targetAgent.commsPricePerCallUSD);
        require(msg.value >= requiredWei, "Insufficient Native 0G sent");

        if (msg.value > requiredWei) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - requiredWei}("");
            require(success, "Refund failed");
        }

        txCounter++;
        pendingTransactions[txCounter] = PendingTx({
            id: txCounter,
            user: msg.sender,
            agentId: _targetAgentId,
            weiAmount: requiredWei,
            txType: TxType.Comms,
            period: SubPeriod.Monthly,
            status: TxStatus.Pending,
            timestamp: block.timestamp
        });

        emit TxPending(txCounter, msg.sender, _targetAgentId, TxType.Comms, requiredWei);
    }

    // -------------------------------------------------------
    // Escrow Resolution & Refunds
    // -------------------------------------------------------
    function resolveTransaction(uint256 _txId) external onlyRole(RESOLVER_ROLE) nonReentrant {
        PendingTx storage pTx = pendingTransactions[_txId];
        require(pTx.status == TxStatus.Pending, "Tx not pending");
        
        pTx.status = TxStatus.Resolved;

        if (pTx.txType == TxType.Access) {
            uint256 timeToAdd = pTx.period == SubPeriod.Yearly ? 365 days : 30 days;
            uint256 currentExp = accessRegistry[pTx.agentId][pTx.user];
            
            if (currentExp > block.timestamp && currentExp != type(uint256).max) {
                accessRegistry[pTx.agentId][pTx.user] = currentExp + timeToAdd;
            } else {
                accessRegistry[pTx.agentId][pTx.user] = block.timestamp + timeToAdd;
            }
        }

        uint256 platformFee = (pTx.weiAmount * PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 creatorCut = pTx.weiAmount - platformFee;

        address currentOwner = ownerOf(pTx.agentId);

        if (platformFee > 0) {
            (bool feeSuccess, ) = payable(feeCollector).call{value: platformFee}("");
            require(feeSuccess, "Fee transfer failed");
        }

        if (creatorCut > 0) {
            (bool creatorSuccess, ) = payable(currentOwner).call{value: creatorCut}("");
            require(creatorSuccess, "Creator transfer failed");
        }

        emit TxResolved(_txId, pTx.user, pTx.agentId);
    }

    function refundTransaction(uint256 _txId) external onlyRole(RESOLVER_ROLE) nonReentrant {
        PendingTx storage pTx = pendingTransactions[_txId];
        require(pTx.status == TxStatus.Pending, "Tx not pending");
        
        pTx.status = TxStatus.Refunded;

        (bool success, ) = payable(pTx.user).call{value: pTx.weiAmount}("");
        require(success, "Refund failed");

        emit TxRefunded(_txId, pTx.user, pTx.agentId);
    }

    function claimTimeoutRefund(uint256 _txId) external nonReentrant {
        PendingTx storage pTx = pendingTransactions[_txId];
        require(pTx.status == TxStatus.Pending, "Tx not pending");
        require(msg.sender == pTx.user, "Only payer can claim");
        require(block.timestamp > pTx.timestamp + ESCROW_TIMEOUT, "Escrow timeout not reached");

        pTx.status = TxStatus.Refunded;

        (bool success, ) = payable(pTx.user).call{value: pTx.weiAmount}("");
        require(success, "Refund failed");

        emit TxRefunded(_txId, pTx.user, pTx.agentId);
    }

    // -------------------------------------------------------
    // Agent Management (Owner Only)
    // -------------------------------------------------------
    function toggleAgentComms(uint256 _agentId, bool _enabled) external whenNotPaused {
        require(ownerOf(_agentId) == msg.sender, "Not agent owner");
        agents[_agentId].commsEnabled = _enabled;
        emit AgentCommsToggled(_agentId, _enabled);
    }

    function updateAgentPricing(uint256 _agentId, uint256 _newMonthlyUSD, uint256 _newCommsUSD) external whenNotPaused {
        require(ownerOf(_agentId) == msg.sender, "Not agent owner");
        agents[_agentId].monthlyPriceUSD = _newMonthlyUSD;
        agents[_agentId].commsPricePerCallUSD = _newCommsUSD;
    }
}