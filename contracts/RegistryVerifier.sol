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
        vk.alpha = Pairing.G1Point(uint256(0x00be872761a5ad7beb3cde80931fbe159225bfc71a6b2d9a9d54c885003b5f75), uint256(0x29b39c1c1f926dcb7ab8aafac96568698d2c6766cdacb62572b37f03b821aa05));
        vk.beta = Pairing.G2Point([uint256(0x218f33203166b41726a4fdcc636b3b202fe8ea89653582c43a5a0683c306cd2a), uint256(0x2e16a388b0413819b999862a5a5633166917f63e595c634352d3966b75caa769)], [uint256(0x084d09c56655e33b3a7ac6c48af09808d2eb0c2e667bbfbaaa7973821b6858aa), uint256(0x0d849c69dad0bc72c36f7462dce6842b4b951cfbf44e65ee0f657d3d2ad771dd)]);
        vk.gamma = Pairing.G2Point([uint256(0x12b9e0cfe8405042c73d3b5a232ce61fcbe2363a77196e1077a1130abe078220), uint256(0x039093c3ef821a63824fb5c39c1ac48f48e032f28f54a30e8f3b16b5d5de5738)], [uint256(0x2a53a7470e8e62649d8d26d9acb5494d3d36191a0e781467f637d059273063e6), uint256(0x27c05fc756cdc845041ac7f3dac11d48bdf5fd40359d2dbd034a3814142a3951)]);
        vk.delta = Pairing.G2Point([uint256(0x0f9383e8c91fd3bcbd47bbb350687873bd427fe450369f281d2fa8875fbf4af0), uint256(0x0ff8873cee4359bf3608a231eecfb1738ac5c3d67f18e8854786dd5b4e86a8f6)], [uint256(0x2727a640ac87c36eed416cd6fb5a9aa71a23f6fc5d73ba5b8b54d9b2640f6dde), uint256(0x0b50381d85a5996903ededd5e3c0ff648d3e875f8ad20286a742a5432017b638)]);
        vk.gamma_abc = new Pairing.G1Point[](7);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x15c105b865ccf3c4291c2cd98a8e2570840d66b275ef48edc119d90f506f4868), uint256(0x0616b84e66781f2682b00f4c17489db31a77ced72e381fef5f3a62b8b81226ab));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x101418a58272b695e23ef6e3cc1735ea192f8d054146dc299b085ccad7bf386b), uint256(0x0a80243706a15e9e3263edd1dfe4560b56b61919e1548978e9fd97610731f691));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x2327695d6c321e50f693301e1ccc3b6cd7314cb82ee4b96cb112235377e045f4), uint256(0x298d5afa47ffc7ec47f71be70a4e8942398b35c1f0acea983cc3cfb63756c412));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x128b61b7c4113f9032dbf5944d3f508307d1fb0cfbffc3d18fb27a0d31d48532), uint256(0x2797a1b91a04c61ff989a580b09e09720fc1e24d0fa663c7ea61e2803e5de002));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x18ea1c42739767c5804268eb4a365858391b61f84207a571999d8032d49ea9bc), uint256(0x2878fee34082d0ee46682243e42abc4589b245b04e66fc0e8d40bd60ab1c7e4a));
        vk.gamma_abc[5] = Pairing.G1Point(uint256(0x2295d913ab0584b7b1a08f5ca181084f81a82aeadabb26f9f477f8603340f1b3), uint256(0x0922bc614948f8c8304e2ea0d35f4a9042d1a9074f04214aedfbb1c9613fc1f8));
        vk.gamma_abc[6] = Pairing.G1Point(uint256(0x0a2e11651b41c1ede4baf1fec2440d4ffb09ce0ad740dff4f2c495e4c320cd4a), uint256(0x16e8ce4fb5590d03b79b701f2c75ad02e2fc9d27d9e977e34a759496a1edf4f2));
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
