export interface RefNameLVLModel {
  id: number;
  name: string;
  lvl: number;
  lvl1: number; // 0 – ще не досягнуто, 1 – досягнуто можна отримати, 2 – досягнуто і отримано
  lvl2: number;
  lvl3: number;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: number;
  avatar?: string;
  created_at: string;
  edited_at: string;
  is_verified: boolean;
  game_user: GameUser[];
  refers: RefNameLVLModel[];
  point: number;
  id_refer: number;
  my_ref: string;
  phone: string;
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
