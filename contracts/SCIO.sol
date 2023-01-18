// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./utils.sol";

interface ISCIOVerifier {
    function verifyTx(Proof memory proof, uint[2] memory input) external view returns(bool);
}

interface IRegistry {
    function verify(bytes32 _hashID, Proof memory _proof, uint256[3] memory _registryProofPublicInputs) external view returns(bool);
}

contract SCIO is Ownable {
    using Pairing for *;

    ISCIOVerifier public verifier;
    IRegistry public registry;

    struct Attempt {
        Proof proof;
        uint256 parameter;
    }

    mapping (bytes32 => Attempt[]) public examAttempts;

    constructor(address _verifierAddress, address _registryAddress) {
        verifier = ISCIOVerifier(_verifierAddress);
        registry = IRegistry(_registryAddress);
    }

    function addExamResult(bytes32 _hashID, Proof memory _proof, uint256 _parameter) external onlyOwner {
        examAttempts[_hashID].push(Attempt(_proof, _parameter));
    }

    /**
     * @notice Verifies proof of a person with given id + check if the person is registered
     * @param _hashID hashed registry ID of a person that needs to be verified
     * @param _threshold amount of percentile points that the score attempt needs to have in order to pass the bar  
     * @param _registryProof proof that the user owns the registryID
     * @param _registryProofPublicInputs array of public inputs present in registry proof
     */
    function verify(
        bytes32 _hashID,
        uint256 _threshold,
        Proof memory _registryProof,
        uint256[3] memory _registryProofPublicInputs
    ) external view returns(bool) {
        require(registry.verify(_hashID, _registryProof, _registryProofPublicInputs) == true, "ID does not belong to sender!");
        Attempt[] storage attempts = examAttempts[_hashID];
        uint256 attemptCount = attempts.length;
        for (uint256 i = 0; i < attemptCount; i++) {
            bool result = verifier.verifyTx(attempts[i].proof, [_threshold, attempts[i].parameter]);
            if (result) {return true;}
        }
        return false;
    }
}

