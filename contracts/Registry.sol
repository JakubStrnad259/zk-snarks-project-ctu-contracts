// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./utils.sol";

interface IRegistryVerifier {
    function verifyTx(Proof memory proof, uint[3] memory input) external view returns(bool);
}

contract Registry is Ownable {
    using Pairing for *;
    /**
     * @notice  This contract represents national register of people
     *          People can be added only by the owner of this contract (authority)
     *          Person can be added only once
     */

    uint256 constant LENGTH_OF_PUBLIC_INPUT = 3;
    IRegistryVerifier public verifier;

    struct Person {
        uint256 ID;
        uint256[LENGTH_OF_PUBLIC_INPUT] inputs;
    }

    mapping(uint256 => Person) public persons;

    constructor(address _verifierAddress) {
        verifier = IRegistryVerifier(_verifierAddress);
    }

    /**
     * @notice Sets a verifier contract
     */
    function setVerifierContract(address _verifierAddress) external onlyOwner {
        verifier = IRegistryVerifier(_verifierAddress);
    }

    /**
     * @notice Registers a person to the national registry
     */
    function setPerson(uint256 _id, bytes32[LENGTH_OF_PUBLIC_INPUT] memory _inputs) external onlyOwner {
        require(persons[_id].ID == 0, "Person already registered!");
        uint256[LENGTH_OF_PUBLIC_INPUT] memory _convertedInputs;
        for (uint i = 0; i < LENGTH_OF_PUBLIC_INPUT; i++) {
            _convertedInputs[i] = uint256(_inputs[i]);
        }
        persons[_id] = Person(_id, _convertedInputs);
    }

    /**
     * @notice Verifies proof of a person with given id + check if the person is registered
     * @param _id id of a person that needs to be verified
     * @param _proof proof of a person that the person knows the password (ID belongs to the person)  
     */
    function verify(uint256 _id, Proof memory _proof) external view returns(bool) {
        Person storage person = persons[_id];
        // check if registered
        require(person.ID == 0, "Person not registered!");
        return verifier.verifyTx(_proof, person.inputs);
    }
}
