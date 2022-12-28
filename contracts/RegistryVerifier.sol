// This file is MIT Licensed.
//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
pragma solidity ^0.8.0;
library Pairing {
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    /// @return the generator of G1
    function P1() pure internal returns (G1Point memory) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() pure internal returns (G2Point memory) {
        return G2Point(
            [10857046999023057135944570762232829481370756359578518086990519993285655852781,
             11559732032986387107991004021392285783925812861821192530917403151452391805634],
            [8495653923123431417604973247489272438418190587263600148770280649306958101930,
             4082367875863433681332203403145435568316851327593401208105741076214120093531]
        );
    }
    /// @return the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) pure internal returns (G1Point memory) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
    }


    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint s) internal view returns (G1Point memory r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success);
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2) internal view returns (bool) {
        require(p1.length == p2.length);
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[1];
            input[i * 6 + 3] = p2[i].X[0];
            input[i * 6 + 4] = p2[i].Y[1];
            input[i * 6 + 5] = p2[i].Y[0];
        }
        uint[1] memory out;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point memory a1, G2Point memory a2, G1Point memory b1, G2Point memory b2) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2,
            G1Point memory d1, G2Point memory d2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}

contract RegistryVerifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alpha;
        Pairing.G2Point beta;
        Pairing.G2Point gamma;
        Pairing.G2Point delta;
        Pairing.G1Point[] gamma_abc;
    }
    struct Proof {
        Pairing.G1Point a;
        Pairing.G2Point b;
        Pairing.G1Point c;
    }
    function verifyingKey() pure internal returns (VerifyingKey memory vk) {
        vk.alpha = Pairing.G1Point(uint256(0x2cddfdbc73456877e83eb7323eff915993553f0a1e7e388c5924163d0710fc3b), uint256(0x0fafc77e20109b65327c32732608c595fd91b41352e85d546f81f3f657cd9408));
        vk.beta = Pairing.G2Point([uint256(0x22761d307f39581e89c48b0baccb9255061097001a6497ccf473d464dce95e64), uint256(0x1b426fae8c9ec5ac5013253097a46bab6b0e8d9c70b8903750cff6764470370c)], [uint256(0x032d742ec37d12fb2978180b31dce2f7003fd5adb7d94caf5a6403b4294d889b), uint256(0x2b174a193eea866b5bb4dbbf47ccd6c3f86729a01da378dede4087a4a9c20369)]);
        vk.gamma = Pairing.G2Point([uint256(0x166da4d50c36ce8386d3153a3d16d999486ae745bbb2d4a51da41375e88fc4d8), uint256(0x09b6773709f1eb2710af9d0fa25703357948ed3b95093c463ee3a4eb8740d32e)], [uint256(0x1bdacb291d02c3be6be3661bdd410984934d96202fa9c045958a1d8ccc593df2), uint256(0x1cb02259401c3a79ab6dc094e0926d9a3a2552dcd9100dade42386969f0abf34)]);
        vk.delta = Pairing.G2Point([uint256(0x2e6c8fc57980c5fecf72ed67b0d7e79a8b1af9580a8b75208b5df5d8b4ebcf97), uint256(0x18222598f80a49eafff4f32b26b20a6a3fb6cb1797562f358bab93c98bf4a058)], [uint256(0x248d7393d8d1abbfea315715ee4aafcd17d31d5545814d6147436c89285ce740), uint256(0x2edf11958cbe59d8930fbca5e7e932d5d456864ca9aaf2ebdd0a84ab15678613)]);
        vk.gamma_abc = new Pairing.G1Point[](7);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x26ce6155f3bf9043d53dc02d15031ae3bbb25497a1f6f18ae0b7bdc5c8583c22), uint256(0x00b333d131d1b38d587877871456aeefd62be77ee3e99ea6faeb5ebc311e7991));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x02918fba95ccf4d3e19481cbe088f4595f02edd7073dabdf4b2499889f023229), uint256(0x23e5e8ff1232d180b817bbb372060be2ef13500e4eabd26c271e5bf2fb945bb4));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x1f05678a7ff50176a29707f4db734243458f92c3b3110230dc868d4629b04cd1), uint256(0x00740ce259c4ef54b0c5c94c12a2e1a1f84740a4fac8b96349999bd4bd25b4bc));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x1efb20c1e16ad0c25c80f7dd17de2456a8c09299c4d8de5f263115b6d6f6fe3d), uint256(0x118cc1acf357fee42a5847749a20b1100792ca1bfd02f06ea343a9b4bf5651ed));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x0e9b21e552974e20268ff7680a143c7ad8f3a9e8f08dba806ca313b51b659ba8), uint256(0x2046c52bf2ace6e094b10ac84246ef70740fb8905fa39b996b8d914e9f509106));
        vk.gamma_abc[5] = Pairing.G1Point(uint256(0x156b0363c56dc031042f0eff256a44e42507a23820bef0105a72fb532905f146), uint256(0x0dda7cd68be5ee8d1eec518954e7d9b58363c1b9f7b6db7268db70bc2f7b0639));
        vk.gamma_abc[6] = Pairing.G1Point(uint256(0x048459f25c60c2815d009259734402c50ab5db418b69ecc8b84bf1c679fc765d), uint256(0x2f901c970c74120fa00f76f88c7cf3a7ef2cf4b0a3408ea18c2cde9cfc68c13e));
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
            Proof memory proof, uint[6] memory input
        ) public view returns (bool r) {
        uint[] memory inputValues = new uint[](6);
        
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
