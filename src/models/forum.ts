import type { User } from "./user";
import type { Emotion } from "./emotion";

export interface IForumCategory {
  id: number;
  name: string;
  created_at: string;
  edited_at: string;
  position: number;
  topic: IForumSubCategory[];
}

export interface IForumSubCategory {
  created_at: string;
  edited_at: string;
  id: number;
  id_main: number;
  position: number;
  type: number;
  messages: number;
  name: string;
  themes: number;
}

export interface IForumSubCategory {
  id: number;
  id_main: number;
  name: string;
  themes: number;
  messages: number;
  created_at: string;
  edited_at: string;
}

export interface IForumTheme {
  id: number;
  id_main: number;
  name: string;
  text: string;
  user_id: number;
  state: number;
  user: User;
  messages_count: number;
  views_count: number;
  created_at: string;
  edited_at: string;
  emotion?: Emotion[];
}

export interface IForumComment {
  id: number;
  id_theme: number;
  text: string;
  user_id: number;
  user: User;
  created_at: string;
  edited_at: string;
  emotion?: Emotion[];
}

