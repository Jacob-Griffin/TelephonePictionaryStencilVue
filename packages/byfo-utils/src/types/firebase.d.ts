export type ActionResponse = {
    action?:string, // The action being done
    detail?:string, // The return message, if applicable
    dest?:  string  // The page to redirect to
}

export type Player = {
    username:string,
    status:  string
}

export type PlayerList = {
    [key:number]:Player
}

export type RoundContent = {
    contentType: 'text' | 'image',
    content?: string
}

export type GameStatus = {
    started:boolean,
    finished:boolean
}

export type Game = {
    players: GamePlayers,
    round: RoundData,
    staticRoundInfo: StaticRoundInfo,
    stacks: GameStacks
}

export type GamePlayers = {
    [name:string]:{
        to:string,
        from:string,
    }
}

export type RoundData = {
    roundnumber: number,
    endTime:number // unix timestamp
}

export type StaticRoundInfo  = {
    lastRound: number,
    roundLength: number //in ms
}

export type GameStacks = {
    [author:string]:{
        [roundnumber:string]: RoundContent
    }
}