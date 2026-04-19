// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Agentra.sol";

contract DeployAgentra is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress    = vm.addr(deployerPrivateKey);

        address agentTokenAddress  = vm.envAddress("AGENT_TOKEN_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);
        Agentra agentra = new Agentra(agentTokenAddress, deployerAddress);
        vm.stopBroadcast();

        console.log("Agentra deployed at:", address(agentra));
    }
}