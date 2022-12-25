import { ethers } from "hardhat";
import { Registry__factory, Registry } from "../typechain-types";
//@ts-ignore
import sha256 from 'crypto-js/sha256';


async function main() {
    const contract:Registry = Registry__factory.connect("0x5F71a7cAfD591152Da715E3fE750622A4fd4243F", await ethers.getSigner("0xe8028954C46B22AF700fCb56eCDA6973F444bFA1"));

    //const person = await contract.persons(0);
    //console.log(person);

    //@ts-ignore
    //const result = await contract.verify([proof.proof.a, proof.proof.b, proof.proof.c], 1);
    //console.log(result);
    const id = 1;
    const hash = "0x" + sha256(id.toString());
    const somethign = await contract.setPerson(hash, "0x00000000000000000000000000000000d8e6ef25573a61b2a6c82f081e9d3f52", "0x00000000000000000000000000000000365d339d548280ac9e6d187f9f4dd653", "0x0000000000000000000000000000000000000000000000000000000000000001");
    console.log(somethign.value);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
