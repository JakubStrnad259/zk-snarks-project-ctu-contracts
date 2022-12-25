import { ethers } from "hardhat";
import { Registry__factory, Registry } from "../typechain-types";
async function main() {
    const contract:Registry = Registry__factory.connect("0x7Fa8e3A31fB26Ca7507AAe71a108620A0c890b30", await ethers.getSigner("0xe8028954C46B22AF700fCb56eCDA6973F444bFA1"));
    
    const proof = {
        "scheme": "g16",
        "curve": "bn128",
        "proof": {
          "a": [
            "0x1f04c4d02c87e56310d588976633952b653af3d808934f390eb3fa2cb7a081ce",
            "0x1c12b3b92f8446cfe45038894fea03fbd11e9d532f8d6eb12116cd390e7deb03"
          ],
          "b": [
            [
              "0x1c852cb2cf2c424a6b83f8738d475142b66054d92c8e83a7c97d1a8a0ad723c5",
              "0x03453802be4c473f842605ecc6eaa3a6ec044ac20d2bb402fe7ee84347a0ec65"
            ],
            [
              "0x23906e88e492c6c6e621d748184b600a63d40361965f6ccb414ceb4d5cbf97fd",
              "0x1aba00510186630ea5156e139bf00bdbabf094679ee709d749aee3494b1eb6db"
            ]
          ],
          "c": [
            "0x04340de77c425f375f23c3dafbc2838d70fd04b6ca4f5869de743d4243bf4f25",
            "0x13baf45567c0e3ff5fbc832fba4629ebb490ce4a0777243004bdeed910ee15bb"
          ]
        },
        "inputs": [
          "0x000000000000000000000000000000001385cb23bfaf901f9fa85e0faec157d1",
          "0x00000000000000000000000000000000bc78c2572d11b3dd0a75671265bb881d"
        ]
    }

    //const person = await contract.persons(0);
    //console.log(person);


    //@ts-ignore
    //const result = await contract.verify([proof.proof.a, proof.proof.b, proof.proof.c], 1);
    //console.log(result);
    const somethign = await contract.test(1);
    console.log(somethign);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
