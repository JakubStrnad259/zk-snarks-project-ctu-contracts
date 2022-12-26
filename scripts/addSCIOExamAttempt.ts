import { ethers } from "hardhat";
import { SCIO__factory, SCIO } from "../typechain-types";
//@ts-ignore
import sha256 from 'crypto-js/sha256';


async function main() {
    const contract:SCIO = SCIO__factory.connect("0x5CbF51d45eAAB8d4778c94c0DfcBC27880555072", await ethers.getSigner("0xe8028954C46B22AF700fCb56eCDA6973F444bFA1"));

    //const person = await contract.persons(0);
    //console.log(person);

    //@ts-ignore
    //const result = await contract.verify([proof.proof.a, proof.proof.b, proof.proof.c], 1);
    //console.log(result);
    const proof = {
        "scheme": "g16",
        "curve": "bn128",
        "proof": {
          "a": [
            "0x26d9124721dc466579ecdd9ab83cf437b339c72b37ffe70131d563058ecee2b4",
            "0x224f9cb9fb3fde3a164d575cf4a546873fd7b8b25773a3cf0347fdea5004800c"
          ],
          "b": [
            [
              "0x0c50699d7ed3c45a8a78c5418b1bfce7af883c7ac06f3218166a209d9dcae02d",
              "0x0d9bd660e0e0fd4a93f68334570d2fe8123b48d64d03976d00752498906fb501"
            ],
            [
              "0x13c85307ffad12430b2c0d3fd6f9465df5e489175b415b7bc2d7a34873a1eafa",
              "0x00d94ce93fbe5bd18e3545769b4ac74000cc756cfce334ae0958cef41b183def"
            ]
          ],
          "c": [
            "0x27bd6cf3dda8bad42b1dc85f2058081d202daf25b26edfd43d6dd683c52e4f31",
            "0x25c792e84e3a57583c39f0ec6518d706e9bfb6c7cb30d2488067e57f8ec7cdb8"
          ]
        },
        "inputs": [
          "0x000000000000000000000000000000000000000000000000000000000000005a",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
    }
    const id = 1;
    const hash = "0x" + sha256(id.toString());
    //@ts-ignore
    const somethign = await contract.addExamResult(hash, [proof.proof.a, proof.proof.b, proof.proof.c], 1);
    console.log(somethign.value);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
