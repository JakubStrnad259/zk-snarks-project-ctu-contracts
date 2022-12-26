import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.getContractFactory("Registry");
  const deployedContract = await contract.deploy("0x64ad146abc687Ef341E3E9281A77CFC993007C6a");
  await deployedContract.deployed()
  console.log(`Contract deployed to address ${deployedContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
