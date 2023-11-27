export * from './Store';
import conf from './config';

export const config = conf;

export const stopPropagation = (e:Event) => e.stopPropagation();

//#region Strings
export function sortNames(names:string[]|{[key:string]:string}[], key:string) {
  const newBase:string[] = names.map((user:string|{[key:string]:string}) => {
    return typeof user === 'string' ? user : user[key];
  })
  return newBase.sort((a:string, b:string) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
}

export function calculatePlayerNameWidth(players:{name:string,[other:string]:string|number}[]) {
  let max = 0;
  players.forEach(player => {
    if (player.name?.length > max) {
      max = player.name?.length;
    }
  });
  const value = 50 + (40 * max) / 32;
  return `${value}%`;
}
//#endregion Strings

//#region Regexp
export function validGameId(input:string) {
  const exp = /^[0-9]{1,7}$/;
  return exp.test(input);
}
export function validUsername(input:string) {
  const maxName = config.usernameMaxCharacters;
  if (input.length > maxName) {
    return `Names cannot exceed ${maxName} characters. ${input.length}/${maxName}`;
  }
  const exp = /^[^\/\\]+$/g;
  return exp.test(input);
}

const invalidCharacters = /[\/\\]/g;

export function invalidCharactersList(input:string, { raw } = { raw: false }) {
  const badCharactersUsed = [...input.matchAll(invalidCharacters)];
  const rawList = badCharactersUsed.map(match => match[0]);
  if (raw) return rawList;

  if (rawList.length === 1) {
    return rawList[0];
  }

  if (rawList.length === 2) {
    return rawList.join(' or ');
  }

  let stringList = rawList.join(', ');
  return stringList.replace(/, ([^,]+)$/, ', or $1');
}

export function inGame(location:Location) {
  return /\/game\/[0-9]{1,7}\/?$/.test(location.href);
}

export function inHome(location:Location) {
  const pattern = new RegExp(location.origin + '/?$');
  return pattern.test(location.href);
}
//#endregion Regexp


