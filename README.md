<h1>Use of zk-SNARKs inside blockchain infractructure</h1>
This project aims to create a proof-of-concept blockchain infrastructure for registration and authentication at CTU (Czech Technical University).</br></br>

There are three authorities that exist in this project:

<h4>Registry</h4>
This authority issues a blockchain identification for each person (at birth or when they reach the age of 18). The blockchain identification consists of personID and seedID, which are private values that only the authority and the user know. Later in the project, this identity is used by SCIO and the registration contract to verify the person.
<h4>SCIO</h4>
The SCIO authority is a Czech exam issuer. If you exceed a threshold set by the university you are applying to, you can become a student without an entrance exam. This authority uploads the exam results to the blockchain and links them to the hashed PersonID in the contract.
<h4>CTU</h4>
This authority represents the university. The person can register as a student at the university using a smart contract. Once registered, the student can authenticate on the blockchain and use university features that require authentication. In other words, the person proves to the contract that he or she is indeed a student at the university.

<br/><br/>
I use zk-SNARKs as a zero-knowledge protocol, because there is a good library called Zokrates that can export Solidity smart contracts from its language, at least with some developer community. Since smart contracts are immutable and issued by authorities, zk-SNARK is a good choice.


There are 8 smart contracts in total:

Registry.sol & RegistryVerifier.sol

SCIO.sol & SCIOVerifier.sol

Registration.sol & RegistrationVerifier.sol

Login.sol & LoginVerifier.sol


This project is based on my semester project in CTU 2023.
