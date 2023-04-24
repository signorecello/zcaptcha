import initNoirWasm, { acir_read_bytes, compile } from '@noir-lang/noir_wasm';
import initialiseAztecBackend from '@noir-lang/aztec_backend';
// @ts-ignore
import { initialiseResolver } from '@noir-lang/noir-source-resolver';

const PATHS = ['/index.nr', '/hash.nr'];

const prepareCode = async () => {
  let code = {};
  for (const path of PATHS) {
    const fileUrl = `/api/read-circuit-file?filename=${path.replace('/', '')}`;
    code[path.replace('/', '')] = await fetch(fileUrl)
      .then(r => r.text())
      .then(code => code);
  }
  return code;
};

export const compileCircuit = async () => {
  await initNoirWasm();

  const code = await prepareCode();
  initialiseResolver((id: any) => {
    console.log(id);
    return code[id];
  });

  try {
    const compiled_noir = compile({
      entry_point: 'index.nr',
    });
    return compiled_noir;
  } catch (e) {
    console.log('Error while compiling:', e);
  }
};

export const getAcir = async () => {
  const { circuit, abi } = await compileCircuit();
  await initialiseAztecBackend();

  // @ts-ignore
  let acir_bytes = new Uint8Array(Buffer.from(circuit, 'hex'));
  return acir_read_bytes(acir_bytes);
};
