// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Agentra.sol";

contract DeployAgentra is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address feeCollector = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Agentra (Constructor now only takes feeCollector)
        Agentra agentra = new Agentra(feeCollector);

        vm.stopBroadcast();

        // Write ONLY the Agentra address to temp_addresses.json
        string memory json = string.concat("{\"Agentra\": \"", vm.toString(address(agentra)), "\"}");
        vm.writeFile("./temp_addresses.json", json);

        console.log("Agentra deployed at:", address(agentra));
    }
}