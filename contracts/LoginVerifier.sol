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

contract LoginVerifier {
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
        vk.alpha = Pairing.G1Point(uint256(0x06f12812bcd5cc69ef696173caf09d789f6d4e5b80d68cc572e90fafb155b10a), uint256(0x0cee07a7c44b2f0bad43e0f72626b874eedab5423d2ae5255b1eb6d248b39f28));
        vk.beta = Pairing.G2Point([uint256(0x0856a9e2a49fceac4178d245ace5b7f0ccdf3ebf0f4c0da88f1667d0f1488a89), uint256(0x064ab5426c2abb658a8cd3ea7ca3065adee89094ed4795932e209828646a62b1)], [uint256(0x2ede28cd9a67b2358da71ba9369748db71bd92c37b0e4da9ac3000e8071dfdab), uint256(0x2bc5d8646921410f6edfef5ae3a46fbd0acada96846d9fa642853097cb977364)]);
        vk.gamma = Pairing.G2Point([uint256(0x0c6b16c7fb5d65dad6a78faeee5da79e196a2a1e94e7fb43a2159e9c3f6caffe), uint256(0x0730bf9e0c4f1d2979483a38e41923733fde1da679b52c4497beb71311b92353)], [uint256(0x184fd5127d5359c07bde1d56bf15985542980f3824f970cfb4888afa4f116d12), uint256(0x17754e645c110ea550362c646c2f21c03e3a577767828e4b80b439cb74da1c50)]);
        vk.delta = Pairing.G2Point([uint256(0x10f942c504cd7f79d93db170ea7ab3e11d2b11b2745c61339d2b024d74ae0759), uint256(0x05ed9dbe80509a7415980c2891029d76423953ee87e8b344dcb62493dff631c4)], [uint256(0x2b36ab6332e9d1d19a519b9a968df192e27ef6d2f45050534d2adb2098c97b8a), uint256(0x18ab98b69a9ec41afa7179cee4536becd04af8a76dbe710baf289ceb40517faa)]);
        vk.gamma_abc = new Pairing.G1Point[](7);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x062db306c27ffc0bffc6bc3367fb7493fb08d8d9bed74635f2bf44ea10dfcf66), uint256(0x261dd494f605120891e2200b373523bb59438b0a459ca4e599b5189dbd14e605));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x21d6dda6887f516e20e787d9e41e0f7185423c775f1b5604bc55132a437352ea), uint256(0x153ddd337c5eda507e99587595120fd7ccbb8ca2c623d863dbba6ae31b0bc85e));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x0a9b5e7755d55e05c611cb0edd1a2f3e11ace8e2d22e50715e0b0d1a95d5f6b4), uint256(0x2096e8eb9f6567c976a094eb114a955b20aad3ba124a720264ab49ccbdc0bcd2));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x07172c6a9a62648b8d0863d3533fbadcf477e1ad60a4e221c12406ca5d01d8df), uint256(0x12f9e59d8eb0178e784d0adf2a6cf1862446974a84efd4121103f389db349848));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x2d2cc810b9ee355fc9d2d8dd1183e4f8511a45720e8395c980468909710cdbbd), uint256(0x2ac58f22d97c5e767dbe70f648e4b82ffe15d216bbdf57f7a6d49cf63aeffbd0));
        vk.gamma_abc[5] = Pairing.G1Point(uint256(0x14fcd2e294cd8de68a212fd6f140b3c329d9b1ca18b63e8449a7bdc939884c7a), uint256(0x028f5764c098d5fd890c1193d01720f7b8d1bf5b0abf044190bd9384d9061ce3));
        vk.gamma_abc[6] = Pairing.G1Point(uint256(0x0484738d4761f3c82f9200dd349d98f4bbb9c39397c1dadbf218f4c109803371), uint256(0x0b9e627acf328761765a7c49e9c55cc40b9163efebf56df82748be7c342dddf7));
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
