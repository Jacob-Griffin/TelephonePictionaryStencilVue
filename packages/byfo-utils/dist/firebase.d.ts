import { DataSnapshot } from 'firebase/database';
import { FirebaseOptions } from 'firebase/app';
import * as BYFO from './types';
export declare class BYFOFirebaseAdapter {
    connection: BYFO.FirebaseConnections;
    constructor(config: FirebaseOptions);
    storeGame(gameid: number, stacks: BYFO.GameStacks): Promise<boolean>;
    getGameData(gameid: number): Promise<BYFO.Game>;
    ref(path: string): import("firebase/database").DatabaseReference;
    getRef(path: string): Promise<any>;
    generatePriority(taken?: Set<number>): number;
    getDefaultContent(type: 'text' | 'image'): string;
    addPlayerToLobby(gameid: number, username: string): Promise<BYFO.ActionResponse>;
    createLobby(gameid: number, username: string): void;
    getGameStatus(gameid: number): Promise<BYFO.GameStatus>;
    listGameStatus(): Promise<{
        [id: number]: BYFO.GameStatus;
    }>;
    createGame(user: string): Promise<string | false>;
    createDevGame([username, key]: string[], gameid: number): Promise<string | false>;
    beginGame(gameid: number, roundLength: number): Promise<void>;
    submitRound(gameid: number, name: string, round: number, rawContent: Blob | string | undefined, staticRoundInfo: BYFO.StaticRoundInfo): Promise<void>;
    fetchCard(gameid: number, target: string, round: number): Promise<any>;
    turnInMissing(gameid: number, number: number): Promise<boolean>;
    attachMissingListener(gameid: number, playerNumber: number): import("firebase/database").OnDisconnect;
    attachGameStatusListener(gameid: number, callback: (snapshot: DataSnapshot) => unknown): import("firebase/database").Unsubscribe;
    attachPlayerListener(gameid: number, callback: (snapshot: DataSnapshot) => unknown): import("firebase/database").Unsubscribe;
    attachRoundListener(gameid: number, callback: (snapshot: DataSnapshot) => unknown): import("firebase/database").Unsubscribe;
    attachFinishedListener(gameid: number, callback: (snapshot: DataSnapshot) => unknown): import("firebase/database").Unsubscribe;
    attachListener(path: string, callback: (snapshot: DataSnapshot) => unknown): import("firebase/database").Unsubscribe;
    getWaitingPlayers(gameid: number): Promise<BYFO.PlayerList>;
    getToAndFrom(gameid: number, name: string): Promise<any>;
    getPlayerNumber(gameid: number, name: string): Promise<string>;
    getStaticRoundInfo(gameid: number): Promise<any>;
    finalizeGame(gameid: number): Promise<void>;
    sendAddTime(gameid: number, msToAdd: number): Promise<void>;
    uploadImage(gameid: number, player: string, round: number, imgData: Blob | false): Promise<string>;
}
