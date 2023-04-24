import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import path from 'path';
// @ts-ignore
import { initialiseResolver } from '@noir-lang/noir-source-resolver';
import { acir_read_bytes, compile } from '@noir-lang/noir_wasm';
// @ts-ignore
import { setup_generic_prover_and_verifier } from '@noir-lang/barretenberg';

async function main() {
  if (existsSync(path.join(__dirname, '../contract/plonk_vk.sol'))) {
    unlinkSync(path.join(__dirname, '../contract/plonk_vk.sol'));
  }

  initialiseResolver((id: any) => {
    try {
      return readFileSync(`circuit/${id}`, { encoding: 'utf8' }) as string;
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  const compiled = await compile({
    entry_point: 'index.nr',
  });

  const acir_bytes = new Uint8Array(Buffer.from(compiled.circuit, 'hex'));
  const acir = acir_read_bytes(acir_bytes);

  const [prover, verifier] = await setup_generic_prover_and_verifier(acir);
  console.log('Generating contract...');

  const sc = verifier.SmartContract();

  console.log('Contract generated!');
  writeFileSync(path.join(__dirname, '../contract/plonk_vk.sol'), sc, {
    flag: 'w',
  });
  console.log('Contract saved!');
  process.exit();
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
