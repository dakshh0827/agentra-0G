// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentraRegistry
 * @notice Permanent backbone contract. Deploy ONCE. Never upgrade. Never replace.
 *         All Agentra versions (V1, V2, V3...) register agents here.
 *         Global agent IDs are canonical identifiers across all contract versions.
 *
 * @dev Authorized contracts (V1, V2...) call registerAgent() on deployment.
 *      MigrationBridge calls updateRecord() when an agent moves from V1 → V2.
 *      Frontend/indexer always resolves ownership via ownerOf(globalAgentId).
 */
contract AgentraRegistry {

    address public admin;

    uint256 public globalAgentCounter;

    // -------------------------------------------------------
    // Structs
    // -------------------------------------------------------

    struct AgentRecord {
        address contractAddress;    // Current contract holding this agent NFT
        uint256 localTokenId;       // Token ID within that contract
        uint256 version;            // Contract version (1 = V1, 2 = V2, ...)
        address previousContract;   // Set when agent migrates — points back to old contract
        uint256 previousLocalId;    // Local token ID in the previous contract
    }

    // -------------------------------------------------------
    // Storage
    // -------------------------------------------------------

    // globalAgentId → AgentRecord
    mapping(uint256 => AgentRecord) public agents;

    // contractAddress → localTokenId → globalAgentId
    // Allows reverse lookup: "what is the global ID of token #5 on V1?"
    mapping(address => mapping(uint256 => uint256)) public globalIdOf;

    // Which contracts are allowed to register/update agents
    mapping(address => bool) public authorizedContracts;

    // -------------------------------------------------------
    // Events
    // -------------------------------------------------------

    event AgentRegistered(
        uint256 indexed globalAgentId,
        address indexed contractAddress,
        uint256 localTokenId,
        uint256 version
    );

    event AgentRecordUpdated(
        uint256 indexed globalAgentId,
        address indexed newContract,
        uint256 newLocalTokenId,
        uint256 newVersion,
        address previousContract,
        uint256 previousLocalId
    );

    event ContractAuthorized(address indexed contractAddress);
    event ContractDeauthorized(address indexed contractAddress);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    // -------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------

    modifier onlyAdmin() {
        require(msg.sender == admin, "Registry: not admin");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender], "Registry: not authorized contract");
        _;
    }

    // -------------------------------------------------------
    // Constructor
    // -------------------------------------------------------

    constructor() {
        admin = msg.sender;
    }

    // -------------------------------------------------------
    // Admin Functions
    // -------------------------------------------------------

    /**
     * @notice Authorize a contract (V1, V2, MigrationBridge...) to register/update agents.
     * @dev Call this immediately after deploying each new Agentra version contract.
     */
    function authorizeContract(address _contract) external onlyAdmin {
        require(_contract != address(0), "Registry: zero address");
        authorizedContracts[_contract] = true;
        emit ContractAuthorized(_contract);
    }

    /**
     * @notice Remove authorization (e.g., if a contract is deprecated or compromised).
     */
    function deauthorizeContract(address _contract) external onlyAdmin {
        authorizedContracts[_contract] = false;
        emit ContractDeauthorized(_contract);
    }

    /**
     * @notice Transfer admin role to a new address (e.g., to a multisig or timelock).
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Registry: zero address");
        emit AdminTransferred(admin, _newAdmin);
        admin = _newAdmin;
    }

    // -------------------------------------------------------
    // Core Registry Functions
    // -------------------------------------------------------

    /**
     * @notice Register a newly deployed agent. Called by Agentra V1, V2, etc.
     * @param _localTokenId The token ID within the calling contract.
     * @param _version The version of the calling contract (1 for V1, 2 for V2...).
     * @return globalAgentId The canonical global ID for this agent across all versions.
     */
    function registerAgent(
        uint256 _localTokenId,
        uint256 _version
    ) external onlyAuthorized returns (uint256 globalAgentId) {
        globalAgentId = ++globalAgentCounter;

        agents[globalAgentId] = AgentRecord({
            contractAddress: msg.sender,
            localTokenId: _localTokenId,
            version: _version,
            previousContract: address(0),
            previousLocalId: 0
        });

        globalIdOf[msg.sender][_localTokenId] = globalAgentId;

        emit AgentRegistered(globalAgentId, msg.sender, _localTokenId, _version);
    }

    /**
     * @notice Update an agent's record when it migrates from one contract version to another.
     *         Called by the MigrationBridge contract (which must be authorized).
     * @param _globalAgentId The canonical global ID (never changes across migrations).
     * @param _newContract   The new contract address (e.g., AgentraV2).
     * @param _newLocalTokenId The token ID in the new contract.
     * @param _newVersion    The version number of the new contract.
     */
    function updateRecord(
        uint256 _globalAgentId,
        address _newContract,
        uint256 _newLocalTokenId,
        uint256 _newVersion
    ) external onlyAuthorized {
        require(_newContract != address(0), "Registry: zero address");
        AgentRecord storage rec = agents[_globalAgentId];
        require(rec.contractAddress != address(0), "Registry: agent not found");

        // Preserve previous location for fallback reads
        rec.previousContract = rec.contractAddress;
        rec.previousLocalId  = rec.localTokenId;

        // Update to new location
        rec.contractAddress = _newContract;
        rec.localTokenId    = _newLocalTokenId;
        rec.version         = _newVersion;

        // Update reverse lookup
        globalIdOf[_newContract][_newLocalTokenId] = _globalAgentId;

        emit AgentRecordUpdated(
            _globalAgentId,
            _newContract,
            _newLocalTokenId,
            _newVersion,
            rec.previousContract,
            rec.previousLocalId
        );
    }

    // -------------------------------------------------------
    // View Functions
    // -------------------------------------------------------

    /**
     * @notice Universal ownership check. Works regardless of which contract version
     *         the agent currently lives on.
     * @param _globalAgentId The canonical global agent ID.
     * @return owner The current owner's address.
     */
    function ownerOf(uint256 _globalAgentId) external view returns (address owner) {
        AgentRecord memory rec = agents[_globalAgentId];
        require(rec.contractAddress != address(0), "Registry: agent not found");
        return IERC721Minimal(rec.contractAddress).ownerOf(rec.localTokenId);
    }

    /**
     * @notice Get full agent record for a global ID.
     */
    function getAgent(uint256 _globalAgentId) external view returns (AgentRecord memory) {
        return agents[_globalAgentId];
    }

    /**
     * @notice Resolve global ID from a contract address + local token ID.
     *         Useful for V2 Sidecar: "what is the global ID of this V1 token?"
     */
    function resolveGlobalId(
        address _contract,
        uint256 _localTokenId
    ) external view returns (uint256) {
        return globalIdOf[_contract][_localTokenId];
    }
}

// Minimal ERC721 interface — only what Registry needs
interface IERC721Minimal {
    function ownerOf(uint256 tokenId) external view returns (address);
}
