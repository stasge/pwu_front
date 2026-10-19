export type PollStatus = 'draft' | 'scheduled' | 'active' | 'finished';
export type PollVisibility = 'anonymous' | 'public' | 'public_after_finish';

/** Опитування в списку (без варіантів). Поля з null сервер не віддає взагалі. */
export interface PollSummary {
  id: number;
  title: string;
  description?: string;
  visibility: PollVisibility;
  status: PollStatus;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
  /** Тільки в адмінському списку */
  createdBy?: number;
  /** Чи відкривав користувач опитування (поки бекенд не віддає — рахуємо на фронті) */
  isViewed?: boolean;
}

/** Варіант відповіді — у snake_case, як віддає сервер */
export interface PollOption {
  id: number;
  poll_id: number;
  text: string;
  sort_order: number;
  vote_count: number;
  percentage: number;
}

export interface PollVoter {
  optionId: number;
  userId: number;
  username: string;
  /** Ім'я користувача; показуємо в пріоритеті, якщо заповнене */
  name?: string;
}

/** Ім'я для відображення: name, а якщо його немає — username */
export const voterDisplayName = (voter: PollVoter) => voter.name?.trim() || voter.username

export interface Poll extends PollSummary {
  options: PollOption[];
  totalVotes: number;
  hasVoted?: boolean;
  myOptionId?: number;
  canVote?: boolean;
  voters?: PollVoter[];
  deletedAt?: string;
}

export interface PollListResponse {
  polls: PollSummary[];
  total: number;
}

export const POLL_STATUS_LABELS: Record<PollStatus, string> = {
  draft: 'Чернетка',
  scheduled: 'Заплановане',
  active: 'Триває',
  finished: 'Завершене',
};

export const POLL_VISIBILITY_LABELS: Record<PollVisibility, string> = {
  anonymous: 'Анонімне',
  public: 'Публічне',
  public_after_finish: 'Публічне після завершення',
};
