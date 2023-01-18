// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "./utils.sol";

interface ILoginVerifier {
    function verifyTx(Proof memory proof, uint[6] memory input) external view returns(bool);
}

interface IRegistration {
    function students(bytes32 _usernameHash) external view returns(bytes32, uint256, uint256);
}

contract Login {
    using Pairing for *;

    IRegistration public registration;
    ILoginVerifier public verifier;

    constructor(address _registrationAddress, address _verifierAddress) {
        registration = IRegistration(_registrationAddress);
        verifier = ILoginVerifier(_verifierAddress);
    }

    /**
     * @notice Verifies proof of a person with given id + check if the person is registered
     * @param _usernameHash hashed username of a person
     * @param _proof proof of a person that the person knows the password  
     * @param _publicInputs array of public inputs present in the proof
     */
    function authenticate(bytes32 _usernameHash, Proof memory _proof, uint256[3] memory _publicInputs) external view returns(bool) {
        uint256 passLow;
        uint256 passHigh;
        (,passLow,passHigh) = registration.students(_usernameHash);
        return verifier.verifyTx(
            _proof,
            [
                uint256(uint128(uint160(tx.origin))), 
                passLow, 
                passHigh,
                _publicInputs[0],
                _publicInputs[1],
                _publicInputs[2]
            ]
        );
    }
}
