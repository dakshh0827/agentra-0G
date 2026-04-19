// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Agentra is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable agtToken;
    address public feeCollector;

    uint256 public constant PLATFORM_FEE_PERCENTAGE = 20;
    uint256 public constant UPVOTE_COST = 1 ether;
    uint256 public agentCounter;

    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");

    enum AgentTier { Standard, Professional, Enterprise }

    struct Agent {
        uint256 id;
        address creator;
        AgentTier tier;
        uint256 monthlyPrice;
        string metadataURI;
        uint256 upvotes;
        // --- Agent Comms ---
        bool commsEnabled;
        uint256 commsPricePerCall; // in wei (AGT token)
    }

    mapping(uint256 => Agent) public agents;
    mapping(uint256 => mapping(address => uint256)) public accessRegistry;
    mapping(AgentTier => uint256) public listingFees;

    // -------------------------------------------------------
    // Events
    // -------------------------------------------------------
    event AgentDeployed(uint256 indexed agentId, address indexed creator, AgentTier tier);
    event AccessPurchased(uint256 indexed agentId, address indexed buyer, bool isLifetime);
    event AgentUpvoted(uint256 indexed agentId, address indexed voter);

    // New events for agent comms
    event AgentCommsInitiated(
        uint256 indexed callerAgentId,
        uint256 indexed targetAgentId,
        address indexed caller,
        uint256 totalAmount,
        uint256 platformFee,
        uint256 creatorAmount
    );
    event AgentCommsToggled(uint256 indexed agentId, bool enabled);
    event AgentCommsPriceUpdated(uint256 indexed agentId, uint256 newPrice);

    // -------------------------------------------------------
    // Constructor
    // -------------------------------------------------------
    constructor(address _agtToken, address _feeCollector) {
        agtToken = IERC20(_agtToken);
        feeCollector = _feeCollector;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FEE_MANAGER_ROLE, msg.sender);

        listingFees[AgentTier.Standard]      = 50 ether;
        listingFees[AgentTier.Professional]  = 150 ether;
        listingFees[AgentTier.Enterprise]    = 500 ether;
    }

    // -------------------------------------------------------
    // Core: Deploy Agent
    // New params: _commsEnabled, _commsPricePerCall
    // -------------------------------------------------------
    function deployAgent(
        AgentTier _tier,
        uint256 _monthlyPrice,
        string memory _metadataURI,
        bool _commsEnabled,
        uint256 _commsPricePerCall
    ) external nonReentrant whenNotPaused {
        uint256 fee = listingFees[_tier];
        agtToken.safeTransferFrom(msg.sender, feeCollector, fee);

        agentCounter++;
        agents[agentCounter] = Agent({
            id: agentCounter,
            creator: msg.sender,
            tier: _tier,
            monthlyPrice: _monthlyPrice,
            metadataURI: _metadataURI,
            upvotes: 0,
            commsEnabled: _commsEnabled,
            commsPricePerCall: _commsPricePerCall
        });

        // Deployer always has lifetime access to their own agent
        accessRegistry[agentCounter][msg.sender] = type(uint256).max;

        emit AgentDeployed(agentCounter, msg.sender, _tier);
    }

    // -------------------------------------------------------
    // Core: Purchase Access
    // -------------------------------------------------------
    function purchaseAccess(uint256 _agentId, bool _isLifetime) external nonReentrant whenNotPaused {
        Agent storage agent = agents[_agentId];
        require(agent.creator != address(0), "Agent does not exist");

        uint256 totalCost  = _isLifetime ? agent.monthlyPrice * 12 : agent.monthlyPrice;
        uint256 adminCut   = (totalCost * PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 creatorCut = totalCost - adminCut;

        agtToken.safeTransferFrom(msg.sender, feeCollector, adminCut);
        agtToken.safeTransferFrom(msg.sender, agent.creator, creatorCut);

        if (_isLifetime) {
            accessRegistry[_agentId][msg.sender] = type(uint256).max;
        } else {
            uint256 currentExp = accessRegistry[_agentId][msg.sender];
            if (currentExp > block.timestamp && currentExp != type(uint256).max) {
                accessRegistry[_agentId][msg.sender] = currentExp + 30 days;
            } else {
                accessRegistry[_agentId][msg.sender] = block.timestamp + 30 days;
            }
        }

        emit AccessPurchased(_agentId, msg.sender, _isLifetime);
    }

    // -------------------------------------------------------
    // Core: Upvote
    // -------------------------------------------------------
    function upvote(uint256 _agentId) external nonReentrant whenNotPaused {
        Agent storage agent = agents[_agentId];
        require(agent.creator != address(0), "Agent does not exist");

        agtToken.safeTransferFrom(msg.sender, agent.creator, UPVOTE_COST);

        agent.upvotes++;
        emit AgentUpvoted(_agentId, msg.sender);
    }

    // -------------------------------------------------------
    // NEW: Initiate Agent-to-Agent Comms
    //
    // msg.sender  = the human/app user triggering the call
    // _callerAgentId = the agent being used to call (must exist)
    // _targetAgentId = the agent being called (must have comms enabled)
    //
    // Payment: commsPricePerCall of the TARGET agent
    // Split  : 20% → feeCollector, 80% → target agent creator
    // -------------------------------------------------------
    function initiateAgentComms(
        uint256 _callerAgentId,
        uint256 _targetAgentId
    ) external nonReentrant whenNotPaused {
        Agent storage callerAgent = agents[_callerAgentId];
        Agent storage targetAgent = agents[_targetAgentId];

        require(callerAgent.creator != address(0), "Caller agent does not exist");
        require(targetAgent.creator != address(0), "Target agent does not exist");
        require(targetAgent.commsEnabled, "Target agent has comms disabled");
        require(targetAgent.commsPricePerCall > 0, "Target agent comms price not set");

        uint256 totalCost  = targetAgent.commsPricePerCall;
        uint256 platformFee = (totalCost * PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 creatorAmount = totalCost - platformFee;

        agtToken.safeTransferFrom(msg.sender, feeCollector, platformFee);
        agtToken.safeTransferFrom(msg.sender, targetAgent.creator, creatorAmount);

        emit AgentCommsInitiated(
            _callerAgentId,
            _targetAgentId,
            msg.sender,
            totalCost,
            platformFee,
            creatorAmount
        );
    }

    // -------------------------------------------------------
    // NEW: Agent Owner — Toggle Comms On/Off
    // -------------------------------------------------------
    function toggleAgentComms(uint256 _agentId, bool _enabled) external whenNotPaused {
        Agent storage agent = agents[_agentId];
        require(agent.creator != address(0), "Agent does not exist");
        require(agent.creator == msg.sender, "Not agent owner");

        agent.commsEnabled = _enabled;
        emit AgentCommsToggled(_agentId, _enabled);
    }

    // -------------------------------------------------------
    // NEW: Agent Owner — Update Comms Price Per Call
    // -------------------------------------------------------
    function setCommsPricePerCall(uint256 _agentId, uint256 _newPrice) external whenNotPaused {
        Agent storage agent = agents[_agentId];
        require(agent.creator != address(0), "Agent does not exist");
        require(agent.creator == msg.sender, "Not agent owner");

        agent.commsPricePerCall = _newPrice;
        emit AgentCommsPriceUpdated(_agentId, _newPrice);
    }

    // -------------------------------------------------------
    // View Helpers
    // -------------------------------------------------------
    function hasAccess(uint256 _agentId, address _user) external view returns (bool) {
        return accessRegistry[_agentId][_user] > block.timestamp;
    }

    function getAgentCommsInfo(uint256 _agentId) external view returns (bool enabled, uint256 pricePerCall) {
        Agent storage agent = agents[_agentId];
        require(agent.creator != address(0), "Agent does not exist");
        return (agent.commsEnabled, agent.commsPricePerCall);
    }

    // -------------------------------------------------------
    // Admin & Security
    // -------------------------------------------------------
    function setListingFees(AgentTier _tier, uint256 _newFee) external onlyRole(FEE_MANAGER_ROLE) {
        listingFees[_tier] = _newFee;
    }

    function setFeeCollector(address _newCollector) external onlyRole(DEFAULT_ADMIN_ROLE) {
        feeCollector = _newCollector;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}