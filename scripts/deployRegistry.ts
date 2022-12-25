import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.getContractFactory("Registry");
  const deployedContract = await contract.deploy("0x955A56f9d9cEb1Fd87177656857a914BA9A1AB6C");
  await deployedContract.deployed()
  console.log(`Contract deployed to address ${deployedContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
