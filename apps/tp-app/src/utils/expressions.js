import globalLimits from "../globalLimits";

export function validGameId(input) {
  const exp = /^[0-9]{1,7}$/;
  return exp.test(input);
}
export function validUsername(input) {
  const maxName = globalLimits.usernameMaxCharacters;
  if (input.length > maxName) {
    return `Names cannot exceed ${maxName} characters. ${input.length}/${maxName}`;
  }
  const exp = /^[^\/\\]+$/g;
  return exp.test(input);
}

const invalidCharacters = /[\/\\]/g;

export function invalidCharactersList(input, { raw } = { raw: false }) {
  const badCharactersUsed = [...input.matchAll(invalidCharacters)];
  const rawList = badCharactersUsed.map((match) => match[0]);
  if (raw) return rawList;

  if (rawList.length === 1) {
    return rawList[0];
  }

  if (rawList.length === 2) {
    return rawList.join(" or ");
  }

  let stringList = rawList.join(", ");
  return stringList.replace(/, ([^,]+)$/, ", or $1");
}

export function inGame(location) {
  return /\/game\/[0-9]{1,7}\/?$/.test(location.href);
}

export function inHome(location) {
  const pattern = new RegExp(location.origin + "/?$");
  return pattern.test(location.href);
}
