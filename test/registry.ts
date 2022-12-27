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
    let addr1;
    let addrs;
    let registry: Registry;
    let registryVerifier: RegistryVerifier;
    let RegistryContract;
    let RegistryVerifierContract;
    
    const addPersonToRegistry = async(id: number, salt: number, sender: string) => {
        const provider = await initialize();
        const source: string = fileSystemResolver("project", "zokrates/utils/ComputeRegistryHash.zok");
        const artifacts = provider.compile(source);
        const { witness, output } = provider.computeWitness(artifacts, [id.toString(), salt.toString(), ethers.BigNumber.from("0x" + sender.slice(-32)).toString()]);
        const keypair = provider.setup(artifacts.program);
        const inputs = provider.generateProof(artifacts.program, witness, keypair.pk).inputs;
        const hash = "0x" + sha256(id.toString());
        const tx = await registry.setPerson(
            hash,
            inputs[0],
            inputs[1],
            inputs[2]
        );
    }

    const getPersonFromRegistry = async(id: number) => {
        const hash = "0x" + sha256(id.toString());
        const tx = await registry.persons(hash);
        return [tx.hashID, tx.accessHashLow, tx.accessHashHigh, tx.parameter];
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

        const senderAddress: string = tester.address;
        await addPersonToRegistry(id, salt, senderAddress);
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
        expect(personData[3]).to.be.equal(nullBytes);
    });

    it("Should revert when registering a person with the same ID", async() => {
        const id: number = 12323923;
        const salt: number = 22392392;
        const senderAddress: string = tester.address;
        await addPersonToRegistry(id, salt, senderAddress);
        await expect(addPersonToRegistry(id, salt, senderAddress)).to.be.revertedWith("Person already registered!");
    });

    it("Should verify registered user with valid proof", async() => {

    });

    it("Should return false with stolen proof but sender is different", async() => {

    });

    it("Should revert when a proof was changed by the sender", async() => {

    });

    it("Should revert when verifing unregistered person", async() => {

    });
});
