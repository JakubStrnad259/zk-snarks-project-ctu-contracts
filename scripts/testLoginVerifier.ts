import { ethers } from "hardhat";
import { LoginVerifier, LoginVerifier__factory } from "../typechain-types";
//@ts-ignore
import sha256 from 'crypto-js/sha256';

async function main() {
    const contract:LoginVerifier = LoginVerifier__factory.connect("0xEAcf798738c2CA80A23271b1623DC583dDd2672f", await ethers.getSigner("0xe8028954C46B22AF700fCb56eCDA6973F444bFA1"));
    const proof = {
        "scheme": "g16",
        "curve": "bn128",
        "proof": {
          "a": [
            "0x1ca01198a6d39f1db3ed12c02af27ce9e13ad73afc87ef3e069a99496b0b3a75",
            "0x138bfc0984add7bb49220dc6ff11de61044c189a9f733031ea8e64796cabc75f"
          ],
          "b": [
            [
              "0x074e69635213b969270c720613869711554c3770fd9d5d0f847b89077facece7",
              "0x2388cc855bdfc0ec66d44ea4eb1c7fa85f5bb45d16cc602a1b73bf2d915d0ff5"
            ],
            [
              "0x0f72e7e00f26fc00d46a1610714f672ebf1e8929a02e93b4324fcbf80a1755ac",
              "0x224a69f9e368f40ec98dfd6b984984c35f85c4de8b6ae860ad96924d972f6936"
            ]
          ],
          "c": [
            "0x22624a4af7d1020cb09609ee526d337ac4b45dc396b1fb6ef46c2f23ed617697",
            "0x06c547aa2cab872a48f6640ab832b18852f4e62ae86c2e7a283e042cef62ef09"
          ]
        },
        "inputs": [
          "0x00000000000000000000000000000000c46b22af700fcb56ecda6973f444bfa1",
          "0x0000000000000000000000000000000063c6cbd853585daaf2d7150ab1620cc8",
          "0x0000000000000000000000000000000011e1c35ae05af7f12a7de6d52dbe6124",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
    };
    const inputs = proof.inputs;
    //@ts-ignore
    const result = await contract.verifyTx([proof.proof.a, proof.proof.b, proof.proof.c], [ethers.BigNumber.from(inputs[0]), ethers.BigNumber.from(inputs[1]), ethers.BigNumber.from(inputs[2]), ethers.BigNumber.from(inputs[3])]);
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
