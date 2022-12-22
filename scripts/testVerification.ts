import { ethers } from "hardhat";
import { Verifier__factory, Verifier } from "../typechain-types";
async function main() {
    const contract:Verifier = Verifier__factory.connect("0x768f08B43E6eFd2895775dDB53ba11999556e8BD", await ethers.getSigner("0xe8028954C46B22AF700fCb56eCDA6973F444bFA1"));
    
    const proof = {
        "scheme": "g16",
        "curve": "bn128",
        "proof": {
          "a": [
            "0x0f5d1fdd5d20724c41ce8c2c1e188d5ba75278da14f5a583489506a9e4d8f617",
            "0x1bbb42fcf4eb82231ab262b187d9b8bed4bf71bbab8ac676229bd0d3655315f2"
          ],
          "b": [
            [
              "0x24c5c0bf071600ee5761ca094295c056b9e9d1b26eaac8b02805650453df5d42",
              "0x0e3bd44f6d7cb68b7603f3a2895a720e103f8f720dc8fd7f1124e9dab6deeefc"
            ],
            [
              "0x14c340bd76384d6d6617bd5da24f1735c2f05d5559ec6162e80fb7fd3a8c5dc9",
              "0x1167f9846e9dcafa5aaddb384b0b7dabb841bce343ff8d9de2df0fc707fbdf77"
            ]
          ],
          "c": [
            "0x041bb19734dd7a78ed95a50b63ef9b717f62604d99d4bafb3c8a25e5c59113ac",
            "0x1daa5078d2128f121a61b931daddb3247e2d12f81724ae671ab9a8fb2c0d6e0d"
          ]
        },
        "inputs": [
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x000000000000000000000000000000000000000000000000000000000000000a",
          "0x00000000000000000000000000000000c6481e22c5ff4164af680b8cfaa5e8ed",
          "0x000000000000000000000000000000003120eeff89c4f307c4a6faaae059ce10",
          "0x00000000000000000000000000000000e8eb2fdb40e410c75dad2860c9506da8",
          "0x00000000000000000000000000000000444cc369ef2b62bd90433fe7c46a4aff",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
    }

    const result = await contract.verifyTx([proof.proof.a, proof.proof.b, proof.proof.c], proof.inputs);
    console.log(result);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
