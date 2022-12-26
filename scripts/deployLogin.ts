import { ethers } from "hardhat";

async function main() {

  const contract = await ethers.getContractFactory("Login");
  const deployedContract = await contract.deploy("0x4E754C96995815C97962305d8A1E7D3ABae96639", "0xEAcf798738c2CA80A23271b1623DC583dDd2672f");
  await deployedContract.deployed()
  console.log(`Contract deployed to address ${deployedContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
