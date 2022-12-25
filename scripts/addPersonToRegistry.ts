import { ethers } from "hardhat";
import { Registry__factory, Registry } from "../typechain-types";
import {BigNumber} from "bignumber.js";

async function main() {
    const contract:Registry = Registry__factory.connect("0xd7609F0ab8bc33FF92e05E4bFA9C7D8d135195de", await ethers.getSigner("0xe8028954C46B22AF700fCb56eCDA6973F444bFA1"));

    //const person = await contract.persons(0);
    //console.log(person);

    //@ts-ignore
    //const result = await contract.verify([proof.proof.a, proof.proof.b, proof.proof.c], 1);
    //console.log(result);
    const somethign = await contract.setPerson(1, new BigNumber(288312325821337899595878013795091431250), new BigNumber(72262242248095005909660024035062175315), 1)
    console.log(somethign);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
