import { ethers } from "hardhat";
import { Registry__factory, Registry } from "../typechain-types";
//@ts-ignore
import sha256 from 'crypto-js/sha256';

async function main() {
    const contract:Registry = Registry__factory.connect("0x5F71a7cAfD591152Da715E3fE750622A4fd4243F", await ethers.getSigner("0xe8028954C46B22AF700fCb56eCDA6973F444bFA1"));
    
    const proof = {
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

    const id = 1;
    const hash = "0x" + sha256(id.toString());
    const person = await contract.persons(hash);
    console.log(person);

    //@ts-ignore
    const result = await contract.verify(hash, [proof.proof.a, proof.proof.b, proof.proof.c]);
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
