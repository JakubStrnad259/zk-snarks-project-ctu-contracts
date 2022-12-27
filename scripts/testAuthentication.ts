import { ethers } from "hardhat";
import { Login, Login__factory } from "../typechain-types";
//@ts-ignore
import sha256 from 'crypto-js/sha256';

async function main() {
    const contract:Login = Login__factory.connect("0x2d4C2FBa5c168290c2de591f5Bb6C3d56DF07b1a", await ethers.getSigner("0xe8028954C46B22AF700fCb56eCDA6973F444bFA1"));
    const proof = {
      "scheme": "g16",
      "curve": "bn128",
      "proof": {
        "a": [
          "0x13d1597e4d12a4495bceb228ebf668f93d9dce43b984a3debf9cec571c2bad50",
          "0x13ae0a01507b5274f9b76f8b176aebde90e0726107cc068e6c41acae85f0db9a"
        ],
        "b": [
          [
            "0x2abcdc511f588a019673ca2a3f513aba835203cb1504f2ed84b9c035f6d59c41",
            "0x2be9574eaffa3dfb37b2623da6180c3802e8779bc189b690de1e61dc42937fcc"
          ],
          [
            "0x2cdfbde89de5454f5aacf7b279f244cb9540be45d8804fdf559ee7f3ce83c1da",
            "0x21e36a59e0fcefb778775850b8a2d28cad1ea96be573b68850fdd65679d19854"
          ]
        ],
        "c": [
          "0x1e0c6fbc0f8db07f18e9452b7fa9fb9ffb74e3de57dc5674d62b74eedb99d07c",
          "0x06fc6507912f6cb963d0bc5a7cbe107a6f20db30110c68298c951dc29a8ad2a8"
        ]
      },
      "inputs": [
        "0x00000000000000000000000000000000c46b22af700fcb56ecda6973f444bfa1",
        "0x00000000000000000000000000000000c6481e22c5ff4164af680b8cfaa5e8ed",
        "0x000000000000000000000000000000003120eeff89c4f307c4a6faaae059ce10",
        "0x0000000000000000000000000000000063c6cbd853585daaf2d7150ab1620cc8",
        "0x0000000000000000000000000000000011e1c35ae05af7f12a7de6d52dbe6124",
        "0x0000000000000000000000000000000000000000000000000000000000000001"
      ]
    };
    const username = "username";
    const hash = "0x" + sha256(username);
    //@ts-ignore
    const result = await contract.authenticate(
      hash, 
      //@ts-ignore
      [
        proof.proof.a, 
        proof.proof.b, 
        proof.proof.c,
      ], 
      [
        ethers.BigNumber.from(proof.inputs[3]),
        ethers.BigNumber.from(proof.inputs[4]),
        ethers.BigNumber.from(proof.inputs[5]),
      ]
      );
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
