import { ethers } from "hardhat";
import { Registry__factory, Registry, RegistryVerifier, RegistryVerifier__factory } from "../typechain-types";
//@ts-ignore
import sha256 from 'crypto-js/sha256';

async function main() {
    const contract:Registry = Registry__factory.connect("0x334ba9cA2f8Bd013F4c48247b83Eaef6d31aAefe", await ethers.getSigner("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"));
    
    const proof = {
      "scheme": "g16",
      "curve": "bn128",
      "proof": {
        "a": [
          "0x0abe56492c6d803fa8a41a3cf4aca37ba9808e53bccd9bf87e00316c01314458",
          "0x115cee17dcfc61a5b1e218d417856cab35a7e567a3e472d8ae05be00fa01aa64"
        ],
        "b": [
          [
            "0x03e5e7f52b0553cf23e45511eefa2dcf6b9d74e29112d933f9f2a6f5c8f6163a",
            "0x26029827278768bd2fec48686ce5b44aafd773e276e3f63eea93f313a289ae7b"
          ],
          [
            "0x19ee70f9fa373fa0fda65b57bf197ff4e32ee718f696126cb0e3825328a1473e",
            "0x281db762990be88613e08b5da0ef60a4a47ec7f23bbc1f91f6fc728554131345"
          ]
        ],
        "c": [
          "0x1b6fb1125fe3ef49e4bcae11122d489258fc29a6facdbc91e9fae3f31665b50d",
          "0x2ffbcb7f94a4b85f2e2f1ee20064d5ba88f20425ace40ce064e2a1c38491e6bc"
        ]
      },
      "inputs": [
        "0x000000000000000000000000000000001aad88f6f4ce6ab8827279cfffb92266",
        "0x00000000000000000000000000000000ccac2dc9b00118ee5bc07e8ece898ae3",
        "0x00000000000000000000000000000000ca33859b94c653f57b0e506ffd33ef12",
        "0x0000000000000000000000000000000016ddf1e14bab85bc9dff19d2eace6c5a",
        "0x000000000000000000000000000000000c03148e1b3c2daa77f8e1029efe229a",
        "0x0000000000000000000000000000000000000000000000000000000000000001"
      ]
    }
    
    console.log(proof.inputs.slice(-3));
    const id = 12323923;
    const hash = "0x" + sha256(id.toString());
    const person = await contract.persons(hash);
    console.log(person);

    //@ts-ignore
    const result = await contract.verify(hash, [proof.proof.a, proof.proof.b, proof.proof.c], proof.inputs.slice(-3));
    console.log(result);
    //const somethign = await contract.persons(1);
    //console.log(somethign);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
