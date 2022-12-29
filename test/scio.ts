import { ethers } from "hardhat";
import { SCIO, SCIOVerifier } from "../typechain-types";
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
/*
describe("SCIO", function() {
    let tester: any;
    let addr1: any;
    let addrs: any;
    let registry: any;
    let registryVerifier: any;
    let scio: SCIO;
    let scioVerifier: SCIOVerifier;
    let RegistryContract;
    let RegistryVerifierContract;
    let SCIOContract;
    let SCIOVerifierContract;

    const equalProof = (proofFromContract: any, proof: any) => {
        // equal proof and public parameter
        expect(proofFromContract.a[0].toString()).to.be.equal(ethers.BigNumber.from(proof.proof.a[0]));
        expect(proofFromContract.a[1].toString()).to.be.equal(ethers.BigNumber.from(proof.proof.a[1]));
        expect(proofFromContract.b[0][0].toString()).to.be.equal(ethers.BigNumber.from(proof.proof.b[0][0]));
        expect(proofFromContract.b[0][1].toString()).to.be.equal(ethers.BigNumber.from(proof.proof.b[0][1]));
        expect(proofFromContract.b[1][0].toString()).to.be.equal(ethers.BigNumber.from(proof.proof.b[1][0]));
        expect(proofFromContract.b[1][1].toString()).to.be.equal(ethers.BigNumber.from(proof.proof.b[1][1]));
        expect(proofFromContract.c[0].toString()).to.be.equal(ethers.BigNumber.from(proof.proof.c[0]));
        expect(proofFromContract.c[1].toString()).to.be.equal(ethers.BigNumber.from(proof.proof.c[1]));
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

    const getExamAttemptOnIndex = async(id: number, index: number) => {
        const hash = "0x" + sha256(id.toString());
        return await scio.examAttempts(hash, ethers.BigNumber.from(index));
    }

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

    const addPersonToRegistry = async(id: number, salt: number) => {
        const hash = "0x" + sha256(id.toString());
        const accessHash = await generateRegistryAccessHash(id, salt);
        return await registry.setPerson(
            hash,
            ethers.BigNumber.from(accessHash[0]),
            ethers.BigNumber.from(accessHash[1])
        );
    }

    const addExamAttempt = async(id: number, proof: any, parameter: any) => {
        const hash = "0x" + sha256(id.toString());
        //@ts-ignore
        return await scio.addExamResult(hash, [proof.a, proof.b, proof.c], parameter);
    }

    const verifyExams = async(id: number, proof: any, inputs: any, threshold: number) => {
        const hash = "0x" + sha256(id.toString());
        return await scio.verify(
            hash,
            threshold,
            //@ts-ignore
            [proof.a, proof.b, proof.c], 
            [
                ethers.BigNumber.from(inputs[0]),
                ethers.BigNumber.from(inputs[1]),
                ethers.BigNumber.from(inputs[2])
            ]
        );
    }

    beforeEach(async() => {
        [tester, addr1, ...addrs] = await ethers.getSigners();

        RegistryContract = await ethers.getContractFactory("Registry");
        RegistryVerifierContract = await ethers.getContractFactory("RegistryVerifier");
        SCIOContract = await ethers.getContractFactory("SCIO");
        SCIOVerifierContract = await ethers.getContractFactory("SCIOVerifier");

        registryVerifier = await RegistryVerifierContract.deploy();
        await registryVerifier.deployed();

        registry = await RegistryContract.deploy(registryVerifier.address);
        await registry.deployed();

        scioVerifier = await SCIOVerifierContract.deploy();
        await scioVerifier.deployed();

        scio = await SCIOContract.deploy(scioVerifier.address, registry.address);
        await scio.deployed();
    });

    it("Should add exam attempt into attempts for given person ID and retrieve it", async() => {
        const id: number = 12323923;
        const salt: number = 22392392;

        await addPersonToRegistry(id, salt);
        const proof = await generateSCIOExamProof(id, 90);
        await addExamAttempt(id, proof.proof, proof.inputs.slice(-1)[0]);
        const attempts = await getExamAttemptOnIndex(id, 0);
        const savedProof = attempts[0];
        const parameter = attempts[1];

        // equal proof and public parameter
        equalProof(savedProof, proof);
        expect(parameter).to.be.equal(proof.inputs.slice(-1)[0]);
    });

    it("Should add more than one exam attempts and retrieve them by index", async() => {
        const id: number = 12323923;
        const salt: number = 22392392;

        await addPersonToRegistry(id, salt);
        const proof1 = await generateSCIOExamProof(id, 90);
        await addExamAttempt(id, proof1.proof, proof1.inputs.slice(-1)[0]);
        const proof2 = await generateSCIOExamProof(id, 85);
        await addExamAttempt(id, proof2.proof, proof2.inputs.slice(-1)[0]);
        const attempts = [await getExamAttemptOnIndex(id, 0), await getExamAttemptOnIndex(id, 1)];

        equalProof(attempts[0][0], proof1);
        equalProof(attempts[1][0], proof2);
        expect(attempts[0][1]).to.be.equal(proof1.inputs.slice(-1)[0]);
        expect(attempts[1][1]).to.be.equal(proof2.inputs.slice(-1)[0]);
    });

    it("Should return false if correct registry identity but no exam score equal or higher than threshold", async() => {
        const id: number = 12323923;
        const salt: number = 22392392;
        const senderAddress: string = tester.address;

        await addPersonToRegistry(id, salt);
        const accessHash = await generateRegistryAccessHash(id, salt);
        // using just for publicHash as input
        const publicHash = await generateRegistryPublicHash(id, salt, senderAddress);
        // calculating actual proof
        let proof = await generateRegistryProof(
            id, 
            salt, 
            senderAddress, 
            accessHash,
            publicHash
        );

        const result = await verifyExams(id, proof.proof, proof.inputs.slice(-3), 90);
        expect(result).to.be.false;
    });

    it("Should return true if there is an exam score higher than threshold and registry identity is verified", async() => {
        const id: number = 12323923;
        const salt: number = 22392392;
        const senderAddress: string = tester.address;
        await addPersonToRegistry(id, salt);
        const scioProof = await generateSCIOExamProof(id, 90);
        await addExamAttempt(id, scioProof.proof, scioProof.inputs.slice(-1)[0]);
        const accessHash = await generateRegistryAccessHash(id, salt);
        // using just for publicHash as input
        const publicHash = await generateRegistryPublicHash(id, salt, senderAddress);
        // calculating actual proof
        let proof = await generateRegistryProof(
            id, 
            salt, 
            senderAddress, 
            accessHash,
            publicHash
        );

        const result = await verifyExams(id, proof.proof, proof.inputs.slice(-3), 90);
        expect(result).to.be.true;
    });

    it("Should revert if there is an exam score higher than threshold and correct verification proof is sent from diff address", async() => {
        const id: number = 12323923;
        const salt: number = 22392392;
        const senderAddress: string = addr1.address;
        await addPersonToRegistry(id, salt);
        const scioProof = await generateSCIOExamProof(id, 90);
        await addExamAttempt(id, scioProof.proof, scioProof.inputs.slice(-1)[0]);
        const accessHash = await generateRegistryAccessHash(id, salt);
        // using just for publicHash as input
        const publicHash = await generateRegistryPublicHash(id, salt, senderAddress);
        // calculating actual proof
        let proof = await generateRegistryProof(
            id, 
            salt, 
            senderAddress, 
            accessHash,
            publicHash
        );

        // sender is addr1 not tester!
        await expect(verifyExams(id, proof.proof, proof.inputs.slice(-3), 90)).to.be.revertedWith("ID does not belong to sender!");
    });
});
*/