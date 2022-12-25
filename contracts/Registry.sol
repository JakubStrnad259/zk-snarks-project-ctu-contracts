// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./utils.sol";

interface IRegistryVerifier {
    function verifyTx(Proof memory proof, uint[4] memory input) external view returns(bool);
}

contract Registry is Ownable {
    using Pairing for *;
    /**
     * @notice  This contract represents national register of people
     *          People can be added only by the owner of this contract (authority)
     *          Person can be added only once
     */

    IRegistryVerifier public verifier;

    struct Person {
        uint256 ID;
        uint128 accessHashLow;
        uint128 accessHashHigh;
        uint128 parameter;
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
    function setPerson(uint256 _id, uint128 _accessHashLow, uint128 _accessHashHigh, uint128 _parameter) external onlyOwner {
        require(persons[_id].ID == 0, "Person already registered!");
        persons[_id] = Person(_id, _accessHashLow, _accessHashHigh, _parameter);
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
        uint256[4] memory inputs = [uint256(uint128(uint160(msg.sender))), person.accessHashLow, person.accessHashHigh, person.parameter];
        return verifier.verifyTx(_proof, inputs);
    }
}
