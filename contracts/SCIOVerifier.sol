// This file is MIT Licensed.
//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
pragma solidity ^0.8.0;
import "./utils.sol";

contract SCIOVerifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alpha;
        Pairing.G2Point beta;
        Pairing.G2Point gamma;
        Pairing.G2Point delta;
        Pairing.G1Point[] gamma_abc;
    }

    function verifyingKey() pure internal returns (VerifyingKey memory vk) {
        vk.alpha = Pairing.G1Point(uint256(0x041b32b9d3571b3b727c92fcc871d41decd9a66c957a3875e0762d8c4930d063), uint256(0x2714fe7fafe173bd389b66fc399c9256f55c927cdacc7ac500dc648e2cb6d799));
        vk.beta = Pairing.G2Point([uint256(0x0b6a72711ad1f123916b1cceefa53136a26ec0f15d1668435042bee4e2a18d1f), uint256(0x14a07cbdfb15f065fdbb3613d6c2c7249a9a57f49fb7c4e13424d49006ac2e2f)], [uint256(0x2e82a75ecabe5c114c4cbb5c608684530746cefbfa74b9d0cee8613dfb1bb4c7), uint256(0x06580c0b8e28a33fc5f8c76ac68a63e5eac931cb45c276e2711fd4756b96d64a)]);
        vk.gamma = Pairing.G2Point([uint256(0x1fc168002aa7508d87a38668c83ef62d2361a00fe3d3420595d25740a489d9bc), uint256(0x17b7d91272693ee1f3c8b313fce5ff5fd2094d858f44b91740c8d31455856b8e)], [uint256(0x23d643f76dcda361b550d7f4c1c7a29abefbf17e5d5f9d96b85d9c0124a139f0), uint256(0x13841204940028555ec853bc52b2f4bf3f2de1c0f541aa271d1eaf24ad5dd0d7)]);
        vk.delta = Pairing.G2Point([uint256(0x2431576f5e83f04bef7b5966770abd1dd72643a3de0d2bc986e1d1c4d0716b79), uint256(0x09f800fb7f1f3cc292608310d945d2e8454568a21b378b2702bad48ea950f5c7)], [uint256(0x1fcebb99a025315302eb52499761ea6e2d3b86bf651f45670f00656d74240d08), uint256(0x0205242e5b13870be485a2015ffad1d48f3f4c3e3050495eef6296b1c882b94c)]);
        vk.gamma_abc = new Pairing.G1Point[](3);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x20a4b9bf29db5f0380a5c8659a9fe10cfc8fb68c471fdddb59d8732a33597c72), uint256(0x21426a7dd62958a83db759499d78afa5390e14e4e239ed6d559e7d7002924959));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x05dbbe6c07f10d09f4e29c64cc79f1535e1d4a2d9617d1bacc0b0a507fa84d9b), uint256(0x08ce2228b57e3b27d5c1f2a7275f60abd0aeae5451e25f2479f464db2d84736d));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x0d1ccf863a40617e1d7765ee61892fe6ca758c8c28068182ec5e2db78186a9c5), uint256(0x0144d31e68547d347edaf0a5100c7d20e460776e31a9d15ea0c1ceca020906ce));
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.gamma_abc.length);
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field);
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.gamma_abc[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.gamma_abc[0]);
        if(!Pairing.pairingProd4(
             proof.a, proof.b,
             Pairing.negate(vk_x), vk.gamma,
             Pairing.negate(proof.c), vk.delta,
             Pairing.negate(vk.alpha), vk.beta)) return 1;
        return 0;
    }
    function verifyTx(
            Proof memory proof, uint[2] memory input
        ) public view returns (bool r) {
        uint[] memory inputValues = new uint[](2);
        
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
