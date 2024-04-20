const functions = require('firebase-functions');
const logger = require('firebase-functions/logger');
// Start writing functions
// https://firebase.google.com/docs/functions/typescript
// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.

const transformGame = (payload) => {
    const newPayload = {}
    for(const stack in payload){
        if(typeof payload[stack] !== 'object' || Object.keys(stack).some(key => key !== `${parseInt(key)}`)){
            newPayload[stack] = payload[stack];
            continue;
        }
        newPayload[stack] = {};
        for(const round in payload[stack]){
            if(payload[stack][round].contentType === 'text'){
                newPayload[stack][round] = payload[stack][round].content;
            }
        }
    }
    return newPayload;
}

exports.transformGamePreSearch = functions.region('us-west2').https.onCall(
    (request) => {
        const payload = request.data;
        logger.warn(JSON.stringify(payload));
        const newData = transformGame(payload);
        logger.warn(JSON.stringify(newData));
        return newData;
    }
);