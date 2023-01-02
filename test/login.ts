import { ethers } from "hardhat";
import { Registration, Registry, RegistryVerifier, PasswordVerifier, SCIO, SCIOVerifier, LoginVerifier, Login } from "../typechain-types";
//@ts-ignore
import sha256 from 'crypto-js/sha256';
import { expect, use } from "chai";
import { initialize } from 'zokrates-js';


const fileSystemResolver = (from: string, to: string) => {
    const fs = require("fs");
    const path = require("path");
    const location = path.resolve(path.dirname(path.resolve(from)), to);
    const source = fs.readFileSync(location).toString();
    return source;
};

describe("CTU Login", function() {
    let tester: any;
    let addr1: any;
    let addrs: any;
    let registry: Registry;
    let registryVerifier: RegistryVerifier;
    let registration: Registration;
    let passwordVerifier: PasswordVerifier;
    let scio: SCIO;
    let scioVerifier: SCIOVerifier;
    let login: Login;
    let loginVerifier: LoginVerifier;
    let RegistryContract;
    let RegistryVerifierContract;
    let RegistrationContract;
    let PasswordVerifier;
    let SCIOContract;
    let SCIOVerifierContract;
    let LoginContract;
    let LoginVerifierContract;

    const generateRegistryAccessHash = async(id: number, salt: number) => {
        const provider = await initialize();
        const source: string = fileSystemResolver("project", "zokrates/utils/ComputeRegistryAccessHash.zok");
        const artifacts = provider.compile(source);
        const { witness, output } = provider.computeWitness(artifacts, [id.toString(), salt.toString()]);
        var parsedOutput = JSON.parse(output);
        return parsedOutput;
    }

    const generateRegistryPublicHash = async(id: number, salt: number, sender: string) => {
        const provider = await initialize();
        const source: string = fileSystemResolver("project", "zokrates/utils/ComputeRegistryHash.zok");
        const artifacts = provider.compile(source);
        const { witness, output } = provider.computeWitness(artifacts, [id.toString(), salt.toString(), ethers.BigNumber.from("0x" + sender.slice(-32)).toString()]);
        var parsedOutput = JSON.parse(output);
        return parsedOutput;
    }

    const generateRegistryProof = async(id: number, salt: number, sender: string, passwordHash: any, publicHash: any) => {
        const provider = await initialize();
        const source: string = fileSystemResolver("project", "zokrates/authorities/RegistryVerifier.zok");
        const artifacts = provider.compile(source);
        const { witness, output } = provider.computeWitness(
            artifacts,
            [
                id.toString(), 
                salt.toString(), 
                ethers.BigNumber.from("0x" + sender.slice(-32)).toString(),
                [
                    passwordHash[0].toString(),
                    passwordHash[1].toString(),
                ],
                [
                    publicHash[0].toString(),
                    publicHash[1].toString(),
                ],
            ]
        );

        const fs = require("fs");
        const file = fs.readFileSync("./test/keys/registryProving.key");
        const key = new Uint8Array(file);
        return provider.generateProof(artifacts.program, witness, key);
    }

    const generateSCIOExamProof = async(id: number, threshold: number) => {
        const provider = await initialize();
        const source: string = fileSystemResolver("project", "zokrates/authorities/SCIOVerifier.zok");
        const artifacts = provider.compile(source);
        const { witness, output } = provider.computeWitness(
            artifacts,
            [
                id.toString(), 
                threshold.toString(),
            ]
        );

        const fs = require("fs");
        const file = fs.readFileSync("./test/keys/scioProving.key");
        const key = new Uint8Array(file);
        return provider.generateProof(artifacts.program, witness, key);
    }

    const addExamAttempt = async(id: number, proof: any, parameter: any) => {
        const hash = "0x" + sha256(id.toString());
        //@ts-ignore
        return await scio.addExamResult(hash, [proof.a, proof.b, proof.c], parameter);
    }

    const addPersonToRegistry = async(id: number, salt: number) => {
        const hash = "0x" + sha256(id.toString());
        const accessHash = await generateRegistryAccessHash(id, salt);
        return await registry.setPerson(
            hash,
            ethers.BigNumber.from(accessHash[0]),
            ethers.BigNumber.from(accessHash[1])
        );
    }

    const getPasswordUINT128Elements = async(password: string) => {
        const bytes = Buffer.from(password, 'utf8');

        const elements = [];
        let start = 0;
        let end = 32;
        for (let k = 0; k < 4; k++) {
            if (bytes.slice(start, end).byteLength != 0) {
                elements.push(
                    ethers.BigNumber.from("0x" + bytes.slice(start, end).toString("hex")).toString()
                )
            } else {
                elements.push(
                    "0"
                )
            }

            start += 32;
            end += 32;
        }
        return elements;
    }

    const generateHashFromString = async(password: string) => {
        const passwordElements = await getPasswordUINT128Elements(password);
        const provider = await initialize();
        const source: string = fileSystemResolver("project", "zokrates/utils/ComputePasswordHash.zok");
        const artifacts = provider.compile(source);
        const { witness, output } = provider.computeWitness(
            artifacts,
            [
                passwordElements
            ]
        );

        var parsedOutput = JSON.parse(output);
        return parsedOutput;
    }

    const generatePasswordProof = async(password: string) => {
        const passwordElements = await getPasswordUINT128Elements(password);
        const passwordHash = await generateHashFromString(password);
        const provider = await initialize();
        const source: string = fileSystemResolver("project", "zokrates/registration/Registration.zok");
        const artifacts = provider.compile(source);
        const { witness, output } = provider.computeWitness(
            artifacts,
            [
                passwordElements,
                passwordHash,
            ]
        );
        const fs = require("fs");
        const file = fs.readFileSync("./test/keys/registrationProving.key");
        const key = new Uint8Array(file);
        return provider.generateProof(artifacts.program, witness, key);
    }

    const registerStudent = async(id: number, registryProof: any, passwordProof:any, registryPublicInput: any, passwordPublicInput: any, username: string, password: string) => {
        const hash = "0x" + sha256(id.toString());
        const usernameHash = "0x" + sha256(username);

        return await registration.register(
            hash, 
            usernameHash,
            passwordPublicInput, 
            registryPublicInput,
            //@ts-ignore
            [passwordProof.a, passwordProof.b, passwordProof.c], 
            [registryProof.a, registryProof.b, registryProof.c]
        );
    }

    const computeLoginHash = async(password: string, sender: string) => {
        const passwordElements = await getPasswordUINT128Elements(password);
        const provider = await initialize();
        const source: string = fileSystemResolver("project", "zokrates/utils/ComputeLoginHash.zok");
        const artifacts = provider.compile(source);
        const { witness, output } = provider.computeWitness(
            artifacts,
            [
                passwordElements,
                ethers.BigNumber.from("0x" + sender.slice(-32)).toString(),
            ]
        );
        var parsedOutput = JSON.parse(output);
        return parsedOutput;
    }

    const generateLoginProof = async(username: string, password: string, sender: string) => {
        const passwordElements = await getPasswordUINT128Elements(password);
        const passwordHash = await generateHashFromString(password);
        const publicHash = await computeLoginHash(password, sender);
        const provider = await initialize();
        const source: string = fileSystemResolver("project", "zokrates/login/Login.zok");
        const artifacts = provider.compile(source);

        const { witness, output } = provider.computeWitness(
            artifacts,
            [
                passwordElements,
                ethers.BigNumber.from("0x" + sender.slice(-32)).toString(),
                passwordHash,
                publicHash,
            ]
        );

        const fs = require("fs");
        const file = fs.readFileSync("./test/keys/loginProving.key");
        const key = new Uint8Array(file);
        return provider.generateProof(artifacts.program, witness, key);
    }

    const authenticateStudent = async(username: string, proof: any, inputs: any) => {
        const usernameHash = "0x" + sha256(username);
        return await login.authenticate(
            usernameHash,
            //@ts-ignore
            [proof.a, proof.b, proof.c],
            inputs
        )
    }


    beforeEach(async() => {
        [tester, addr1, ...addrs] = await ethers.getSigners();

        RegistryContract = await ethers.getContractFactory("Registry");
        RegistryVerifierContract = await ethers.getContractFactory("RegistryVerifier");
        RegistrationContract = await ethers.getContractFactory("Registration");
        PasswordVerifier = await ethers.getContractFactory("PasswordVerifier");
        SCIOContract = await ethers.getContractFactory("SCIO");
        SCIOVerifierContract = await ethers.getContractFactory("SCIOVerifier");
        LoginContract = await ethers.getContractFactory("Login");
        LoginVerifierContract = await ethers.getContractFactory("LoginVerifier");

        registryVerifier = await RegistryVerifierContract.deploy();
        await registryVerifier.deployed();

        registry = await RegistryContract.deploy(registryVerifier.address);
        await registry.deployed();

        scioVerifier = await SCIOVerifierContract.deploy();
        await scioVerifier.deployed();

        scio = await SCIOContract.deploy(scioVerifier.address, registry.address);
        await scio.deployed();

        passwordVerifier = await PasswordVerifier.deploy();
        await passwordVerifier.deployed();

        registration = await RegistrationContract.deploy(passwordVerifier.address, scio.address);
        await registration.deployed();

        loginVerifier = await LoginVerifierContract.deploy();
        await loginVerifier.deployed();

        login = await LoginContract.deploy(registration.address, loginVerifier.address);
        await login.deployed();
    });

    it("It should login user with valid proofs and correct address", async() => {
        const id: number = 12323923;
        const salt: number = 22392392;
        const senderAddress: string = tester.address;

        const username = "username";
        const password = "password";

        // add person to registry
        await addPersonToRegistry(id, salt);

        // add three exam attempts
        let proof = await generateSCIOExamProof(id, 90);
        await addExamAttempt(id, proof.proof, proof.inputs.slice(-1)[0]);

        // register student
        // using just for pass hash as input
        const accessHash = await generateRegistryAccessHash(id, salt);
        // using just for publicHash as input
        const publicHash = await generateRegistryPublicHash(id, salt, senderAddress);
        // calculating actual proof
        const registryProof = await generateRegistryProof(
            id, 
            salt, 
            senderAddress, 
            accessHash,
            publicHash
        );
    
        const passwordProof = await generatePasswordProof(password);

        await registerStudent(
            id, 
            registryProof.proof, 
            passwordProof.proof, 
            registryProof.inputs.slice(-3),
            passwordProof.inputs, 
            username, 
            password
        );

        const loginProof = await generateLoginProof(username, password, senderAddress);
        const result = await authenticateStudent(
            username,
            loginProof.proof,
            loginProof.inputs.slice(-3),
        );
        expect(result).to.be.true;
    });

    it("Should return false if password is incorrect", async() => {
        const id: number = 12323923;
        const salt: number = 22392392;
        const senderAddress: string = tester.address;

        const username = "username";
        const password = "password";

        // add person to registry
        await addPersonToRegistry(id, salt);

        // add three exam attempts
        let proof = await generateSCIOExamProof(id, 90);
        await addExamAttempt(id, proof.proof, proof.inputs.slice(-1)[0]);

        // register student
        // using just for pass hash as input
        const accessHash = await generateRegistryAccessHash(id, salt);
        // using just for publicHash as input
        const publicHash = await generateRegistryPublicHash(id, salt, senderAddress);
        // calculating actual proof
        const registryProof = await generateRegistryProof(
            id, 
            salt, 
            senderAddress, 
            accessHash,
            publicHash
        );
    
        const passwordProof = await generatePasswordProof(password);

        await registerStudent(
            id, 
            registryProof.proof, 
            passwordProof.proof, 
            registryProof.inputs.slice(-3),
            passwordProof.inputs, 
            username, 
            password
        );

        const differentPassword = "password1"

        const loginProof = await generateLoginProof(username, differentPassword, senderAddress);
        const result = await authenticateStudent(
            username,
            loginProof.proof,
            loginProof.inputs.slice(-3),
        );
        expect(result).to.be.false;
    });

    it("Should return false if proof correct but different address", async() => {
        const id: number = 12323923;
        const salt: number = 22392392;
        const senderAddress: string = tester.address;

        const username = "username";
        const password = "password";

        // add person to registry
        await addPersonToRegistry(id, salt);

        // add three exam attempts
        let proof = await generateSCIOExamProof(id, 90);
        await addExamAttempt(id, proof.proof, proof.inputs.slice(-1)[0]);

        // register student
        // using just for pass hash as input
        const accessHash = await generateRegistryAccessHash(id, salt);
        // using just for publicHash as input
        const publicHash = await generateRegistryPublicHash(id, salt, senderAddress);
        // calculating actual proof
        const registryProof = await generateRegistryProof(
            id, 
            salt, 
            senderAddress, 
            accessHash,
            publicHash
        );
    
        const passwordProof = await generatePasswordProof(password);

        await registerStudent(
            id, 
            registryProof.proof, 
            passwordProof.proof, 
            registryProof.inputs.slice(-3),
            passwordProof.inputs, 
            username, 
            password
        );
        
        const loginProof = await generateLoginProof(username, password, addr1.address);
        const result = await authenticateStudent(
            username,
            loginProof.proof,
            loginProof.inputs.slice(-3),
        );
        expect(result).to.be.false;
    });
});
