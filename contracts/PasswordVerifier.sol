// This file is MIT Licensed.
//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
pragma solidity ^0.8.0;
import "./utils.sol";


contract PasswordVerifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alpha;
        Pairing.G2Point beta;
        Pairing.G2Point gamma;
        Pairing.G2Point delta;
        Pairing.G1Point[] gamma_abc;
    }

    function verifyingKey() pure internal returns (VerifyingKey memory vk) {
        vk.alpha = Pairing.G1Point(uint256(0x161aab6bc11e05805776be886e61e15e5f291d76006e0c03dcaa74e243ce7430), uint256(0x2b479b73a4e0651ad54c6853c3e9aacfa05145b61cd857d877acbe3244ffa4cd));
        vk.beta = Pairing.G2Point([uint256(0x29ed0829faae092c9627d4a0e608ace4f1a16e7d98c0674a521dec25339471d8), uint256(0x0d6810fbfd6562bfbcc5f2ab10b74d16cd6a90d69d5b3eab09772effc990e0de)], [uint256(0x2c29d841545ac1f4239804c10bd8875e697f53ffc2e680537dccf2dad775a24c), uint256(0x03533e7154e4162dba5f930936cef2e156cbf1cd1bea91ec66397bcfae5d5b86)]);
        vk.gamma = Pairing.G2Point([uint256(0x01c3ebe3513f0a80d9236f7a5975f4af280acd7bd02c403577f42d32bd038035), uint256(0x1317a4f81d98b53139057e59b94149697e99496bfa8ffa834e7e2b78b35fc56b)], [uint256(0x2cda923730b3dd07a1aed8c52302f79bb5b23d003f6ada57ec0af5baa8eea71d), uint256(0x057572b80883af7bc0b334a96656db831d4be98a1bc918dda915019195d2c524)]);
        vk.delta = Pairing.G2Point([uint256(0x172d1bcfe0b1e905c872fc3606e8678c830bf28a842590197b578969834438f1), uint256(0x0c7a730701945abc4a6923be0e9f778439e70a1d2185b03567ef8e301eec9883)], [uint256(0x11cf5be1ad987b20365035e8fc52ead56b57e2ae1395c85678f0ebcfecd0462a), uint256(0x14de08407c795d4edafb4c032194d25f2df0571cf498be23f52c401d69d3accf)]);
        vk.gamma_abc = new Pairing.G1Point[](4);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x08588613ad6330d66ada96aec8a95975abe349226ed272be3c8e0b8d154428d9), uint256(0x121bdf25da82de13263488c1ad3d28c77a3931b90142779d0a5dc2824c62dfe8));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x1a3480a68cbfefe73bbf4eadbf6d76b39126ea6985f91f1394ea2407724b860a), uint256(0x1dc24989a510128946bd34750abce721cf6241d11c6513ed946dbb7a6c775b94));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x1e9e61b2925061d2fa639134d1a9c66035817cbcaa9dd60e04cf1dfe3ffd21aa), uint256(0x1d3512886ee0db890e7c6fed28567c77d779f1bc3f47810890fbf5762cd91f9d));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x0dbbbaa7b93c6f81c8c6f217c42aec3edf4bce107a705bf88af076aa72abdb7e), uint256(0x1402b3a1f5f8a8e18d16d0b131548e17218d9969cefdaa69787045c882efcd91));
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
            Proof memory proof, uint[3] memory input
        ) public view returns (bool r) {
        uint[] memory inputValues = new uint[](3);
        
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
