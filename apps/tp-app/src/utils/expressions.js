export function validGameId(input){
    const exp = /^[1-9]{1,6}$/;
    return exp.test(input);
}
export function validUsername(input){
    const exp = /^[^?=\-/%#><+]+$/g;
    return exp.test(input)
}

const invalidCharacters = /[?=\-/%#><+]/g;

export function invalidCharactersList(input,{raw}={raw:false}){
    const badCharactersUsed = [...input.matchAll(invalidCharacters)];
    const rawList = badCharactersUsed.map((match) => match[0]);
    if(raw) return rawList;

    if(rawList.length === 1){
        return rawList[0];
    }

    if(rawList.length === 2){
        return rawList.join(' or ');
    }

    let stringList = rawList.join(", ");
    return stringList.replace(/, ([^,]+)$/,", or $1");
}
