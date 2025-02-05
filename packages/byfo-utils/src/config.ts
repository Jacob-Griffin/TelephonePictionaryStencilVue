export const config: BYFOConfig = {
  minPlayers: 3,
  maxPlayers: 20,
  minRoundLength: 3, //Value in seconds
  maxRoundLength: 20, //Value in minutes
  textboxMaxCharacters: 280,
  usernameMaxCharacters: 32,
  addTimeIncrement: 30, //Value in seconds
};

export interface BYFOConfig {
  minPlayers: number;
  maxPlayers: number;
  minRoundLength: number;
  maxRoundLength: number;
  textboxMaxCharacters: number;
  usernameMaxCharacters: number;
  addTimeIncrement: number;
}
