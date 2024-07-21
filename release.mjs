import { processArgs } from "./script-utils.mjs";

const args = processArgs(process.argv,[],['v']);
const version = args.get('v');
console.log(`Releasing version ${version}`);