import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.getContractFactory("Registry");
  const deployedContract = await contract.deploy("0xA9E935204398A342F8B9C754E53baA89dC72FaAA");
  await deployedContract.deployed()
  console.log(`Contract deployed to address ${deployedContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
