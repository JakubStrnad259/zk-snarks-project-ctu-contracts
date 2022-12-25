// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Registration {
    mapping(bytes32 => bytes32) private students;

    event StudentRegistered(
        bytes32 usernameHash,
        bytes32 passwordHash
    );

    /** 
    * @notice Register user to the CTU system
    */
    function register (
        uint256 salt,
        bytes32 usernameHash,
        bytes32 passwordHash,
        bytes32 passAndSignerAddressAndSaltHash
        // AProof1
        // Aproof2
        // Aproof3
    ) external {
        // verify that hash(pass + msg.sender + salt) == passAndSignerAddressAndSaltHash
        // verify that hash(pass) == passwordHash
        // input into mapping hash(user) => hash(pass)

        // SCIO verification
        // The user knows password verification
    }
}
