// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "./utils.sol";

interface ILoginVerifier {
    function verifyTx(Proof memory proof, uint[4] memory input) external view returns(bool);
}

interface IRegistration {
    function students(bytes32 _usernameHash) external view returns(bytes32, uint256, uint256, uint256);
}

contract Login {
    using Pairing for *;

    IRegistration public registration;
    ILoginVerifier public verifier;

    constructor(address _registrationAddress, address _verifierAddress) {
        registration = IRegistration(_registrationAddress);
        verifier = ILoginVerifier(_verifierAddress);
    }

    function authenticate(bytes32 _usernameHash, Proof memory _proof) external view returns(bool) {
        // msg.sender needs to be added
        uint256 passLow;
        uint256 passHigh;
        uint256 parameter;
        (,passLow,passHigh,parameter) = registration.students(_usernameHash);
        return verifier.verifyTx(_proof, [uint256(uint128(uint160(tx.origin))), passLow, passHigh, parameter]);
    }

    function test(bytes32 _hash) external view returns (uint256, uint256, uint256, uint256) {
        uint a;
        uint b;
        uint c;
        (,a,b,c) = registration.students(_hash);
        return (uint256(uint128(uint160(tx.origin))),a,b,c);
    }
}
