// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "./utils.sol";

interface IPasswordVerifier {
    function verifyTx(Proof memory proof, uint[3] memory input) external view returns(bool);
}

interface ISCIO {
    function verify(bytes32 _hashID, uint256 _threshold, Proof memory _registryProof, uint256[3] memory _registryProofPublicInputs) external view returns(bool);
}

contract Registration {
    using Pairing for *;

    ISCIO public scio;
    IPasswordVerifier public verifier;

    uint256 constant public CTU_SCIO_THRESHOLD = 90;

    struct Student {
        bytes32 usernameHash;
        uint128 passwordHashLow;
        uint128 passwordHashHigh;
    }

    mapping(bytes32 => Student) public students;

    constructor(address _passwordVerifierAddress, address _scioAddress) {
        verifier = IPasswordVerifier(_passwordVerifierAddress);
        scio = ISCIO(_scioAddress);
    }

    /** 
    * @notice Register user to the CTU system
    */
    function register(
        bytes32 _hashID,
        bytes32 _hashUsername,
        uint256[3] memory _passwordProofInput,
        uint256[3] memory _registryProofPublicInputs,
        Proof memory _passwordProof,
        Proof memory _registryProof
    ) external returns(bool) {
        require(scio.verify(_hashID, CTU_SCIO_THRESHOLD, _registryProof, _registryProofPublicInputs), "SCIO exam verification is invalid!");
        require(verifier.verifyTx(_passwordProof, _passwordProofInput), "Sender does not know password!");
        require(students[_hashUsername].usernameHash == 0, "The student is already registered!");
        // save passwordHash and assign it to usernameHash
        students[_hashUsername] = Student(
            _hashUsername,
            uint128(uint256(_passwordProofInput[0])), 
            uint128(uint256(_passwordProofInput[1]))
        );
        return true;
    }
}
