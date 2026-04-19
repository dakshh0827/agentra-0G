// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/AgentToken.sol";
import "../src/Agentra.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress    = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        AgentToken agentToken = new AgentToken();
        Agentra    agentra    = new Agentra(address(agentToken), deployerAddress);

        vm.stopBroadcast();

        // Write addresses so format_deployments.js can pick them up
        string memory json = string(abi.encodePacked(
            '{"AgentToken":"', vm.toString(address(agentToken)),
            '","Agentra":"',   vm.toString(address(agentra)),
            '"}'
        ));
        vm.writeFile("./temp_addresses.json", json);

        console.log("AgentToken deployed at:", address(agentToken));
        console.log("Agentra    deployed at:", address(agentra));
    }
}