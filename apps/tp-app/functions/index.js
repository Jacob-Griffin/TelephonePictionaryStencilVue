const functions = require('firebase-functions');
const logger = require('firebase-functions/logger');
// Start writing functions
// https://firebase.google.com/docs/functions/typescript
// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const decodePath = (path) => {
    // This function is in lieu of an import from byfo-utils/general
    return path.replaceAll('%2E', '.').replaceAll('%23', '#').replaceAll('%24', '$').replaceAll('%5B', '[').replaceAll('%5D', ']');
}
const transformGame = (payload) => {
    const newPayload = {}
    const stackNames = [];
    for(const stack in payload){
        if(stack === 'MigratedFromOldBlowYourFaceOffSite' && (payload[stack] === true || payload[stack] === 'true')){
            stackNames.push(stack);
        }
        if(typeof payload[stack] !== 'object' || Object.keys(stack).some(key => key !== `${parseInt(key)}`)){
            newPayload[stack] = payload[stack];
            continue;
        }
        stackNames.push(decodePath(stack));
        newPayload[stack] = {};
        for(const round in payload[stack]){
            if(payload[stack][round].contentType === 'text'){
                newPayload[stack][round] = payload[stack][round].content;
            }
        }
    }
    newPayload.stackNames = stackNames;
    return newPayload;
}

exports.transformGameForSearch = functions.region('us-west2').https.onCall(transformGame);