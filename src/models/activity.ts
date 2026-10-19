export interface ActivityProgress {
  name: string;
  completed: number;
  required: number;
  points: number;
  maxPoints: number;
  minLevel: number;
  available: boolean;
}

export interface ActivityRole {
  id: number;
  name: string;
  lvl: number;
  /** true — сьогоднішню нагороду за активність уже отримано */
  complete?: boolean;
  progress: ActivityProgress[];
}

export interface ActivityAccount {
  /** id ігрового акаунта (= GameUser.id_game) */
  id: number;
  roles: ActivityRole[];
}
