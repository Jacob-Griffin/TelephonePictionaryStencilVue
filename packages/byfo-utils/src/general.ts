import config from './config';
export const stopPropagation = (e: Event) => e.stopPropagation();

//#region Strings
/**
 * Sorts a list of strings case-insensitively
 * @param names - An array of names as string
 * @returns - A sorted array with the same strings
 */
export function sortNames(names: string[]) {
  return names.sort((a: string, b: string) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
}

type inObject = { [key: string]: string };
/**
 * Sorts a list of username objects by the given key
 * @param names - An array of objects that contain the names to be sorted
 * @param sortKey - The object prop containing the name
 * @returns A sorted list of the objects
 */
export function sortNamesBy(names: inObject[], sortKey: keyof inObject) {
  const keyMap = new Map<string, inObject>();
  const nameArray: string[] = [];
  names.forEach((obj: inObject) => {
    nameArray.push(obj[sortKey]);
    keyMap.set(obj[sortKey], obj);
  });
  const keyOrder = nameArray.sort((a: string, b: string) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  return keyOrder.map(name => keyMap.get(name));
}

/**
 * Calculates the amount of space to give the player names for list purposes.
 * Front-end heavy, reconsider this if changing the front end
 * @param players - a list of player objects
 * @returns The css width for the player section of a list, such as between rounds
 */
export function calculatePlayerNameWidth(players: { username: string; [other: string]: string | number }[]) {
  let max = 0;
  players.forEach(player => {
    if (player.username?.length > max) {
      max = player.username?.length;
    }
  });
  const value = 50 + (40 * max) / 32;
  return `${value}%`;
}
//#endregion Strings

//#region Regexp
/**
 * Checks if a game id is valid
 * @param input - A potential gameid
 * @returns True if the input is a gameid, false otherwise
 */
export function validGameId(input: string) {
  const exp = /^[0-9]{1,7}$/;
  return exp.test(input);
}

const invalidCharacters = ['/', '\\'];

/**
 * Checks if a username is valid
 * @param input - A potential username
 * @returns True if the name is within max length and does not contain invalid characters
 */
export function validUsername(input: string) {
  const maxName = config.usernameMaxCharacters;
  if (input.length > maxName) {
    return `Names cannot exceed ${maxName} characters. ${input.length}/${maxName}`;
  }
  const invalidCharacters = invalidCharactersList(input);
  return invalidCharacters ? `Names cannot contain ${invalidCharacters}` : true;
}

/**
 * Checks *which* characters are invalid within a given string
 * @param input - The string to be checked
 * @returns A comma separated list of invalid characters which appear in the input
 */
export function invalidCharactersList(input: string) {
  const badCharactersUsed = new Set<string>();
  for (let i = 0; i < input.length; i++) {
    if (invalidCharacters.includes(input[i])) {
      badCharactersUsed.add(input[i]);
      if (badCharactersUsed.size === invalidCharacters.length) {
        break;
      }
    }
  }
  const rawList = [...badCharactersUsed];

  if (rawList.length === 1) {
    return rawList[0];
  }

  if (rawList.length === 2) {
    return rawList.join(' or ');
  }

  let stringList = rawList.join(', ');
  return stringList.replace(/, ([^,]+)$/, ', or $1');
}

/**
 * Checks if the given window location is a valid gameplay url
 * @param location - The window.Location in question
 * @returns True if the location is in game
 */
export function inGame(path:string) {
  return /\/game\/[0-9]{1,7}\/?$/.test(path);
}

/**
 * Checks if the given window location is the home url
 * @param location - The window.Location in question
 * @returns True if the location is in home
 */
export function inHome(path:string) {
  return path === '/';
}
//#endregion Regexp
