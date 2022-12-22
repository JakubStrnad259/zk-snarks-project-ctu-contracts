import { ethers } from "hardhat";

async function main() {

  const contract = await ethers.getContractFactory("Verifier");
  const deployedContract = await contract.deploy();
  await deployedContract.deployed()
  console.log(`Contract deployed to address ${deployedContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
