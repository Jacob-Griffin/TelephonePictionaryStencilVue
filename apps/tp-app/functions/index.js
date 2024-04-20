// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {onCall} = require("firebase-functions/v2/https");

exports.transformGameForSearch = onCall({ cors: false }, (payload) => {
    const newPayload = {}
    for(const stack of payload){
        newPayload[stack] = {};
        for(const round of payload[stack]){
            if(payload[stack][round].contentType === 'text'){
                newPayload[stack][round] = payload[stack][round];
            }
        }
    }
    return newPayload;
});

