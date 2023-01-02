import { ethers } from "hardhat";

async function main() {

    const RegistryVerifier = await ethers.getContractFactory("RegistryVerifier");
    const Registry = await ethers.getContractFactory("Registry");

    const SCIOVerifier = await ethers.getContractFactory("SCIOVerifier");
    const SCIO = await ethers.getContractFactory("SCIO");

    const PasswordVerifier = await ethers.getContractFactory("PasswordVerifier");
    const Registration = await ethers.getContractFactory("Registration");

    const LoginVerifier = await ethers.getContractFactory("LoginVerifier");
    const Login = await ethers.getContractFactory("Login");


    const registryVerifier = await RegistryVerifier.deploy();
    await registryVerifier.deployed();

    const registry = await Registry.deploy(registryVerifier.address);
    await registry.deployed();

    console.log("Registry with verifier deployed");

    const scioVerifier = await SCIOVerifier.deploy();
    await scioVerifier.deployed();

    const scio = await SCIO.deploy(scioVerifier.address, registry.address);
    await scio.deployed();

    console.log("SCIO with verifier deployed");

    const passwordVerifier = await PasswordVerifier.deploy();
    await passwordVerifier.deployed();

    const registration = await Registration.deploy(passwordVerifier.address, scio.address);
    await registration.deployed();

    console.log("CTU Registration with verifier deployed");

    const loginVerifier = await LoginVerifier.deploy();
    await loginVerifier.deployed();

    const login = await Login.deploy(registration.address, loginVerifier.address);
    await login.deployed();

    console.log("Login with verifier deployed");
    
    const addressMap = {
        "registry": registry.address,
        "registryVerifier": registryVerifier.address,
        "scio": scio.address,
        "scioVerifier": scioVerifier.address,
        "registration": registration.address,
        "passwordVerifier": passwordVerifier.address,
        "login": login.address,
        "loginVerifier": loginVerifier.address, 
    }
    console.log("Blockchain infrastructure deployed: ", addressMap);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
