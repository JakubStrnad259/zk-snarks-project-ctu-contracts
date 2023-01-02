import { ethers } from "hardhat";
import { Registry, RegistryVerifier } from "../typechain-types";
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

describe("Registry", function() {
    let tester: any;
    let addr1: any;
    let addrs: any;
    let registry: Registry;
    let registryVerifier: RegistryVerifier;
    let RegistryContract;
    let RegistryVerifierContract;

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

    const getPersonFromRegistry = async(id: number) => {
        const hash = "0x" + sha256(id.toString());
        const tx = await registry.persons(hash);
        return [tx.hashID, tx.accessHashLow, tx.accessHashHigh];
    }

    const verifyPerson = async(id: number, proof:any, inputs: any) => {
        const hashID = "0x" + sha256(id.toString());
        return await registry.verify(
            hashID, 
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

        registryVerifier = await RegistryVerifierContract.deploy();
        await registryVerifier.deployed();

        registry = await RegistryContract.deploy(registryVerifier.address);
        await registry.deployed();
    });

    it("Should add a person to registry and then retrieve it", async() => {
        const id: number = 12323923;
        const salt: number = 22392392;
        const hashID = "0x" + sha256(id.toString());

        await addPersonToRegistry(id, salt);
        const personData = await getPersonFromRegistry(id);
        expect(personData[0]).to.be.equal(hashID);
    });

    it("Should return empty data for unregistered person", async() => {
        const id: number = 12323923;
        const personData = await getPersonFromRegistry(id);
        const nullBytes = ethers.utils.formatBytes32String("");
        expect(personData[0]).to.be.equal(nullBytes);
        expect(personData[1]).to.be.equal(nullBytes);
        expect(personData[2]).to.be.equal(nullBytes);
    });

    it("Should revert when registering a person with the same ID", async() => {
        const id: number = 12323923;
        const salt: number = 22392392;
        await addPersonToRegistry(id, salt);
        await expect(addPersonToRegistry(id, salt)).to.be.revertedWith("Person already registered!");
    });

    it("Should verify registered user with valid proof", async() => {
        const id: number = 12323923;
        const salt: number = 22392392;
        const senderAddress: string = tester.address;

        await addPersonToRegistry(id, salt);
        // using just for pass hash as input
        const accessHash = await generateRegistryAccessHash(id, salt);
        // using just for publicHash as input
        const publicHash = await generateRegistryPublicHash(id, salt, senderAddress);
        // calculating actual proof
        const proof = await generateRegistryProof(
            id, 
            salt, 
            senderAddress, 
            accessHash,
            publicHash
        );
        const result = await verifyPerson(id, proof.proof, proof.inputs.slice(-3));
        expect(result).to.be.true;

    });

    it("Should return false with stolen proof but sender is different", async() => {
        const id: number = 12323923;
        const salt: number = 22392392;
        const senderAddress: string = addr1.address;

        await addPersonToRegistry(id, salt);
        // using just for pass hash as input
        const accessHash = await generateRegistryAccessHash(id, salt);
        // using just for publicHash as input
        const publicHash = await generateRegistryPublicHash(id, salt, senderAddress);
        // calculating actual proof
        const proof = await generateRegistryProof(
            id, 
            salt, 
            senderAddress, 
            accessHash,
            publicHash
        );

        // its sent with tester address which is different from addr1 address
        const result = await verifyPerson(id, proof.proof, proof.inputs.slice(-3));
        expect(result).to.be.false;
    });

    it("Should revert when a proof was changed by the sender", async() => {
        const id: number = 12323923;
        const salt: number = 22392392;
        const senderAddress: string = tester.address;

        await addPersonToRegistry(id, salt);
        // using just for pass hash as input
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

        proof.proof = {
            "a": [proof.proof.a[0], ethers.BigNumber.from(proof.proof.a[1]).add(ethers.BigNumber.from(1)).toHexString()],
            "b": proof.proof.b,
            "c": proof.proof.c
        }

        // its sent with tester address which is different from addr1 address
        await expect(verifyPerson(id, proof.proof, proof.inputs.slice(-3))).to.be.reverted;
    });

    it("Should revert when verifing unregistered person", async() => {
        const id: number = 12323923;
        const salt: number = 22392392;
        const senderAddress: string = tester.address;

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
        await expect(verifyPerson(id, proof.proof, proof.inputs.slice(-3))).to.be.reverted;
    });
});
