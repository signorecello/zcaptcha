const { createHash } = require('crypto');
// @ts-ignore
import { buildPoseidon } from 'circomlibjs';

export function toArrayBytes(bytes: any, range: any) {
  const arrayBytes = [];
  for (let i = 0; i < range; i++) {
    arrayBytes.push(bytes.readUInt8(i));
  }
  return arrayBytes;
}

function hex_decode(string: string) {
  const bytes: Array<number> = [];
  // @ts-ignore
  string.replace(/../g, (pair: any) => {
    bytes.push(parseInt(pair, 16));
  });
  return new Uint8Array(bytes);
}

function getUInt16Bytes(x: any) {
  const bytes = Buffer.alloc(16);
  bytes.writeUInt16LE(x);
  return bytes;
}

export function convertSolutionToArrayBytes(value: any) {
  const bytes = getUInt16Bytes(value);
  const solution = toArrayBytes(bytes, 16);
  return solution;
}

export function convertSolutionHashToArrayBytes(value: any) {
  const hex = hex_decode(value).slice(1, 17);
  return Array.from(hex);
}

export async function getSolutionHash(value: any) {
  const poseidon = await buildPoseidon();
  const split = value.split('');

  const arr = split.map((x: any) => x.charCodeAt(0));
  //   const bytes = getUInt16Bytes(value);
  //   const arr = [...bytes];
  //   console.log(arr);
  const pos = poseidon(arr);
  const hash = '0x' + poseidon.F.toString(pos, 16);
  //   const h = createHash('sha256').update(bytes).digest();
  //   const solutionHash = toArrayBytes(h, 32);
  console.log('POSEIDON', hash);
  return hash;
}
