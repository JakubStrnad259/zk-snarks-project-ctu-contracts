import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.getContractFactory("Registry");
  const deployedContract = await contract.deploy("0xb86564Bd884501Ae755f2de3FA92075C5Eb97723");
  await deployedContract.deployed()
  console.log(`Contract deployed to address ${deployedContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
