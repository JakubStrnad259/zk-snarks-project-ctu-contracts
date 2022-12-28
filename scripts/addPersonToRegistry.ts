import { ethers } from "hardhat";
import { Registry__factory, Registry } from "../typechain-types";
//@ts-ignore
import sha256 from 'crypto-js/sha256';


async function main() {
    const contract:Registry = Registry__factory.connect("0x334ba9cA2f8Bd013F4c48247b83Eaef6d31aAefe", await ethers.getSigner("0xe8028954C46B22AF700fCb56eCDA6973F444bFA1"));

    //const person = await contract.persons(0);
    //console.log(person);

    //@ts-ignore
    //const result = await contract.verify([proof.proof.a, proof.proof.b, proof.proof.c], 1);
    //console.log(result);
    const id = 12323923;
    const hash = "0x" + sha256(id.toString());
    const somethign = await contract.setPerson(hash, ethers.BigNumber.from("272056514887554346504893268138348088035"), ethers.BigNumber.from("268771572175224303169343049618664189714"));
    console.log(somethign.value);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
