// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Agentra is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable agtToken;
    address public immutable feeCollector;
    
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 20;
    uint256 public constant UPVOTE_COST = 1 ether;
    uint256 public agentCounter;

    enum AgentTier { Standard, Professional, Enterprise }

    struct Agent {
        uint256 id;
        address creator;
        AgentTier tier;
        uint256 monthlyPrice;
        string metadataURI;
        uint256 upvotes;
    }

    mapping(uint256 => Agent) public agents;
    mapping(uint256 => mapping(address => uint256)) public accessRegistry;

    // Immutable listing fees (no admin control)
    uint256 public constant STANDARD_FEE = 50 ether;
    uint256 public constant PROFESSIONAL_FEE = 150 ether;
    uint256 public constant ENTERPRISE_FEE = 500 ether;

    event AgentDeployed(uint256 indexed agentId, address indexed creator, AgentTier tier);
    event AccessPurchased(uint256 indexed agentId, address indexed buyer, bool isLifetime);
    event AgentUpvoted(uint256 indexed agentId, address indexed voter);

    constructor(address _agtToken, address _feeCollector) {
        agtToken = IERC20(_agtToken);
        feeCollector = _feeCollector;
    }

    function getListingFee(AgentTier _tier) public pure returns (uint256) {
        if (_tier == AgentTier.Standard) return STANDARD_FEE;
        if (_tier == AgentTier.Professional) return PROFESSIONAL_FEE;
        return ENTERPRISE_FEE;
    }

    function deployAgent(
        AgentTier _tier,
        uint256 _monthlyPrice,
        string memory _metadataURI
    ) external nonReentrant {
        uint256 fee = getListingFee(_tier);

        agtToken.safeTransferFrom(msg.sender, feeCollector, fee);

        agentCounter++;

        agents[agentCounter] = Agent({
            id: agentCounter,
            creator: msg.sender,
            tier: _tier,
            monthlyPrice: _monthlyPrice,
            metadataURI: _metadataURI,
            upvotes: 0
        });

        // Creator gets lifetime access
        accessRegistry[agentCounter][msg.sender] = type(uint256).max;

        emit AgentDeployed(agentCounter, msg.sender, _tier);
    }

    function purchaseAccess(uint256 _agentId, bool _isLifetime) external nonReentrant {
        Agent storage agent = agents[_agentId];
        require(agent.creator != address(0), "Agent does not exist");

        uint256 totalCost = _isLifetime ? agent.monthlyPrice * 12 : agent.monthlyPrice;

        uint256 adminCut = (totalCost * PLATFORM_FEE_PERCENTAGE) / 100;
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

    function upvote(uint256 _agentId) external nonReentrant {
        Agent storage agent = agents[_agentId];
        require(agent.creator != address(0), "Agent does not exist");

        agtToken.safeTransferFrom(msg.sender, agent.creator, UPVOTE_COST);

        agent.upvotes++;

        emit AgentUpvoted(_agentId, msg.sender);
    }

    function hasAccess(uint256 _agentId, address _user) external view returns (bool) {
        return accessRegistry[_agentId][_user] > block.timestamp;
    }
}