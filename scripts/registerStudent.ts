import { ethers } from "hardhat";
import { Registration__factory, Registration } from "../typechain-types";
//@ts-ignore
import sha256 from 'crypto-js/sha256';
import BigNumber from "bignumber.js";

async function main() {
    const contract:Registration = Registration__factory.connect("0x4E754C96995815C97962305d8A1E7D3ABae96639", await ethers.getSigner("0xe8028954C46B22AF700fCb56eCDA6973F444bFA1"));

    const id = 1;
    const hash = "0x" + sha256(id.toString());

    const username = "username";
    const usernameHash = "0x" + sha256(username);

    const proof = {
        "scheme": "g16",
        "curve": "bn128",
        "proof": {
          "a": [
            "0x2861206517d39c4c4ade9ff2062494874879c00a54d667edb630d36859092ba2",
            "0x23b4741063fef5289eb2f0d847a85792e7173d7976cc9118d843884ee635a1bf"
          ],
          "b": [
            [
              "0x0e7718873232df72806afc07cf2adaecbe7e287be5e800e3673cea8a5f622b4c",
              "0x1e1a6aca05a9065f697812e2780316ed2904e82aa50a8af63f60a4a536cc72bd"
            ],
            [
              "0x0751a94996807ad6088d37af84228b0d681621dba57d13f6da1ba8e8f7736c12",
              "0x04f34e269cae98f0491535624ee7b235166a75d6ecb603e9c6de91bfa43897f5"
            ]
          ],
          "c": [
            "0x0b1d002ff92e070f35d63fdff8aadcf6d2cf1228f85d7c90b5e9b45458f58f5e",
            "0x148b68d6ab1ad1bee8a806da4ae709706321af66e1ebbe5fa1ecf81be8678891"
          ]
        },
        "inputs": [
          "0x00000000000000000000000000000000c6481e22c5ff4164af680b8cfaa5e8ed",
          "0x000000000000000000000000000000003120eeff89c4f307c4a6faaae059ce10",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
      }

    const IDproof = {
        "scheme": "g16",
        "curve": "bn128",
        "proof": {
          "a": [
            "0x19adc9c6df5753ae14590be5c6abe1e054932121ad5a9b479ebfc5cc58ec0786",
            "0x0f639c858c25b9608b6d44f04bcc5436e5a3e4912607c6c03f69c68a1461e743"
          ],
          "b": [
            [
              "0x16f2459cac3182800bd8c85edc80ec90a57c527412c2a5a173422bcff35ad18a",
              "0x103f40f83ebfb502de8681cfa8d0c4e5c3d539f0fc8bb17b5801e8dc7edc3b9a"
            ],
            [
              "0x29e6c699186a8f842ec35525bc2b46c3908f99318c536d98968442de0b3d4273",
              "0x00308e1a2e2fa567aa5c8bfb3ed35f5c1e0a511805db6e2e3ff11d37b30289bc"
            ]
          ],
          "c": [
            "0x0cc4fb1f672ade3988fee6c5d98beec686cd07a62edd1e570bcd7f66de1bf919",
            "0x17126864110d78b690df0a3d0eb2ae1c72f086ddf52b3d12a0e0f4d3eb332b81"
          ]
        },
        "inputs": [
          "0x00000000000000000000000000000000c46b22af700fcb56ecda6973f444bfa1",
          "0x00000000000000000000000000000000d8e6ef25573a61b2a6c82f081e9d3f52",
          "0x00000000000000000000000000000000365d339d548280ac9e6d187f9f4dd653",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
    }
    let passInputs = [ethers.BigNumber.from(proof.inputs[0]), ethers.BigNumber.from(proof.inputs[1]), ethers.BigNumber.from(proof.inputs[2])];
    console.log(passInputs);
    const result = await contract.register(
        hash, 
        usernameHash, 
        [ethers.BigNumber.from(proof.inputs[0]), ethers.BigNumber.from(proof.inputs[1]), ethers.BigNumber.from(proof.inputs[2])],
        //@ts-ignore
        [proof.proof.a, proof.proof.b, proof.proof.c],
        [IDproof.proof.a, IDproof.proof.b, IDproof.proof.c]
    );

    console.log(result);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
