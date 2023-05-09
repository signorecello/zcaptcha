import path from 'node:path';
import { convertSolutionToArrayBytes, getSolutionHash } from '../utils/util';
const Captcha = require('node-captcha-generator');

export default async function generateCaptcha() {
  var c = new Captcha({
    length: 5, // number length
    size: {
      // output size
      width: 450,
      height: 200,
    },
  });

  const solutionHash = await getSolutionHash(c.value);

  c.captcha.write(path.join(__dirname, `../tmp/${c.value}.jpg`), function (err: Error) {
    if (err) console.log(err);
  });

  const split = c.value.split('');
  const arr = split.map((x: any) => x.charCodeAt(0));

  return { key: { string: c.value, arrayBytes: arr }, solutionHash };
}
