import { processArgs } from "./script-utils.mjs";
import { execSync } from 'child_process';

const args = processArgs(process.argv,[],['v']);
const version = args.get('v');
console.log(`Releasing version ${version}`);

const packages = execSync("find packages/*/package.json apps/*/package.json ./package.json -iname package.json").toString().trim().split('\n');

packages.forEach(p => {
  const oldContent = execSync(`cat ${p}`).toString();
  const newContent = oldContent.replace(/"version": ".*"/,`"version": "${version}"`);
  execSync(`echo -n "${newContent.replaceAll('\\"','\\\\"').replaceAll('"','\\"')}" | cat > ${p}`);
});

const _branch = execSync('git branch').toString();
const branch = _branch.match(/\* (.+)/)[1];
if(branch !== 'dev'){
  console.log('switching to branch dev')
  execSync(`git switch dev`);
}

packages.forEach(p => execSync(`git add ${p}`));
execSync(`git commit -m "Automated: Release ${version}"`);
execSync('git push');

execSync(`git switch release`);
execSync(`git merge --no-message --squash dev`);
execSync(`git commit -m "Automated: Release ${version}"`);
execSync(`git push`);

if(branch !== 'release'){
  console.log(`switching back to branch ${branch}`);
  execSync(`git switch ${branch}`);
}