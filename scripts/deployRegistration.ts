import { ethers } from "hardhat";

async function main() {

  const contract = await ethers.getContractFactory("Registration");
  const deployedContract = await contract.deploy("0x1CCa75CD4d70680Bc2798557A9D3A5B1f36D35DD", "0x5CbF51d45eAAB8d4778c94c0DfcBC27880555072");
  await deployedContract.deployed()
  console.log(`Contract deployed to address ${deployedContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
