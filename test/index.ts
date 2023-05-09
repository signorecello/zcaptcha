// @ts-ignore
import { initialiseResolver } from '@noir-lang/noir-source-resolver';
import init, { acir_read_bytes, compile } from '@noir-lang/noir_wasm';

import fs from 'fs';
import { expect } from 'chai';
import {
  create_proof,
  verify_proof,
  setup_generic_prover_and_verifier,
  // @ts-ignore
} from '@noir-lang/barretenberg';
import { ethers } from 'hardhat';
import Ethers from '../utils/ethers';
import { Captcha, Puzzle } from '../types/index';
import { Contract } from 'ethers';
import generateCaptcha from '../scripts/genCaptchas';
import { opendir, readFile, rm } from 'fs/promises';
import {
  convertSolutionToArrayBytes,
  getSolutionHash,
  convertSolutionHashToArrayBytes,
  toArrayBytes,
  ensureEvenLengthHexString,
} from '../utils/util';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync, rmdirSync, existsSync } from 'fs';
import path from 'path';
import toml, { JsonMap } from '@iarna/toml'; // First, install it with `npm install @iarna/toml`

const ipfsClient = require('ipfs-http-client');

// Define the interface for Prover.toml data
interface ProverToml extends JsonMap {
  solutionHash: string;
  solution: number[];
}

async function createProof(solution: number[], solutionHash: string) {
  // 👇 Workaround while BB is not OK
  // Read the existing Prover.toml file (if it exists)
  const proverTomlPath = 'Prover.toml';
  let proverTomlContent = '';
  let proverTomlData: ProverToml;

  if (fs.existsSync(proverTomlPath)) {
    proverTomlContent = fs.readFileSync(proverTomlPath, 'utf8');
    proverTomlData = toml.parse(proverTomlContent) as unknown as ProverToml;
  } else {
    console.log('Prover.toml not found. Creating a new one.');
    // Initialize proverTomlData with default values
    proverTomlData = {
      solutionHash: '',
      solution: [],
    };
  }

  // Update the values
  proverTomlData.solutionHash = solutionHash;
  proverTomlData.solution = solution;

  // Convert the updated object back to TOML format
  const updatedProverTomlContent = toml.stringify(proverTomlData);

  // Write the updated TOML contents back to Prover.toml
  fs.writeFileSync(proverTomlPath, updatedProverTomlContent, 'utf8');

  console.log('Prover.toml updated successfully.');

  execSync('nargo prove p');
}

async function verifyProof() {
  execSync('nargo verify p');
}

describe('It compiles noir program code, receiving circuit bytes and abi object.', () => {
  let compiled: any;
  let acir: any;
  let prover: any;
  let verifier: any;

  let game: Contract;
  let puzzle: Puzzle;

  let ipfsData: { path: string };
  let captcha: Captcha;

  let correctProof: any;

  before(async () => {
    // 👇 Workaround while BB is not OK
    execSync('nargo codegen-verifier');

    //👇 This is assuming BB is OK
    // initialiseResolver((id: any) => {
    //   try {
    //     return fs.readFileSync(`src/${id}`, { encoding: 'utf8' }) as string;
    //   } catch (err) {
    //     console.error(err);
    //     throw err;
    //   }
    // });

    // compiled = await compile({
    //   // entry_point: 'main.nr',
    // });

    // expect(compiled).to.have.property('circuit');
    // expect(compiled).to.have.property('abi');

    // let acir_bytes = new Uint8Array(Buffer.from(compiled.circuit, 'hex'));
    // acir = acir_read_bytes(acir_bytes);

    // expect(acir).to.have.property('opcodes');
    // expect(acir).to.have.property('current_witness_index');
    // expect(acir).to.have.property('public_parameters');

    // [prover, verifier] = await setup_generic_prover_and_verifier(acir);
  });

  before('Deploy contract', async () => {
    const Verifier = await ethers.getContractFactory('UltraVerifier');
    const verifier = await Verifier.deploy();

    const verifierAddr = await verifier.deployed();
    console.log(`Verifier deployed to ${verifier.address}`);

    const Game = await ethers.getContractFactory('Captcha');
    game = await Game.deploy(verifierAddr.address);
    console.log(`Game deployed to ${game.address}`);

    captcha = await generateCaptcha();
    console.log(captcha);

    const projectId = process.env.IPFS_PROJECT_ID;
    const projectSecret = process.env.IPFS_PROJECT_SECRET;

    const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

    const client = ipfsClient.create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth,
      },
    });

    return opendir('tmp')
      .then(async () => {
        const file = await readFile(`tmp/${captcha.key.string}.jpg`);
        ipfsData = await client.add(file);
        const hash = ensureEvenLengthHexString(captcha.solutionHash);
        await game.addPuzzle(ipfsData.path, hash);
      })
      .then(async () => {
        await rm('tmp', { recursive: true });
        puzzle = await game.getPuzzle();
      });
  });

  it.skip('Should get a puzzle from the contract', async () => {
    expect(puzzle.url).to.equal(ipfsData.path);
  });

  before('Generate proof', async () => {
    // 👇 Workaround while BB is not OK
    await createProof(captcha.key.arrayBytes, puzzle.solutionHash);

    //👇 This is assuming BB is OK
    // const solutionBytes = convertSolutionToArrayBytes(captcha.key);
    // // const solutionHashBytes = convertSolutionHashToArrayBytes(puzzle.solutionHash);
    // const input = { solution: solutionBytes, solutionHash: puzzle.solutionHash };
    // correctProof = await create_proof(prover, acir, input);
  });

  it('Should generate valid proof for correct input', async () => {
    // 👇 Workaround while BB is not OK
    expect(verifyProof).to.not.throw();

    // 👇 This is assuming BB is OK
    // expect(correctProof instanceof Buffer).to.be.true;
    // const verification = await verify_proof(verifier, correctProof);
    // expect(verification).to.be.true;
  });

  it('Should fail with incorrect input', async () => {
    try {
      // 👇 Workaround while BB is not OK
      await createProof([0, 0, 0, 0, 0], puzzle.solutionHash);

      // 👇 This is assuming BB is OK
      // const wrongSolutionBytes = convertSolutionToArrayBytes('00000');
      // const solutionHashBytes = convertSolutionHashToArrayBytes(puzzle.solutionHash);
      // const input = { solution: wrongSolutionBytes, solutionHash: solutionHashBytes };
      // await create_proof(prover, acir, input);
    } catch (e) {
      expect(e instanceof Error).to.be.true;
    }
  });

  it('Should verify the proof on-chain', async () => {
    correctProof = fs.readFileSync(path.resolve(__dirname, '../proofs/p.proof'), 'utf8');
    const hashBytes = Array.from(ethers.utils.arrayify(puzzle.solutionHash));
    console.log(hashBytes);

    const ver = await game.submitSolution(correctProof, hashBytes);
    expect(ver).to.be.true;
  });
});
