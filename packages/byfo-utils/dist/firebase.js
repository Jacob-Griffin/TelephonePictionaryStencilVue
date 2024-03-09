"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BYFOFirebaseAdapter = void 0;
const firestore_1 = require("firebase/firestore");
const database_1 = require("firebase/database");
const storage_1 = require("firebase/storage");
const app_1 = require("firebase/app");
const config_1 = __importDefault(require("./config"));
const general_1 = require("./general");
class BYFOFirebaseAdapter {
    connection = {
        db: null,
        rtdb: null,
        storage: null,
    };
    constructor(config) {
        const app = (0, app_1.initializeApp)(config);
        this.connection.db = (0, firestore_1.getFirestore)(app);
        this.connection.rtdb = (0, database_1.getDatabase)(app);
        this.connection.storage = (0, storage_1.getStorage)(app);
    }
    async storeGame(gameid, stacks, metadata) {
        const docRef = (0, firestore_1.doc)(this.connection.db, `games/${gameid}`);
        await (0, firestore_1.setDoc)(docRef, stacks);
        const metadataRef = (0, firestore_1.doc)(this.connection.db, `metadata/${gameid}`);
        await (0, firestore_1.setDoc)(metadataRef, metadata);
        return true;
    }
    async getGameData(gameid) {
        const docRef = (0, firestore_1.doc)(this.connection.db, `games/${gameid}`);
        const snapshot = await (0, firestore_1.getDocFromServer)(docRef);
        const gameData = snapshot.data();
        return gameData;
    }
    async getGameMetadata(gameid) {
        const docRef = (0, firestore_1.doc)(this.connection.db, `metadata/${gameid}`);
        const snapshot = await (0, firestore_1.getDocFromServer)(docRef);
        const metadata = snapshot.data() ?? { roundLength: 180000, date: 'unknown' };
        return metadata;
    }
    ref(path) {
        if (this.connection.rtdb === null) {
            throw new Error('Firebase App Connection not configured');
        }
        return (0, database_1.ref)(this.connection.rtdb, path);
    }
    async getRef(path) {
        return await (0, database_1.get)(this.ref(path)).then(result => result.val());
    }
    generatePriority(taken) {
        let priority = Math.floor(Math.random() * 1000);
        while (taken && taken.has(priority)) {
            priority = Math.floor(Math.random() * 1000);
        }
        return priority;
    }
    getDefaultContent(type) {
        if (type === 'image') {
            return '';
        }
        return 'Whoops, I forgot to submit something :(';
    }
    async addPlayerToLobby(gameid, username) {
        const gameStatus = await this.getRef(`game-statuses/${gameid}`);
        const result = {
            action: 'error',
        };
        if (!gameStatus) {
            result.detail = 'Game does not exist';
            return result;
        }
        if (gameStatus.finished) {
            result.detail = 'Game has already finished';
            return result;
        }
        const players = await this.getWaitingPlayers(gameid);
        const playerNumbers = new Set();
        for (let playerNumber in players) {
            const player = players[playerNumber];
            if (player.username === username) {
                if (player.status === 'missing') {
                    return {
                        action: 'join',
                        detail: playerNumber,
                        dest: gameStatus.started ? 'game' : 'lobby',
                    };
                }
                if (!gameStatus.started) {
                    result.detail = 'Username already taken in game';
                    return result;
                }
            }
            playerNumbers.add(parseInt(playerNumber));
        }
        if (gameStatus.started) {
            result.detail = 'Game has already started';
            return result;
        }
        if (playerNumbers.size > config_1.default.maxPlayers) {
            result.detail = 'Too many players in game';
            return result;
        }
        const newPlayerRef = this.ref(`players/${gameid}/${this.generatePriority(playerNumbers)}`);
        (0, database_1.set)(newPlayerRef, { username, status: 'ready' });
        return { action: 'lobby', dest: 'lobby' };
    }
    createLobby(gameid, username) {
        (0, database_1.set)(this.ref(`game-statuses/${gameid}`), {
            started: false,
            finished: false,
        });
        const newPlayerRef = this.ref(`players/${gameid}/${this.generatePriority()}`);
        (0, database_1.set)(newPlayerRef, { username, status: 'ready' });
    }
    async getGameStatus(gameid) {
        return this.getRef(`game-statuses/${gameid}`);
    }
    async listGameStatus() {
        return this.getRef('game-statuses');
    }
    async createGame(user) {
        if (!(0, general_1.validUsername)(user)) {
            return false;
        }
        const gameStatuses = await this.listGameStatus();
        const usedIds = new Set(Object.keys(gameStatuses).map(id => parseInt(id)));
        const devGame = user.match(/Jacob-dev-test-(draw|write)/i);
        if (devGame) {
            return this.createDevGame(devGame, Math.max(...usedIds) + 1);
        }
        let newId = Math.floor(Math.random() * 999999 + 1);
        const randomThreshold = 0.5;
        while (usedIds.has(newId)) {
            if (usedIds.size < randomThreshold * 999999) {
                newId = Math.floor(Math.random() * 999999 + 1);
            }
            else {
                newId++;
            }
        }
        await this.createLobby(newId, user);
        return `${newId}`;
    }
    async createDevGame([username, key], gameid) {
        if (!/^draw|write$/i.test(key))
            return false;
        const isDraw = /^draw$/i.test(key);
        try {
            const promises = [];
            promises.push((0, database_1.set)(this.ref(`game-statuses/${gameid}`), {
                started: true,
                finished: false,
            }));
            const newPlayerRef = this.ref(`players/${gameid}/${this.generatePriority()}`);
            promises.push((0, database_1.set)(newPlayerRef, { username, status: 'missing' }));
            const roundRef = this.ref(`game/${gameid}/round`);
            const round0 = {
                roundnumber: isDraw ? 1 : 2,
                endTime: -1,
            };
            promises.push((0, database_1.set)(roundRef, round0));
            const staticRoundInfoRef = this.ref(`game/${gameid}/staticRoundInfo`);
            promises.push((0, database_1.set)(staticRoundInfoRef, {
                lastRound: 1000,
                roundLength: -1,
            }));
            const newRef = this.ref(`game/${gameid}/players/${username}`);
            promises.push((0, database_1.set)(newRef, { to: username, from: username }));
            const finishedRef = this.ref(`game/${gameid}/finished/${username}`);
            promises.push((0, database_1.set)(finishedRef, -1));
            await Promise.all(promises);
        }
        catch (e) {
            console.error(e);
            return false;
        }
        return `${gameid}`;
    }
    async beginGame(gameid, roundLength) {
        const roundRef = this.ref(`game/${gameid}/round`);
        const round0 = {
            roundnumber: 0,
            endTime: Date.now() + roundLength,
        };
        if (roundLength === -1)
            round0.endTime = -1;
        (0, database_1.set)(roundRef, round0);
        const playerList = Object.values(await this.getWaitingPlayers(gameid));
        const staticRoundInfoRef = this.ref(`game/${gameid}/staticRoundInfo`);
        (0, database_1.set)(staticRoundInfoRef, {
            lastRound: playerList.length - 1,
            roundLength,
        });
        const promises = [];
        for (let i = 0; i < playerList.length; i++) {
            const name = playerList[i].username;
            const fromIdx = i - 1 < 0 ? playerList.length - 1 : i - 1;
            const toIdx = (i + 1) % playerList.length;
            const from = playerList[fromIdx].username;
            const to = playerList[toIdx].username;
            const newRef = this.ref(`game/${gameid}/players/${name}`);
            promises.push((0, database_1.set)(newRef, { to, from }));
            const finishedRef = this.ref(`game/${gameid}/finished/${name}`);
            promises.push((0, database_1.set)(finishedRef, -1));
        }
        await Promise.all(promises);
        const startedRef = this.ref(`game-statuses/${gameid}/started`);
        await (0, database_1.set)(startedRef, true);
        return;
    }
    async submitRound(gameid, name, round, rawContent, staticRoundInfo) {
        const contentType = round % 2 === 0 ? 'text' : 'image';
        const content = rawContent instanceof Blob ? await this.uploadImage(gameid, name, round, rawContent) : rawContent || this.getDefaultContent(contentType);
        const savedContent = { contentType, content };
        const stackRef = this.ref(`game/${gameid}/stacks/${name}/${round}`);
        await (0, database_1.set)(stackRef, savedContent);
        const playerFinishedRef = this.ref(`game/${gameid}/finished/${name}`);
        await (0, database_1.set)(playerFinishedRef, round);
        const finished = await this.getRef(`game/${gameid}/finished`);
        for (let player in finished) {
            if (finished[player] < round) {
                return;
            }
        }
        if (round == staticRoundInfo.lastRound) {
            await this.finalizeGame(gameid);
            return;
        }
        const roundRef = this.ref(`game/${gameid}/round/`);
        const newRoundData = {
            roundnumber: round + 1,
            endTime: Date.now() + staticRoundInfo.roundLength,
        };
        if (staticRoundInfo.roundLength === -1)
            newRoundData.endTime = -1;
        await (0, database_1.set)(roundRef, newRoundData);
        return;
    }
    async fetchCard(gameid, target, round) {
        return this.getRef(`game/${gameid}/stacks/${target}/${round}`);
    }
    async turnInMissing(gameid, number) {
        if (gameid > 999999) {
            return true;
        }
        const status = await this.getRef(`players/${gameid}/${number}/status`);
        if (status === 'missing') {
            (0, database_1.set)(this.ref(`players/${gameid}/${number}/status`), 'ready');
            return true;
        }
        return false;
    }
    attachMissingListener(gameid, playerNumber) {
        const myStatusRef = this.ref(`players/${gameid}/${playerNumber}/status`);
        const listener = (0, database_1.onDisconnect)(myStatusRef);
        listener.set('missing');
        return listener;
    }
    attachGameStatusListener(gameid, callback) {
        return this.attachListener(`game-statuses/${gameid}`, callback);
    }
    attachPlayerListener(gameid, callback) {
        return this.attachListener(`players/${gameid}`, callback);
    }
    attachRoundListener(gameid, callback) {
        return this.attachListener(`game/${gameid}/round`, callback);
    }
    attachFinishedListener(gameid, callback) {
        return this.attachListener(`game/${gameid}/finished`, callback);
    }
    attachListener(path, callback) {
        const pathRef = this.ref(path);
        return (0, database_1.onValue)(pathRef, callback);
    }
    async getWaitingPlayers(gameid) {
        return this.getRef(`players/${gameid}`);
    }
    async getToAndFrom(gameid, name) {
        return this.getRef(`game/${gameid}/players/${name}`);
    }
    async getPlayerNumber(gameid, name) {
        const players = await this.getWaitingPlayers(gameid);
        for (let num in players) {
            if (players[num].username === name) {
                return num;
            }
        }
        return undefined;
    }
    async getStaticRoundInfo(gameid) {
        return this.getRef(`game/${gameid}/staticRoundInfo`);
    }
    async finalizeGame(gameid) {
        const stackData = await this.getRef(`game/${gameid}/stacks`);
        const playerOrder = await this.getRef(`game/${gameid}/players`);
        const roundLength = await this.getRef(`game/${gameid}/staticRoundInfo/roundLength`);
        const metadata = {
            date: new Date().toString(),
            roundLength,
        };
        const finalStackData = {};
        for (let player in stackData) {
            let source = player;
            finalStackData[player] = {};
            for (let i = 0; i < stackData[source].length; i++) {
                finalStackData[player][i] = { ...stackData[source][i], from: source };
                source = playerOrder[source].to;
            }
        }
        const gameFinishedRef = this.ref(`game-statuses/${gameid}/finished`);
        (0, database_1.set)(gameFinishedRef, true);
        this.storeGame(gameid, finalStackData, metadata).then(success => {
            (0, database_1.remove)(this.ref(`game/${gameid}`));
        }, failure => {
            console.log('failed to store game');
        });
        return;
    }
    async sendAddTime(gameid, msToAdd) {
        if (msToAdd < 1000)
            return;
        const oldEndTime = await this.getRef(`game/${gameid}/round/endTime`);
        if (!oldEndTime)
            throw new Error('Cannot find game round to add time');
        const baseTime = Math.max(oldEndTime, Date.now());
        const endTime = baseTime + msToAdd;
        return (0, database_1.set)(this.ref(`game/${gameid}/round/endTime`), endTime);
    }
    async uploadImage(gameid, player, round, imgData) {
        if (!imgData || imgData.size === 0) {
            return '/default.png';
        }
        const imgref = (0, storage_1.ref)(this.connection.storage, `/games/${gameid}/${round}/${player}.png`);
        (0, storage_1.updateMetadata)(imgref, { cacheControl: 'public,max-age=86400' });
        await (0, storage_1.uploadBytes)(imgref, imgData, { contentType: 'image/png' });
        return (0, storage_1.getDownloadURL)(imgref);
    }
}
exports.BYFOFirebaseAdapter = BYFOFirebaseAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlyZWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZmlyZWJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQWlGO0FBQ2pGLGdEQUF1SDtBQUN2SCw4Q0FBOEc7QUFDOUcsc0NBQThEO0FBRTlELHNEQUE4QjtBQUM5Qix1Q0FBMEM7QUFFMUMsTUFBYSxtQkFBbUI7SUFJOUIsVUFBVSxHQUE2QjtRQUNyQyxFQUFFLEVBQUUsSUFBSTtRQUNSLElBQUksRUFBRSxJQUFJO1FBQ1YsT0FBTyxFQUFFLElBQUk7S0FDZCxDQUFDO0lBUUYsWUFBWSxNQUF1QjtRQUNqQyxNQUFNLEdBQUcsR0FBRyxJQUFBLG1CQUFhLEVBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsSUFBQSx3QkFBWSxFQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUEsc0JBQVcsRUFBQyxHQUFHLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sR0FBRyxJQUFBLG9CQUFVLEVBQUMsR0FBRyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQVNELEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBYyxFQUFFLE1BQXVCLEVBQUUsUUFBdUI7UUFDOUUsTUFBTSxNQUFNLEdBQUcsSUFBQSxlQUFHLEVBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsU0FBUyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQzFELE1BQU0sSUFBQSxrQkFBTSxFQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUU3QixNQUFNLFdBQVcsR0FBRyxJQUFBLGVBQUcsRUFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxZQUFZLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDbEUsTUFBTSxJQUFBLGtCQUFNLEVBQUMsV0FBVyxFQUFFLFFB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