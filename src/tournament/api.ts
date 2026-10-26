import { fetchGet, fetchPost } from '@/utils/fetchApi'
import type { TournamentStatus } from './types'

export interface TournamentVersion {
    status: TournamentStatus
    version: number
    updatedAt: string | null
}

export interface TournamentSnapshot extends TournamentVersion {
    /** null — турнір ще чернетка (для глядачів) або ще не збережений */
    state: unknown
}

export const TOURNAMENT_STATUS_LABELS: Record<TournamentStatus, string> = {
    draft: 'Чернетка',
    live: 'Триває',
    finished: 'Завершено',
}

export const getTournament = async (): Promise<TournamentSnapshot> => (await fetchGet('tournament/get')).data

export const getTournamentVersion = async (): Promise<TournamentVersion> => (await fetchGet('tournament/version')).data

export const adminGetTournament = async (): Promise<TournamentSnapshot> => (await fetchPost('admin/tournament/get', {})).data

export const adminSaveTournament = async (state: unknown, status: TournamentStatus, baseVersion: number): Promise<TournamentVersion> =>
    (await fetchPost('admin/tournament/save', { state, status, baseVersion })).data
