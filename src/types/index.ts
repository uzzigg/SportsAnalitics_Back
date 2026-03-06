export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
    code?: string;
}

export interface Player {
    id: number;
    name: string;
    position: string;
    dateOfBirth?: string;
    nationality?: string;
}

export interface Team {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
    squad?: Player[];
}

export interface League {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem?: string;
}
