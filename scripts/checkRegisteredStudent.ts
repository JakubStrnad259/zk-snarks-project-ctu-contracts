import { ethers } from "hardhat";
import { Registration__factory, Registration } from "../typechain-types";
//@ts-ignore
import sha256 from 'crypto-js/sha256';

async function main() {
    const contract:Registration = Registration__factory.connect("0x4E754C96995815C97962305d8A1E7D3ABae96639", await ethers.getSigner("0xe8028954C46B22AF700fCb56eCDA6973F444bFA1"));

    const username = "username";
    const hash = "0x" + sha256(username);
    const person = await contract.students(hash);
    console.log(person);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
