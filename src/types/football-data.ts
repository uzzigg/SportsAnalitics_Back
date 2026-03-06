export interface FootballDataCompetition {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
}

export interface FootballDataTeam {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
    squad?: FootballDataPlayer[];
}

export interface FootballDataPlayer {
    id: number;
    name: string;
    position: string;
    dateOfBirth: string;
    nationality: string;
}

export interface FootballDataMatchesResponse {
    matches: any[];
}
// etc, expand as needed
