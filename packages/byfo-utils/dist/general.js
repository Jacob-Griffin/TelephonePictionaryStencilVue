"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inHome = exports.inGame = exports.invalidCharactersList = exports.validUsername = exports.validGameId = exports.calculatePlayerNameWidth = exports.sortNamesBy = exports.sortNames = exports.stopPropagation = void 0;
const config_1 = __importDefault(require("./config"));
const stopPropagation = (e) => e.stopPropagation();
exports.stopPropagation = stopPropagation;
function sortNames(names) {
    return names.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
}
exports.sortNames = sortNames;
function sortNamesBy(names, sortKey) {
    const keyMap = new Map();
    const nameArray = [];
    names.forEach((obj) => {
        nameArray.push(obj[sortKey]);
        keyMap.set(obj[sortKey], obj);
    });
    const keyOrder = nameArray.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    return keyOrder.map(name => keyMap.get(name));
}
exports.sortNamesBy = sortNamesBy;
function calculatePlayerNameWidth(players) {
    let max = 0;
    players.forEach(player => {
        if (player.username?.length > max) {
            max = player.username?.length;
        }
    });
    const value = 50 + (40 * max) / 32;
    return `${value}%`;
}
exports.calculatePlayerNameWidth = calculatePlayerNameWidth;
function validGameId(input) {
    const exp = /^[0-9]{1,7}$/;
    return exp.test(input);
}
exports.validGameId = validGameId;
const invalidCharacters = ['/', '\\'];
function validUsername(input) {
    const maxName = config_1.default.usernameMaxCharacters;
    if (input.length > maxName) {
        return `Names cannot exceed ${maxName} characters. ${input.length}/${maxName}`;
    }
    const invalidCharacters = invalidCharactersList(input);
    return invalidCharacters ? `Names cannot contain ${invalidCharacters}` : true;
}
exports.validUsername = validUsername;
function invalidCharactersList(input) {
    const badCharactersUsed = new Set();
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
exports.invalidCharactersList = invalidCharactersList;
function inGame(location) {
    return /\/game\/[0-9]{1,7}\/?$/.test(location.href);
}
exports.inGame = inGame;
function inHome(location) {
    const pattern = new RegExp(location.origin + '/?$');
    return pattern.test(location.href);
}
exports.inHome = inHome;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9nZW5lcmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHNEQUE4QjtBQUN2QixNQUFNLGVBQWUsR0FBRyxDQUFDLENBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQXBELFFBQUEsZUFBZSxtQkFBcUM7QUFRakUsU0FBZ0IsU0FBUyxDQUFDLEtBQWU7SUFDdkMsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNqRyxDQUFDO0FBRkQsOEJBRUM7QUFTRCxTQUFnQixXQUFXLENBQUMsS0FBaUIsRUFBRSxPQUF1QjtJQUNwRSxNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBb0IsQ0FBQztJQUMzQyxNQUFNLFNBQVMsR0FBYSxFQUFFLENBQUM7SUFDL0IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQWEsRUFBRSxFQUFFO1FBQzlCLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDN0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDaEMsQ0FBQyxDQUFDLENBQUM7SUFDSCxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM3RyxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFB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