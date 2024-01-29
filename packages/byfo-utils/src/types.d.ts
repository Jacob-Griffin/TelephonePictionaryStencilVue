import { Database } from 'firebase/database';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';

export declare type ActionResponse = {
  action?: string; // The action being done
  detail?: string; // The return message, if applicable
  dest?: 'lobby' | 'game'; // The page to redirect to
};

export declare type RejoinData = {
  gameid: string;
  name: string;
};

export declare type Player = {
  username: string;
  status: string;
};

export declare type PlayerList = {
  [key: number]: Player;
};

export declare type RoundContent = {
  contentType: 'text' | 'image';
  content?: string;
};

export declare type GameStatus = {
  started: boolean;
  finished: boolean;
};

export declare type Game = {
  players: GamePlayers;
  round: RoundData;
  staticRoundInfo: StaticRoundInfo;
  stacks: GameStacks;
};

export declare type GamePlayers = {
  [name: string]: {
    to: string;
    from: string;
  };
};

export declare type RoundData = {
  roundnumber: number;
  endTime: number; // unix timestamp
};

export declare type StaticRoundInfo = {
  lastRound: number;
  roundLength: number; //in ms
};

export declare type GameStacks = {
  [author: string]: {
    [roundnumber: string]: RoundContent;
  };
};

export declare type FirebaseConnections = {
  db: Firestore | null;
  rtdb: Database | null;
  storage: FirebaseStorage | null;
};
