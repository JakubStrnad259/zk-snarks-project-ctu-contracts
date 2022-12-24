// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./utils.sol";

interface IVerifier {
    function verifyTx(Proof memory proof, uint[2] memory input) external view returns(bool);
}

contract NationalRegister is Ownable {
    using Pairing for *;
    /**
     * @notice  This contract represents national register of people
     *          People can be added only by the owner of this contract (authority)
     *          Person can be added only once
     */

    IVerifier public verifier;

    struct Person {
        uint256 ID;
        bytes32 passwordHashHigh;
        bytes32 passwordHashLow;
    }

    mapping(uint256 => Person) public persons;

    constructor(address _verifierAddress) {
        verifier = IVerifier(_verifierAddress);
    }

    /**
     * @notice Sets a verifier contract
     */
    function setVerifierContract(address _verifierAddress) external onlyOwner {
        verifier = IVerifier(_verifierAddress);
    }

    /**
     * @notice Registers a person to the national registry
     */
    function setPerson(uint256 _id, bytes32 _passwordHashHigh, bytes32 _passwordHashLow) external onlyOwner {
        require(persons[_id].ID == 0, "Person already registered!");
        persons[_id] = Person(_id, _passwordHashHigh, _passwordHashLow);
    }

    /**
     * @notice Verifies proof of a person with given id + check if the person is registered
     * @param _id id of a person that needs to be verified
     * @param _proof proof of a person that the person knows the password (ID belongs to the person)  
     */
    function verify(uint256 _id, Proof memory _proof) external view returns(bool) {
        Person storage person = persons[_id];
        uint[2] memory input = [uint256(person.passwordHashLow), uint256(person.passwordHashHigh)];
        // check if registered
        if (person.ID == 0) {revert("Person not registered!");}
        return verifier.verifyTx(_proof, input);
    }
}
