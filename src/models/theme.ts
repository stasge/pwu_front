import type { User } from "./user";

export interface Message {
    id: number;
    id_theme: number;
    text: string;
    user_id: number;
    is_admin: boolean;
    user: User;
    created_at: string;
    edited_at: string;
}

export interface Theme {
    id: number;
    name: string;
    user_id: number;
    state: number;
    is_unread: number;
    user: User;
    last: Message;
    messages_count: number;
    created_at: string;
    edited_at: string;
    text: string;
}