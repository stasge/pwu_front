export interface User {
    id: number;
    username: string;
    email: string;
    game_id: number;
    created_at: string;
    edited_at: string;
    is_verified: boolean;
    game_user: GameUser[];
}

export interface GameUser {
    id: number;
    username: string;
    id_user: number;
    id_game: number;
    is_deleted: boolean;
    created_at: string;
    edited_at: string;
    deletion_date: string;
}