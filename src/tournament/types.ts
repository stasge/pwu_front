export type Category = '90-98' | '99+'

export type TournamentStatus = 'draft' | 'live' | 'finished'

export interface Player {
    id: string
    nick: string
    class: string
    level: number
    arrived: boolean
}

export interface PlayerSnapshot {
    nick: string
    class: string
    level: number
}

export interface Substitution {
    at: string
    out: PlayerSnapshot
    in: PlayerSnapshot
}

export interface RegTeam {
    id: string
    members: Player[]
    substitutions?: Substitution[]
}

export interface Match {
    id: string
    p1: string | null
    p2: string | null
    score1: string
    score2: string
    bestOf: number
    winner: string | null
    /** технічна перемога через дискваліфікацію */
    forfeit?: boolean
    tiebreak?: boolean
}

export interface Tiebreak {
    id: string
    teamIds: string[]
    points: number
    matches: Match[]
    randomOrder: string[] | null
}

export interface Group {
    name: string
    teamIds: string[]
    matches: Match[]
    tiebreaks: Tiebreak[]
}

export type BracketPlan = 'finals-from-top4' | 'cross-semis' | 'direct-quarters'

export interface Bracket {
    size: number
    mode: 'standard' | 'finals-only' | 'cross-semis'
    rounds: Match[][]
    thirdPlace: Match
}

export interface Entry {
    id: string
    label: string
    source: 'registration' | 'randomizer'
}

export interface Disqualification {
    id: string
    at: string
}

export interface CategoryTournament {
    groups: Group[]
    /** знімок команд на момент формування турніру */
    entries: Entry[]
    bracketPlan: BracketPlan | null
    bracket: Bracket | null
    disqualified: Disqualification[]
}

export interface Randomizer {
    availableList: string[]
    formedTeams: string[][]
    teamSize: number
}

export interface TournamentData {
    teamRegistration: Record<Category, boolean>
    formats: Record<Category, number>
    players: Record<Category, Player[]>
    teams: Record<Category, RegTeam[]>
    tournaments: Record<Category, CategoryTournament>
    randomizer: Randomizer
}

export interface StandingRow {
    id: string
    played: number
    wins: number
    losses: number
    dq?: boolean
}
