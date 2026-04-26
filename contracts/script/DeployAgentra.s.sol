// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Agentra.sol";

contract DeployAgentra is Script {
    function run() external {
        vm.startBroadcast();

        // 🛑 IMPORTANT: Paste your already deployed 0G AgentToken address here
        address existingTokenAddress = 0x6B59511a689221eB7a0a21E3B1D6d88031C17c3d; 
        
        address feeCollector = msg.sender;

        // Deploy the new Agentra contract
        Agentra agentra = new Agentra(existingTokenAddress, feeCollector);
        
        console.log("New Agentra deployed to:", address(agentra));

        // Write BOTH addresses to temp_addresses.json for the formatter
        string memory json = "{";
        json = string.concat(json, "\"AgentToken\": \"", vm.toString(existingTokenAddress), "\",");
        json = string.concat(json, "\"Agentra\": \"", vm.toString(address(agentra)), "\"");
        json = string.concat(json, "}");
        
        vm.writeFile("./temp_addresses.json", json);

        vm.stopBroadcast();
    }
}