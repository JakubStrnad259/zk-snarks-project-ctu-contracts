// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./utils.sol";

interface ISCIOVerifier {
    function verifyTx(Proof memory proof, uint[2] memory input) external view returns(bool);
}

interface IRegistry {
    function verify(bytes32 _hashID, Proof memory _proof) external view returns(bool);
}

contract SCIO is Ownable {
    using Pairing for *;

    //bytes32 public ctuPublicKey = "0x323";
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
        //ctuPublicKey = _ctuPublicKey;
    }

    /*
    function setCTUPublicKey(bytes32 _ctuPublicKey) external onlyOwner {
        ctuPublicKey = _ctuPublicKey;
    }
    */
    function addExamResult(bytes32 _hashID, Proof memory _proof, uint256 _parameter) external onlyOwner {
        // Maybe comment this more
        examAttempts[_hashID].push(Attempt(_proof, _parameter));
    }

    function verify(
        bytes32 _hashID,
        uint256 _threshold,
        Proof memory _registryProof
    ) external view returns(bool) {
        // To access result sender needs to verify ownership of an ID
        require(registry.verify(_hashID, _registryProof) == true, "ID does not belong to sender!");

        // Check all results if there is satisfactory one given threshold
        // test pisu ja, neměl bych zobrazovat udaje SCIu.
        Attempt[] storage attempts = examAttempts[_hashID];
        uint256 attemptCount = attempts.length;
        for (uint256 i = 0; i < attemptCount; i++) {
            bool result = verifier.verifyTx(attempts[i].proof, [_threshold, attempts[i].parameter]);
            if (result) {return true;}
        }
        return false;
    }
}

