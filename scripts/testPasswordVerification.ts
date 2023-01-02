import { ethers } from "hardhat";
import { PasswordVerifier, PasswordVerifier__factory } from "../typechain-types";
//@ts-ignore
import sha256 from 'crypto-js/sha256';

async function main() {
    const contract:PasswordVerifier = PasswordVerifier__factory.connect("0x1CCa75CD4d70680Bc2798557A9D3A5B1f36D35DD", await ethers.getSigner("0xe8028954C46B22AF700fCb56eCDA6973F444bFA1"));
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


    const inputs = proof.inputs;
    //@ts-ignore
    const result = await contract.verifyTx([proof.proof.a, proof.proof.b, proof.proof.c], [ethers.BigNumber.from(inputs[0]), ethers.BigNumber.from(inputs[1]), ethers.BigNumber.from(inputs[2])]);
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
