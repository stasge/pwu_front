export interface EmotionUser {
  id: number;
  name: string;
}

export interface Emotion {
  id_emotion: number;
  users: EmotionUser[];
  created_at: string;
}


