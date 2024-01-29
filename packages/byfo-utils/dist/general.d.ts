export declare const stopPropagation: (e: Event) => void;
export declare function sortNames(names: string[]): string[];
type inObject = {
    [key: string]: string;
};
export declare function sortNamesBy(names: inObject[], sortKey: keyof inObject): inObject[];
export declare function calculatePlayerNameWidth(players: {
    name: string;
    [other: string]: string | number;
}[]): string;
export declare function validGameId(input: string): boolean;
export declare function validUsername(input: string): string | true;
export declare function invalidCharactersList(input: string): string;
export declare function inGame(location: Location): boolean;
export declare function inHome(location: Location): boolean;
export {};
