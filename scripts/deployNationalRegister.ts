import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.getContractFactory("NationalRegister");
  const deployedContract = await contract.deploy("0xA5c13a1837D03bA0ECb6F1CA2597bE46f78dAef4");
  await deployedContract.deployed()
  console.log(`Contract deployed to address ${deployedContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
