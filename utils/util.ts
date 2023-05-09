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
  const pos = poseidon(arr);
  const hash = '0x' + poseidon.F.toString(pos, 16);
  return hash;
}

export function ensureEvenLengthHexString(hexString: string): string {
  // Remove the '0x' prefix if it's present
  const cleanHexString = hexString.startsWith('0x') ? hexString.slice(2) : hexString;

  // Check if the length is odd
  if (cleanHexString.length % 2 !== 0) {
    // If odd, add a leading zero
    return '0x0' + cleanHexString;
  } else {
    // If even, return the original string (with '0x' prefix)
    return '0x' + cleanHexString;
  }
}
