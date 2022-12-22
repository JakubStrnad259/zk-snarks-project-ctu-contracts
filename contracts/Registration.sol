// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract RegistrationContract {
    mapping(bytes32 => bytes32) private students;

    event Registration(
        bytes32 usernameHash,
        bytes32 passwordHash
    );

    /** 
    * @notice Register user to the CTU system
    */
    function register() external {
        
    }

    // for relayer BE
    function relayedRegister() external {

    }
}
