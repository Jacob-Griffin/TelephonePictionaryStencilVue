export function processArgs(argv,unaryArgs,binaryArgs) {
  const args = argv.splice(2);
  const argMap = new Map();
  for(let i = 0; i < args.length; i++){
    const rawName = args[i].replace(/^\-/,'');
    if(unaryArgs.includes(rawName)){
      argMap.set(rawName, true);
    } else if (binaryArgs.includes(rawName)){
      if(!args[i+1] || args[i+1].startsWith('-')){
        throw new Error(`Args mismatch: Missing value for argument ${args[i]}`);
      } else {
        argMap.set(rawName,args[i+1]);
        i+=1;
      }
    } else {
      throw new Error(`Args error: Invalid argument ${args[i]}`);
    }
  }
  return argMap;
}