import { ethers } from "hardhat";

async function main() {

  const contract = await ethers.getContractFactory("SCIO");
  const deployedContract = await contract.deploy("0xDed28B8B8911DB250bfec897e7380Ede6642850b", "0x9352CC61ed4ca9219D245ad99D06a983676CBb80");
  await deployedContract.deployed()
  console.log(`Contract deployed to address ${deployedContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
