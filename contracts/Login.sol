// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract LoginContract {
    function authenticate(
        bytes32 usernameHash,
        bytes32 passAndSignerAddressHash
        // proof
    ) external {
        // registration contract: hash(username) => passHash
        // public inputs to verifier: 
        // - passAndSignerAndSaltAddressHash hash(password + signer + salt)
        // - msg.sender (not exploitable)
        // private:
        // - salt
        // - pass
        //
        //
        // check: hash(passHash + hash(msg.sender) + hash(salt)) == passAndSignerAddressHash (inside zokrates)
        // check: pass == passHash
        //
        //
        // + CTU bude mít public key takže jen CTU je schopno verifikovat proof proofOfOwnership twice?
        // co chci? ověřit že znám password A jsem registered
    }
