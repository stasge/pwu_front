export interface User {
  id: number;
  username: string;
  email: string;
  game_id: number;
  created_at: string;
  edited_at: string;
  is_verified: boolean;
  role: number;
  phone: string;
  game_user: GameUser[];
  avatar?: string;
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
  roles?: Role[];
}

interface Role {
  id: number;
  name: string;
  race: number;
  exp: number;
  reputation: number;
  sp: number;
  hp: number;
  mp: number;
  level: number;
  level2: number;
}
