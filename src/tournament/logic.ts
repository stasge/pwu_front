/**
 * Логіка PvP-турніру (перенесено з pvp-teams). Чисті функції над TournamentData:
 * адмінка мутує стан і зберігає його на бекенд, сторінка перегляду лише читає.
 * Помилки, які треба показати адміну, кидаються як TournamentError.
 */
import type {
    Bracket,
    BracketPlan,
    Category,
    CategoryTournament,
    Entry,
    Group,
    Match,
    Player,
    PlayerSnapshot,
    RegTeam,
    StandingRow,
    Tiebreak,
    TournamentData,
} from './types'

export const TEAM_SLOTS = 8
export const FORMATS = [
    { id: 2, label: '2×2' },
    { id: 3, label: '3×3' },
    { id: 6, label: '6×6' },
]
export const TEAM_FORMATS = [
    { id: 2, label: '2×2' },
    { id: 3, label: '3×3' },
]
export const CLASSES = ['чарівник', 'воїн', 'лучник', 'друїд', 'жрець', 'перевертень']
export const CATEGORIES: Category[] = ['90-98', '99+']
const GROUP_NAMES = ['А', 'Б', 'В', 'Г']

export class TournamentError extends Error {}

export function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

/* ===== Стан ===== */

export function emptyCategoryTournament(): CategoryTournament {
    return { groups: [], entries: [], bracketPlan: null, bracket: null, disqualified: [] }
}

export function createDefaultState(): TournamentData {
    return {
        teamRegistration: { '90-98': false, '99+': false },
        formats: { '90-98': 2, '99+': 2 },
        players: { '90-98': [], '99+': [] },
        teams: { '90-98': [], '99+': [] },
        tournaments: { '90-98': emptyCategoryTournament(), '99+': emptyCategoryTournament() },
        randomizer: { availableList: [], formedTeams: [], teamSize: 2 },
    }
}

function normalizePlayer(p: Partial<Player> = {}): Player {
    return {
        id: p.id || uid(),
        nick: String(p.nick ?? ''),
        class: String(p.class ?? CLASSES[0]),
        level: Number(p.level) || 0,
        arrived: !!p.arrived,
    }
}

function chunkPlayersToTeams(players: Player[], size: number): RegTeam[] {
    const teams: RegTeam[] = []
    for (let i = 0; i < players.length && teams.length < TEAM_SLOTS; i += size) {
        const members = players.slice(i, i + size).map((p) => normalizePlayer(p))
        if (members.length) teams.push({ id: uid(), members })
    }
    return teams
}

function flattenTeamsToPlayers(teams: RegTeam[]): Player[] {
    return teams.flatMap((team) => (team.members || []).map((p) => normalizePlayer(p)))
}

/** Приводить JSON з бекенду до повної форми (порожній стан → дефолтний) */
export function normalizeData(raw: any): TournamentData {
    const base = createDefaultState()
    if (!raw || typeof raw !== 'object') return base

    for (const cat of CATEGORIES) {
        const teamMode = !!raw.teamRegistration?.[cat]
        base.teamRegistration[cat] = teamMode
        const format = Number(raw.formats?.[cat])
        base.formats[cat] = (teamMode ? TEAM_FORMATS : FORMATS).some((f) => f.id === format) ? format : 2
        base.players[cat] = Array.isArray(raw.players?.[cat]) ? raw.players[cat].map(normalizePlayer) : []
        base.teams[cat] = Array.isArray(raw.teams?.[cat])
            ? raw.teams[cat]
                  .map((t: any) => ({
                      id: t.id || uid(),
                      members: (t.members || []).map(normalizePlayer),
                      ...(Array.isArray(t.substitutions) && t.substitutions.length ? { substitutions: t.substitutions } : {}),
                  }))
                  .filter((t: RegTeam) => t.members.length > 0)
            : []

        const t = raw.tournaments?.[cat] || {}
        base.tournaments[cat] = {
            groups: Array.isArray(t.groups) ? t.groups : [],
            entries: Array.isArray(t.entries) ? t.entries : [],
            bracketPlan: t.bracketPlan || null,
            bracket: t.bracket || null,
            disqualified: Array.isArray(t.disqualified) ? t.disqualified : [],
        }
    }

    if (raw.randomizer) {
        base.randomizer.availableList = Array.isArray(raw.randomizer.availableList) ? raw.randomizer.availableList : []
        base.randomizer.formedTeams = Array.isArray(raw.randomizer.formedTeams) ? raw.randomizer.formedTeams : []
        const size = Number(raw.randomizer.teamSize)
        base.randomizer.teamSize = FORMATS.some((f) => f.id === size) ? size : 2
    }
    return base
}

/* ===== Реєстрація ===== */

export function isTeamReg(data: TournamentData, cat: Category) {
    return !!data.teamRegistration[cat]
}

export function playersPerTeam(data: TournamentData, cat: Category) {
    return Number(data.formats[cat]) || 2
}

export function slotCount(data: TournamentData, cat: Category) {
    return TEAM_SLOTS * playersPerTeam(data, cat)
}

export function formatLabel(data: TournamentData, cat: Category) {
    const format = playersPerTeam(data, cat)
    return FORMATS.find((f) => f.id === format)?.label || `${format}×${format}`
}

export function getPlayers(data: TournamentData, cat: Category): Player[] {
    if (isTeamReg(data, cat)) return data.teams[cat].flatMap((team) => team.members || [])
    return data.players[cat] || []
}

export function categoryByLevel(level: number): Category {
    return Number(level) >= 99 ? '99+' : '90-98'
}

export function defaultLevelForCategory(cat: Category) {
    return cat === '99+' ? 99 : 90
}

export function joinTeamField(members: Player[], key: 'nick' | 'class' | 'level') {
    return (members || [])
        .map((m) => (m?.[key] != null ? String(m[key]) : ''))
        .filter(Boolean)
        .join(' — ')
}

function nickExists(data: TournamentData, nick: string) {
    const lower = nick.toLowerCase()
    return CATEGORIES.some((cat) => getPlayers(data, cat).some((p) => p.nick.toLowerCase() === lower))
}

export interface PlayerInput {
    nick: string
    class: string
    level: number
}

export function setTeamRegistration(data: TournamentData, cat: Category, enabled: boolean) {
    if (enabled === isTeamReg(data, cat)) return
    data.teamRegistration[cat] = enabled
    if (enabled) {
        if (playersPerTeam(data, cat) === 6) data.formats[cat] = 2
        data.teams[cat] = chunkPlayersToTeams(data.players[cat] || [], playersPerTeam(data, cat))
    } else {
        data.players[cat] = flattenTeamsToPlayers(data.teams[cat]).slice(0, slotCount(data, cat))
    }
}

export function setFormat(data: TournamentData, cat: Category, format: number) {
    const allowed = isTeamReg(data, cat) ? TEAM_FORMATS : FORMATS
    if (!allowed.some((f) => f.id === format)) return
    data.formats[cat] = format
    if (isTeamReg(data, cat)) {
        data.teams[cat] = data.teams[cat]
            .map((team) => ({ ...team, members: team.members.slice(0, format) }))
            .filter((t) => t.members.length > 0)
            .slice(0, TEAM_SLOTS)
    } else {
        data.players[cat] = data.players[cat].slice(0, slotCount(data, cat))
    }
}

export function addSoloPlayer(data: TournamentData, cat: Category, input: PlayerInput) {
    const nick = input.nick.trim()
    if (!nick) throw new TournamentError('Вкажи нік')
    if (isTeamReg(data, cat)) throw new TournamentError(`Категорія ${cat} — командна реєстрація`)
    if (nickExists(data, nick)) throw new TournamentError('Такий нік уже зареєстрований')
    const slots = slotCount(data, cat)
    if (data.players[cat].length >= slots) throw new TournamentError(`Категорія ${cat} заповнена (${slots} слотів)`)
    data.players[cat].push({ id: uid(), nick, class: input.class, level: Number(input.level), arrived: false })
}

export function addTeam(data: TournamentData, cat: Category, inputs: PlayerInput[]) {
    if (!isTeamReg(data, cat)) throw new TournamentError(`Категорія ${cat} — індивідуальна реєстрація`)
    const size = playersPerTeam(data, cat)
    if (data.teams[cat].length >= TEAM_SLOTS) throw new TournamentError(`Категорія ${cat} заповнена (${TEAM_SLOTS} команд)`)

    const members: Player[] = []
    for (let i = 0; i < size; i++) {
        const nick = inputs[i]?.nick?.trim() || ''
        const level = Number(inputs[i]?.level)
        if (!nick || !level) throw new TournamentError(`Заповни всіх ${size} гравців команди`)
        if (nickExists(data, nick) || members.some((m) => m.nick.toLowerCase() === nick.toLowerCase())) {
            throw new TournamentError(`Нік уже зайнятий: ${nick}`)
        }
        members.push({ id: uid(), nick, class: inputs[i].class, level, arrived: false })
    }
    data.teams[cat].push({ id: uid(), members })
}

export function removeTeam(data: TournamentData, cat: Category, teamId: string) {
    data.teams[cat] = data.teams[cat].filter((t) => t.id !== teamId)
}

export function removePlayer(data: TournamentData, cat: Category, id: string) {
    data.players[cat] = data.players[cat].filter((p) => p.id !== id)
}

export function teamInTournament(data: TournamentData, cat: Category, teamId: string) {
    return data.tournaments[cat].groups.some((g) => g.teamIds.includes(teamId))
}

/**
 * Заміна гравця в команді. id команди не змінюється, тож групи, матчі,
 * рахунки й сітка турніру лишаються як були — оновлюється лише підпис команди.
 */
export function substitutePlayer(data: TournamentData, cat: Category, teamId: string, outId: string, input: PlayerInput) {
    const team = data.teams[cat].find((t) => t.id === teamId)
    if (!team) return
    const index = team.members.findIndex((m) => m.id === outId)
    if (index < 0) throw new TournamentError('Обери, кого замінюємо')
    const nick = input.nick.trim()
    const level = Number(input.level)
    if (!nick || !level) throw new TournamentError('Заповни нік і рівень нового гравця')

    const outgoing = team.members[index]
    const lower = nick.toLowerCase()
    const taken = CATEGORIES.some((c) =>
        getPlayers(data, c).some((p) => p !== outgoing && p.nick.toLowerCase() === lower)
    )
    if (taken) throw new TournamentError(`Нік уже зайнятий: ${nick}`)

    team.members.splice(index, 1, { id: uid(), nick, class: input.class, level, arrived: true })
    team.substitutions = [
        ...(team.substitutions || []),
        {
            at: new Date().toISOString(),
            out: { nick: outgoing.nick, class: outgoing.class, level: outgoing.level },
            in: { nick, class: input.class, level },
        },
    ]

    // турнір показує назви зі знімка entries — оновлюємо підпис цієї ж команди
    const label = joinTeamField(team.members, 'nick')
    for (const entry of data.tournaments[cat].entries) {
        if (entry.id === teamId) entry.label = label
    }
    return outgoing.nick
}

/* ===== Рандомайзер ===== */

export function randomizerTeamSize(data: TournamentData) {
    const size = Number(data.randomizer.teamSize) || 2
    return FORMATS.some((f) => f.id === size) ? size : 2
}

export function setRandomizerTeamSize(data: TournamentData, size: number) {
    const allowed = FORMATS.some((f) => f.id === size) ? size : 2
    if (data.randomizer.formedTeams.length > 0 && allowed !== randomizerTeamSize(data)) {
        throw new TournamentError('Спочатку скинь сформовані команди')
    }
    data.randomizer.teamSize = allowed
}

/** Додає в пул ніки з реєстрації категорії й підтягує її формат. Повертає кількість доданих. */
export function addRegisteredToRandomizer(data: TournamentData, cat: Category) {
    setRandomizerTeamSize(data, playersPerTeam(data, cat))
    const used = new Set([...data.randomizer.availableList, ...data.randomizer.formedTeams.flat()])
    const incoming: string[] = []
    for (const p of getPlayers(data, cat)) {
        if (!used.has(p.nick) && !incoming.includes(p.nick)) incoming.push(p.nick)
    }
    data.randomizer.availableList = [...data.randomizer.availableList, ...incoming]
    return incoming.length
}

function playerClassByNick(data: TournamentData, nick: string) {
    const lower = String(nick).toLowerCase()
    for (const cat of CATEGORIES) {
        const found = getPlayers(data, cat).find((p) => p.nick.toLowerCase() === lower)
        if (found?.class) return found.class
    }
    return ''
}

/** Більше унікальних класів краще; при рівності — рівномірніший розподіл. */
function teamClassDiversityScore(data: TournamentData, nicks: string[]) {
    const counts = new Map<string, number>()
    for (const nick of nicks) {
        const c = playerClassByNick(data, nick)
        counts.set(c, (counts.get(c) || 0) + 1)
    }
    let sumSq = 0
    for (const n of counts.values()) sumSq += n * n
    return counts.size * 1000 - sumSq
}

/** Одна спроба: спочатку різні класи, далі — з найрідших у команді. */
function buildDiverseTeamOnce(data: TournamentData, available: string[], count: number) {
    const byClass = new Map<string, string[]>()
    for (const nick of shuffle(available)) {
        const c = playerClassByNick(data, nick)
        if (!byClass.has(c)) byClass.set(c, [])
        byClass.get(c)!.push(nick)
    }

    const team: string[] = []
    for (const c of shuffle([...byClass.keys()])) {
        if (team.length >= count) break
        const list = byClass.get(c)
        if (list?.length) team.push(list.pop()!)
    }

    const remaining: string[] = []
    for (const list of byClass.values()) remaining.push(...list)

    while (team.length < count && remaining.length) {
        const counts = new Map<string, number>()
        for (const nick of team) {
            const c = playerClassByNick(data, nick)
            counts.set(c, (counts.get(c) || 0) + 1)
        }
        let minCount = Infinity
        for (const nick of remaining) {
            minCount = Math.min(minCount, counts.get(playerClassByNick(data, nick)) || 0)
        }
        const candidates = remaining.filter((nick) => (counts.get(playerClassByNick(data, nick)) || 0) === minCount)
        const pick = candidates[Math.floor(Math.random() * candidates.length)]
        team.push(pick)
        remaining.splice(remaining.indexOf(pick), 1)
    }
    return team
}

/** 3×3 / 6×6 — чистий рандом; 2×2 — максимум різних класів. */
export function pickRandomTeam(data: TournamentData, available: string[], count: number): string[] {
    if (available.length < count) return []
    if (count !== 2) return shuffle(available).slice(0, count)

    const attempts = Math.min(96, Math.max(32, available.length * 4))
    let bestScore = -Infinity
    const bestTeams: string[][] = []
    for (let i = 0; i < attempts; i++) {
        const team = buildDiverseTeamOnce(data, available, count)
        if (team.length !== count) continue
        const score = teamClassDiversityScore(data, team)
        if (score > bestScore) {
            bestScore = score
            bestTeams.length = 0
            bestTeams.push(team)
        } else if (score === bestScore) {
            bestTeams.push(team)
        }
    }
    if (!bestTeams.length) return shuffle(available).slice(0, count)
    return bestTeams[Math.floor(Math.random() * bestTeams.length)]
}

export function commitFormedTeam(data: TournamentData, chosen: string[]) {
    data.randomizer.formedTeams = [...data.randomizer.formedTeams, chosen]
    data.randomizer.availableList = data.randomizer.availableList.filter((n) => !chosen.includes(n))
}

export function formedTeamsUsedInTournament(data: TournamentData) {
    return CATEGORIES.some((cat) => {
        const tour = data.tournaments[cat]
        return (tour.groups.length || tour.bracket) && tour.entries[0]?.source === 'randomizer'
    })
}

/** Розформувати команду: гравці повертаються в пул. Повертає повернуті ніки. */
export function disbandFormedTeam(data: TournamentData, index: number) {
    const team = data.randomizer.formedTeams[index]
    if (!team) return []
    const pool = data.randomizer.availableList
    const returned = team.filter((nick) => !pool.includes(nick))
    data.randomizer.formedTeams = data.randomizer.formedTeams.filter((_, i) => i !== index)
    data.randomizer.availableList = [...pool, ...returned]
    return returned
}

export function resetRandomizer(data: TournamentData) {
    data.randomizer.availableList = []
    data.randomizer.formedTeams = []
}

/* ===== Матчі та серії ===== */

function createSeriesMatch(p1: string | null, p2: string | null, bestOf = 1): Match {
    const match: Match = { id: uid(), p1: p1 || null, p2: p2 || null, score1: '0', score2: '0', bestOf, winner: null }
    if (match.p1 && !match.p2) match.winner = match.p1
    if (match.p2 && !match.p1) match.winner = match.p2
    return match
}

function roundRobinPairs(teamIds: string[], bestOf = 1): Match[] {
    const arr: (string | null)[] = [...teamIds]
    if (arr.length % 2 === 1) arr.push(null)
    const n = arr.length
    const matches: Match[] = []
    for (let r = 0; r < n - 1; r++) {
        for (let i = 0; i < n / 2; i++) {
            const a = arr[i]
            const b = arr[n - 1 - i]
            if (a && b) matches.push(createSeriesMatch(a, b, bestOf))
        }
        const fixed = arr[0]
        const rest = arr.slice(1)
        rest.unshift(rest.pop()!)
        arr.splice(0, arr.length, fixed, ...rest)
    }
    return matches
}

export function winsNeeded(bestOf = 1) {
    return Math.ceil(Number(bestOf || 1) / 2)
}

export function boLabel(bestOf = 1) {
    return `BO${bestOf}`
}

function isAcceptableSeriesScores(s1: number, s2: number, bestOf = 1) {
    const need = winsNeeded(bestOf)
    if (!Number.isInteger(s1) || !Number.isInteger(s2)) return false
    if (s1 < 0 || s2 < 0 || s1 > need || s2 > need) return false
    return !(s1 === need && s2 === need)
}

function parseSeriesScorePart(raw: unknown): { invalid?: boolean; value: string; num: number } {
    const cleaned = String(raw ?? '').trim()
    if (cleaned === '') return { value: '0', num: 0 }
    if (!/^\d+$/.test(cleaned)) return { invalid: true, value: '', num: 0 }
    return { value: String(Number(cleaned)), num: Number(cleaned) }
}

/** Дозволяє проміжні рахунки 0…need, відхиляє неможливі (наприклад 2:2 у BO3). */
function validateSeriesScoreEdit(match: Match, side: 1 | 2, raw: unknown) {
    const bestOf = Number(match.bestOf) || 1
    const need = winsNeeded(bestOf)
    const parsed = parseSeriesScorePart(raw)
    if (parsed.invalid) throw new TournamentError('Лише цілі числа')
    if (parsed.num > need) throw new TournamentError(`Для ${boLabel(bestOf)} максимум ${need} перемог`)
    const other = parseSeriesScorePart(side === 1 ? match.score2 : match.score1)
    const otherNum = other.invalid ? 0 : other.num
    const s1 = side === 1 ? parsed.num : otherNum
    const s2 = side === 1 ? otherNum : parsed.num
    if (!isAcceptableSeriesScores(s1, s2, bestOf)) {
        throw new TournamentError(`Для ${boLabel(bestOf)} неможливий рахунок ${s1}:${s2}`)
    }
    return parsed.value
}

export function resolveMatchWinner(match: Match | null | undefined): string | null {
    if (!match) return null
    if (match.p1 && !match.p2) return match.p1
    if (match.p2 && !match.p1) return match.p2
    const s1 = match.score1 === '' || match.score1 == null ? 0 : Number(match.score1)
    const s2 = match.score2 === '' || match.score2 == null ? 0 : Number(match.score2)
    if (Number.isNaN(s1) || Number.isNaN(s2)) return null
    const need = winsNeeded(match.bestOf || 1)
    if (s1 >= need && s1 > s2) return match.p1
    if (s2 >= need && s2 > s1) return match.p2
    return null
}

export function resolveMatchLoser(match: Match | null | undefined): string | null {
    const winner = resolveMatchWinner(match)
    if (!winner || !match) return null
    if (winner === match.p1) return match.p2
    if (winner === match.p2) return match.p1
    return null
}

/* ===== Сітка ===== */

function bestOfForRound(roundIndex: number, totalRounds: number) {
    const fromEnd = totalRounds - roundIndex
    if (fromEnd === 1) return 5
    if (fromEnd === 2) return 3
    return 1
}

function nextPowerOfTwo(n: number) {
    let p = 1
    while (p < n) p *= 2
    return p
}

function createBracket(teamIds: string[]): Bracket {
    const list = shuffle(teamIds.filter(Boolean))
    const size = Math.max(2, nextPowerOfTwo(Math.max(list.length, 2)))
    const slots: (string | null)[] = [...list]
    while (slots.length < size) slots.push(null)

    const roundCount = Math.log2(size)
    const rounds: Match[][] = []
    const firstRound: Match[] = []
    for (let i = 0; i < size; i += 2) {
        firstRound.push(createSeriesMatch(slots[i], slots[i + 1], bestOfForRound(0, roundCount)))
    }
    rounds.push(firstRound)
    for (let r = 1; r < roundCount; r++) {
        const prev = rounds[r - 1]
        const round: Match[] = []
        for (let i = 0; i < prev.length; i += 2) {
            round.push(createSeriesMatch(prev[i].winner || null, prev[i + 1].winner || null, bestOfForRound(r, roundCount)))
        }
        rounds.push(round)
    }
    return { size, rounds, thirdPlace: createSeriesMatch(null, null, 3), mode: 'standard' }
}

function createFinalsOnlyBracket(first: string, second: string, third: string, fourth: string): Bracket {
    return {
        size: 2,
        mode: 'finals-only',
        rounds: [[createSeriesMatch(first, second, 5)]],
        thirdPlace: createSeriesMatch(third, fourth, 3),
    }
}

function createCrossSemisBracket(a1: string, b2: string, b1: string, a2: string): Bracket {
    return {
        size: 4,
        mode: 'cross-semis',
        rounds: [[createSeriesMatch(a1, b2, 3), createSeriesMatch(b1, a2, 3)], [createSeriesMatch(null, null, 5)]],
        thirdPlace: createSeriesMatch(null, null, 3),
    }
}

function resetSlot(match: Match, side: 'p1' | 'p2', value: string | null) {
    if (match[side] === value) return
    match[side] = value
    match.score1 = '0'
    match.score2 = '0'
    match.winner = null
    delete match.forfeit
}

function propagateBracketOnce(bracket: Bracket) {
    const { rounds, thirdPlace } = bracket
    for (let r = 0; r < rounds.length; r++) {
        for (const match of rounds[r]) match.winner = resolveMatchWinner(match)
        if (r < rounds.length - 1) {
            const next = rounds[r + 1]
            for (let i = 0; i < next.length; i++) {
                resetSlot(next[i], 'p1', rounds[r][i * 2]?.winner || null)
                resetSlot(next[i], 'p2', rounds[r][i * 2 + 1]?.winner || null)
            }
        }
    }
    if (rounds.length >= 2) {
        const semis = rounds[rounds.length - 2]
        if (semis.length === 2) {
            resetSlot(thirdPlace, 'p1', resolveMatchLoser(semis[0]))
            resetSlot(thirdPlace, 'p2', resolveMatchLoser(semis[1]))
        }
    }
    thirdPlace.winner = resolveMatchWinner(thirdPlace)
}

function propagateBracket(tour: CategoryTournament) {
    const bracket = tour.bracket
    if (!bracket) return
    const dq = disqualifiedIds(tour)
    // без дискваліфікацій — рівно один прохід
    for (let pass = 0; pass < 8; pass++) {
        propagateBracketOnce(bracket)
        if (!dq.size || !applyBracketForfeits(bracket, dq)) break
    }
}

export function roundLabel(roundIndex: number, totalRounds: number) {
    const fromEnd = totalRounds - roundIndex
    if (fromEnd === 1) return 'Фінал'
    if (fromEnd === 2) return 'Півфінал'
    if (fromEnd === 3) return 'Чвертьфінал'
    return `Раунд ${roundIndex + 1}`
}

export function getBracketMatch(tour: CategoryTournament, kind: 'round' | 'third', ri: number, mi: number) {
    if (!tour.bracket) return null
    if (kind === 'third') return tour.bracket.thirdPlace
    return tour.bracket.rounds[ri]?.[mi] || null
}

export function setBracketScore(tour: CategoryTournament, match: Match, side: 1 | 2, raw: unknown) {
    if (!tour.bracket || !match.p1 || !match.p2) return
    const value = validateSeriesScoreEdit(match, side, raw)
    if (side === 1) match.score1 = value
    else match.score2 = value
    delete match.forfeit
    propagateBracket(tour)
}

export function stepBracketScore(tour: CategoryTournament, match: Match, side: 1 | 2, delta: number) {
    const currentRaw = side === 1 ? match.score1 : match.score2
    const current = currentRaw === '' || currentRaw == null || Number.isNaN(Number(currentRaw)) ? 0 : Number(currentRaw)
    setBracketScore(tour, match, side, String(Math.max(0, current + delta)))
}

/** Призери категорії, коли фінал (і бій за 3 місце) зіграно */
export function podium(tour: CategoryTournament) {
    const bracket = tour.bracket
    if (!bracket) return null
    const final = bracket.rounds[bracket.rounds.length - 1]?.[0]
    const first = resolveMatchWinner(final)
    if (!first) return null
    return { first, second: resolveMatchLoser(final), third: resolveMatchWinner(bracket.thirdPlace) }
}

/** Категорію завершено: зіграно і фінал, і бій за 3 місце */
export function categoryFinished(tour: CategoryTournament) {
    const p = podium(tour)
    return !!p?.first && !!p.third
}

/* ===== Команди турніру ===== */

/** Команди, які підуть у турнір: з командної реєстрації або з рандомайзера */
export function getEntryTeams(data: TournamentData, cat: Category): Entry[] {
    if (isTeamReg(data, cat) && data.teams[cat].length) {
        return data.teams[cat].map((t) => ({ id: t.id, label: joinTeamField(t.members, 'nick'), source: 'registration' }))
    }
    return data.randomizer.formedTeams.map((members, i) => ({
        id: `rnd-${i}-${members.join('|')}`,
        label: members.join(' — '),
        source: 'randomizer',
    }))
}

/** Гравець за ніком з будь-якої категорії (класи/рівні для команд рандомайзера) */
export function findPlayerByNick(data: TournamentData, nick: string): PlayerSnapshot {
    const lower = nick.toLowerCase()
    for (const cat of CATEGORIES) {
        const found = getPlayers(data, cat).find((p) => p.nick.toLowerCase() === lower)
        if (found) return { nick: found.nick, class: found.class, level: found.level }
    }
    return { nick, class: '', level: 0 }
}

/** Склад команди турніру з класами й рівнями */
export function teamMembers(data: TournamentData, cat: Category, entry: Entry): PlayerSnapshot[] {
    const team = data.teams[cat].find((t) => t.id === entry.id)
    if (team) return team.members.map((m) => ({ nick: m.nick, class: m.class, level: m.level }))
    return entry.label.split(' — ').map((nick) => findPlayerByNick(data, nick))
}

export function teamLabel(data: TournamentData, cat: Category, id: string | null) {
    if (!id) return ''
    const entry = data.tournaments[cat].entries.find((e) => e.id === id)
    if (entry) return entry.label
    const team = data.teams[cat].find((t) => t.id === id)
    if (team) return joinTeamField(team.members, 'nick')
    return String(id)
}

/* ===== Групи ===== */

export function disqualifiedIds(tour: CategoryTournament) {
    return new Set(tour.disqualified.map((d) => d.id))
}

export function isDisqualified(tour: CategoryTournament, id: string | null) {
    return !!id && disqualifiedIds(tour).has(id)
}

function standingsFromMatches(teamIds: string[], matches: Match[]): StandingRow[] {
    const stats: Record<string, StandingRow> = Object.fromEntries(
        teamIds.map((id) => [id, { id, played: 0, wins: 0, losses: 0 }])
    )
    for (const m of matches) {
        const w = resolveMatchWinner(m)
        if (!w || !m.p1 || !m.p2) continue
        for (const side of [m.p1, m.p2]) {
            const row = stats[side]
            if (!row) continue
            row.played += 1
            if (w === side) row.wins += 1
            else row.losses += 1
        }
    }
    return Object.values(stats)
}

export function groupStandings(tour: CategoryTournament, group: Group, { includeTiebreaks = false } = {}) {
    const matches = [
        ...group.matches.filter((m) => !m.tiebreak),
        ...(includeTiebreaks ? group.tiebreaks.flatMap((tb) => tb.matches) : []),
    ]
    const rows = standingsFromMatches(group.teamIds, matches)
    // дискваліфіковані — завжди в самому низу таблиці, незалежно від балів
    const dq = disqualifiedIds(tour)
    for (const row of rows) if (dq.has(row.id)) row.dq = true
    return rows.sort((a, b) => Number(!!a.dq) - Number(!!b.dq) || b.wins - a.wins || a.losses - b.losses)
}

function sameStandingTier(a: StandingRow, b: StandingRow) {
    return a.wins === b.wins && !!a.dq === !!b.dq
}

interface Cluster {
    wins: number
    teamIds: string[]
    startIndex?: number
}

function findTiedClusters(standings: StandingRow[]): Cluster[] {
    const clusters: Cluster[] = []
    let i = 0
    while (i < standings.length) {
        let j = i + 1
        while (j < standings.length && sameStandingTier(standings[j], standings[i])) j += 1
        // між дискваліфікованими перегравання не потрібне
        if (j - i >= 2 && !standings[i].dq) {
            clusters.push({ wins: standings[i].wins, teamIds: standings.slice(i, j).map((row) => row.id), startIndex: i })
        }
        i = j
    }
    return clusters
}

/** Зона місця в групі: команди з однієї зони потрапляють в одне й те саме місце далі. */
function placementZone(plan: BracketPlan | null, place: number) {
    if (plan === 'finals-from-top4') {
        if (place <= 2) return 'final'
        if (place <= 4) return 'third'
        return 'out'
    }
    if (plan === 'cross-semis') {
        // 1 і 2 місця сіються по-різному, тож кожне — окрема зона
        if (place <= 2) return `seed-${place}`
        return 'out'
    }
    return `place-${place}`
}

/** Перегравання потрібне лише коли нічия перетинає межу зон */
function shouldSkipTiebreakCluster(cluster: Cluster, standings: StandingRow[], plan: BracketPlan | null) {
    if (!cluster.teamIds.length) return false
    if (plan !== 'finals-from-top4' && plan !== 'cross-semis') return false
    const set = new Set(cluster.teamIds)
    const start = cluster.startIndex ?? standings.findIndex((row) => set.has(row.id))
    if (start < 0) return false
    return placementZone(plan, start + 1) === placementZone(plan, start + cluster.teamIds.length)
}

export function mainGroupFullyPlayed(group: Group) {
    const main = group.matches.filter((m) => !m.tiebreak)
    return main.length > 0 && main.every((m) => resolveMatchWinner(m) != null)
}

/** Більше незіграних боїв не перебираємо (2^k варіантів) — у групах до 5 команд їх максимум 10 */
const MAX_PENDING_FOR_ANALYSIS = 12

/**
 * Незіграні групові бої, результат яких ні на що не впливає: при будь-якому розкладі
 * решти боїв кожна команда опиняється в тій самій зоні (фінал / 3 місце / виліт, або
 * посів у сітці), хоч би хто виграв цей бій. Напр. дві команди, що й так обидві йдуть у фінал.
 */
export function pointlessGroupMatchIds(tour: CategoryTournament, group: Group): Set<string> {
    const plan = tour.bracketPlan
    const result = new Set<string>()
    if (plan !== 'finals-from-top4' && plan !== 'cross-semis') return result
    const main = group.matches.filter((m) => !m.tiebreak)
    const pending = main.filter((m) => m.p1 && m.p2 && !resolveMatchWinner(m))
    if (!pending.length || pending.length > MAX_PENDING_FOR_ANALYSIS) return result

    const dq = disqualifiedIds(tour)
    const baseWins = new Map(group.teamIds.map((id) => [id, 0]))
    for (const m of main) {
        const w = resolveMatchWinner(m)
        if (w && m.p1 && m.p2) baseWins.set(w, (baseWins.get(w) || 0) + 1)
    }

    /** Для кожної команди — множина зон, куди вона може потрапити (з урахуванням нічиїх) */
    const zonesFor = (mask: number) => {
        const wins = new Map(baseWins)
        pending.forEach((m, i) => {
            const w = (mask >> i) & 1 ? m.p2! : m.p1!
            wins.set(w, (wins.get(w) || 0) + 1)
        })
        const active = group.teamIds.filter((id) => !dq.has(id))
        return group.teamIds
            .map((id) => {
                if (dq.has(id)) return 'out'
                const own = wins.get(id) || 0
                const best = 1 + active.filter((o) => (wins.get(o) || 0) > own).length
                const worst = active.filter((o) => (wins.get(o) || 0) >= own).length
                const zones = new Set<string>()
                for (let place = best; place <= worst; place++) zones.add(placementZone(plan, place))
                return [...zones].sort().join(',')
            })
            .join('|')
    }

    const total = 1 << pending.length
    const cache = new Map<number, string>()
    const zonesCached = (mask: number) => {
        if (!cache.has(mask)) cache.set(mask, zonesFor(mask))
        return cache.get(mask)!
    }
    pending.forEach((m, i) => {
        const bit = 1 << i
        for (let mask = 0; mask < total; mask++) {
            if (mask & bit) continue
            if (zonesCached(mask) !== zonesCached(mask | bit)) return
        }
        result.add(m.id)
    })
    return result
}

/** Прибрати непотрібний груповий бій (див. pointlessGroupMatchIds) */
export function removeGroupMatch(tour: CategoryTournament, group: Group, matchId: string) {
    group.matches = group.matches.filter((m) => m.id !== matchId)
    group.tiebreaks = []
    ensureGroupTiebreaks(tour, group)
}

function tiebreakFullyPlayed(tb: Tiebreak) {
    return tb.matches.every((m) => resolveMatchWinner(m) != null)
}

export function resolveTiebreakOrder(tb: Tiebreak) {
    if (Array.isArray(tb.randomOrder) && tb.randomOrder.length === tb.teamIds.length) {
        return { order: [...tb.randomOrder], needsRandom: false, pending: false }
    }
    if (!tiebreakFullyPlayed(tb)) return { order: null, needsRandom: false, pending: true }
    const table = standingsFromMatches(tb.teamIds, tb.matches).sort((a, b) => b.wins - a.wins || a.losses - b.losses)
    if (findTiedClusters(table).length) return { order: null, needsRandom: true, pending: false }
    return { order: table.map((row) => row.id), needsRandom: false, pending: false }
}

const clusterKey = (ids: string[]) => [...ids].sort().join('|')

function ensureGroupTiebreaks(tour: CategoryTournament, group: Group) {
    if (!mainGroupFullyPlayed(group)) return
    if (!group.tiebreaks) group.tiebreaks = []

    const mainStandings = groupStandings(tour, group)
    const plan = tour.bracketPlan
    const clusters = findTiedClusters(mainStandings).filter(
        (cluster) => !shouldSkipTiebreakCluster(cluster, mainStandings, plan)
    )

    // прибрати зайві перегравання (напр. нічия 1–2 у фінальному форматі)
    group.tiebreaks = group.tiebreaks.filter(
        (tb) => !shouldSkipTiebreakCluster({ wins: tb.points, teamIds: tb.teamIds }, mainStandings, plan)
    )

    const existingKeys = new Set(group.tiebreaks.map((tb) => clusterKey(tb.teamIds)))
    for (const cluster of clusters) {
        const key = clusterKey(cluster.teamIds)
        if (existingKeys.has(key)) continue
        group.tiebreaks.push({
            id: uid(),
            teamIds: [...cluster.teamIds],
            points: cluster.wins,
            matches: roundRobinPairs(cluster.teamIds, 1).map((m) => ({ ...m, tiebreak: true })),
            randomOrder: null,
        })
        existingKeys.add(key)
    }
}

/** Прибрати перегравання, які вже не відповідають таблиці (після DQ / скасування DQ). */
function pruneStaleTiebreaks(tour: CategoryTournament, group: Group) {
    if (!group.tiebreaks?.length) return
    if (!mainGroupFullyPlayed(group)) {
        group.tiebreaks = []
        return
    }
    const keys = new Set(findTiedClusters(groupStandings(tour, group)).map((c) => clusterKey(c.teamIds)))
    group.tiebreaks = group.tiebreaks.filter((tb) => keys.has(clusterKey(tb.teamIds)))
}

/** Підсумковий порядок у групі з урахуванням перегравань (без мутацій) */
function resolvedGroupStandings(tour: CategoryTournament, group: Group) {
    const plan = tour.bracketPlan
    const main = groupStandings(tour, group)
    const order: string[] = []
    let i = 0
    while (i < main.length) {
        let j = i + 1
        while (j < main.length && sameStandingTier(main[j], main[i])) j += 1
        const chunk = main.slice(i, j).map((row) => row.id)
        if (chunk.length === 1 || main[i].dq) {
            order.push(chunk[0])
        } else if (shouldSkipTiebreakCluster({ wins: main[i].wins, teamIds: chunk }, main, plan)) {
            order.push(...chunk)
        } else {
            const tb = group.tiebreaks.find((item) => clusterKey(item.teamIds) === clusterKey(chunk))
            if (!tb) return { order: null, blocked: true }
            const resolved = resolveTiebreakOrder(tb)
            if (!resolved.order) return { order: null, blocked: true }
            order.push(...resolved.order)
        }
        i = j
    }
    return { order, blocked: false }
}

export function allGroupsPlacementReady(tour: CategoryTournament) {
    return tour.groups.every((g) => !resolvedGroupStandings(tour, g).blocked)
}

export function groupsFullyPlayed(tour: CategoryTournament) {
    return tour.groups.every((g) => mainGroupFullyPlayed(g))
}

function clusterPlaces(tour: CategoryTournament, group: Group, teamIds: string[]) {
    const set = new Set(teamIds)
    const places: number[] = []
    groupStandings(tour, group).forEach((row, index) => {
        if (set.has(row.id)) places.push(index + 1)
    })
    return places
}

function placementLabelForPlan(plan: BracketPlan | null, place: number) {
    if (plan === 'finals-from-top4') {
        if (place <= 2) return 'у фінал'
        if (place === 3 || place === 4) return 'у бій за 3 місце'
        return 'вибуває'
    }
    if (plan === 'cross-semis') {
        if (place === 1) return '1 місце групи → сітка'
        if (place === 2) return '2 місце групи → сітка'
        return 'не проходить далі'
    }
    return `${place} місце`
}

function tiebreakPurposeLabel(plan: BracketPlan | null, places: number[]) {
    if (!places.length) return ''
    const min = Math.min(...places)
    const max = Math.max(...places)
    if (plan === 'finals-from-top4') {
        if (max >= 5) return 'на вибування'
        if (min <= 2) return 'за прохід у фінал'
        if (min >= 3 && max <= 4) return 'за бій за 3 місце'
        return ''
    }
    if (plan === 'cross-semis') return min <= 2 ? 'за прохід у сітку' : 'на вибування'
    return ''
}

export function tiebreakTitle(tour: CategoryTournament, group: Group, tb: Tiebreak) {
    const purpose = tiebreakPurposeLabel(tour.bracketPlan, clusterPlaces(tour, group, tb.teamIds))
    const base = `Перегравання ${tb.teamIds.length} команд`
    return purpose ? `${base} ${purpose}` : base
}

/** Рядки «команда — куди потрапила» для зарандомленого перегравання */
export function describeRandomPlacement(data: TournamentData, cat: Category, group: Group, tb: Tiebreak) {
    if (!tb.randomOrder?.length) return []
    const tour = data.tournaments[cat]
    const places = clusterPlaces(tour, group, tb.teamIds)
    return tb.randomOrder.map((id, i) =>
        places.length === tb.randomOrder!.length
            ? `${teamLabel(data, cat, id)} — ${placementLabelForPlan(tour.bracketPlan, places[i])}`
            : teamLabel(data, cat, id)
    )
}

function splitIntoGroups(teamIds: string[], groupCount: number): Group[] {
    const groups: Group[] = Array.from({ length: groupCount }, (_, i) => ({
        name: GROUP_NAMES[i],
        teamIds: [],
        matches: [],
        tiebreaks: [],
    }))
    shuffle(teamIds).forEach((id, i) => groups[i % groupCount].teamIds.push(id))
    groups.forEach((g) => (g.matches = roundRobinPairs(g.teamIds, 1)))
    return groups
}

export function describePlan(n: number) {
    if (n === 4 || n === 5) return `${n} команд${n === 4 ? 'и' : ''} → 1 група; топ-4: 1–2 у фінал, 3–4 за 3 місце`
    if (n === 6 || n === 7) return `${n} команд → 2 групи; сітка: 1А–2Б і 1Б–2А`
    if (n === 8) return '8 команд → одразу чвертьфінали (BO1)'
    return `Підтримується 4–8 команд (зараз ${n})`
}

/** Формує групи або сітку з поточних команд. Повертає повідомлення для адміна. */
export function setupTournament(data: TournamentData, cat: Category) {
    const entries = getEntryTeams(data, cat)
    const n = entries.length
    if (n < 4) throw new TournamentError('Потрібно мінімум 4 команди (реєстрація або рандомайзер)')
    if (n > 8) throw new TournamentError('Зараз підтримується до 8 команд')

    const tour = data.tournaments[cat]
    const ids = entries.map((e) => e.id)
    tour.entries = entries
    tour.groups = []
    tour.bracket = null
    tour.bracketPlan = null
    tour.disqualified = []

    if (n <= 5) {
        tour.groups = splitIntoGroups(ids, 1)
        tour.bracketPlan = 'finals-from-top4'
        return 'Група сформована. Після всіх боїв — сітка фіналу'
    }
    if (n <= 7) {
        tour.groups = splitIntoGroups(ids, 2)
        tour.bracketPlan = 'cross-semis'
        return '2 групи сформовано. Після всіх боїв — півфінали'
    }
    tour.bracket = createBracket(ids)
    tour.bracketPlan = 'direct-quarters'
    propagateBracket(tour)
    return 'Сітка чвертьфіналів готова'
}

export function canBuildFromGroups(tour: CategoryTournament) {
    return tour.groups.length > 0 && (tour.bracketPlan === 'finals-from-top4' || tour.bracketPlan === 'cross-semis')
}

export function buildBracketFromGroups(data: TournamentData, cat: Category) {
    const tour = data.tournaments[cat]
    if (!tour.groups.length) throw new TournamentError('Спочатку потрібні групи')
    if (!groupsFullyPlayed(tour)) throw new TournamentError('Закінчи всі групові матчі')
    tour.groups.forEach((g) => ensureGroupTiebreaks(tour, g))
    if (!allGroupsPlacementReady(tour)) throw new TournamentError('Є нічиї — потрібне перегравання або рандом')

    if (tour.bracketPlan === 'finals-from-top4') {
        const { order } = resolvedGroupStandings(tour, tour.groups[0])
        if (!order || order.length < 4) throw new TournamentError('Потрібно щонайменше 4 команди в таблиці')
        tour.bracket = createFinalsOnlyBracket(order[0], order[1], order[2], order[3])
        propagateBracket(tour)
        return 'Фінал і бій за 3 місце зібрано з таблиці'
    }
    if (tour.bracketPlan === 'cross-semis') {
        if (tour.groups.length < 2) throw new TournamentError('Потрібно 2 групи')
        const a = resolvedGroupStandings(tour, tour.groups[0]).order
        const b = resolvedGroupStandings(tour, tour.groups[1]).order
        if (!a || !b || a.length < 2 || b.length < 2) throw new TournamentError('У кожній групі потрібно топ-2')
        tour.bracket = createCrossSemisBracket(a[0], b[1], b[0], a[1])
        propagateBracket(tour)
        return 'Півфінали: 1А–2Б і 1Б–2А'
    }
    throw new TournamentError('Для цього формату сітка будується одразу')
}

export function clearTournament(data: TournamentData, cat: Category) {
    data.tournaments[cat] = emptyCategoryTournament()
}

function toggleBo1Winner(match: Match, side: 1 | 2) {
    const picked = side === 1 ? match.p1 : match.p2
    if (resolveMatchWinner(match) === picked) {
        match.score1 = ''
        match.score2 = ''
    } else {
        match.score1 = side === 1 ? '1' : '0'
        match.score2 = side === 1 ? '0' : '1'
    }
    match.winner = resolveMatchWinner(match)
    delete match.forfeit
}

/** Клік по команді в груповому матчі: обрати / зняти переможця */
export function pickGroupWinner(tour: CategoryTournament, group: Group, match: Match, side: 1 | 2) {
    if (!match.p1 || !match.p2) return
    toggleBo1Winner(match, side)
    // основний результат змінився → перегравання створюються наново
    group.tiebreaks = []
    ensureGroupTiebreaks(tour, group)
}

export function pickTiebreakWinner(tb: Tiebreak, match: Match, side: 1 | 2) {
    if (!match.p1 || !match.p2) return
    toggleBo1Winner(match, side)
    tb.randomOrder = null
}

export function randomizeTiebreak(tb: Tiebreak) {
    tb.randomOrder = shuffle([...tb.teamIds])
}

/* ===== Дискваліфікація =====
 * Зіграні результати лишаються. Незіграні матчі дискваліфікованої команди
 * зараховуються суперникам як технічні перемоги (match.forfeit = true),
 * у таблиці групи вона опускається в самий низ і далі не проходить.
 */

function applyForfeit(match: Match, dq: Set<string>, { group = false } = {}) {
    if (!match?.p1 || !match.p2 || resolveMatchWinner(match) != null) return false
    const out1 = dq.has(match.p1)
    const out2 = dq.has(match.p2)
    if (out1 === out2) return false
    const need = String(group ? 1 : winsNeeded(match.bestOf || 1))
    match.score1 = out1 ? '0' : need
    match.score2 = out1 ? need : '0'
    match.winner = resolveMatchWinner(match)
    match.forfeit = true
    return true
}

function applyBracketForfeits(bracket: Bracket, dq: Set<string>) {
    let changed = false
    for (const round of bracket.rounds) {
        for (const match of round) changed = applyForfeit(match, dq) || changed
    }
    return applyForfeit(bracket.thirdPlace, dq) || changed
}

function refreshAfterDisqualification(tour: CategoryTournament) {
    for (const group of tour.groups) {
        pruneStaleTiebreaks(tour, group)
        ensureGroupTiebreaks(tour, group)
    }
    propagateBracket(tour)
}

/** Повертає кількість технічних перемог у групах */
export function disqualifyTeam(tour: CategoryTournament, teamId: string) {
    if (isDisqualified(tour, teamId)) return 0
    tour.disqualified = [...tour.disqualified, { id: teamId, at: new Date().toISOString() }]
    const dq = disqualifiedIds(tour)
    let forfeits = 0
    for (const group of tour.groups) {
        for (const match of group.matches) {
            if (applyForfeit(match, dq, { group: true })) forfeits += 1
        }
    }
    refreshAfterDisqualification(tour)
    return forfeits
}

export function undoDisqualification(tour: CategoryTournament, teamId: string) {
    if (!isDisqualified(tour, teamId)) return
    tour.disqualified = tour.disqualified.filter((d) => d.id !== teamId)
    const involves = (m: Match) => m?.forfeit && (m.p1 === teamId || m.p2 === teamId)
    for (const group of tour.groups) {
        for (const match of group.matches) {
            if (!involves(match)) continue
            match.score1 = ''
            match.score2 = ''
            match.winner = null
            delete match.forfeit
        }
    }
    if (tour.bracket) {
        for (const match of [...tour.bracket.rounds.flat(), tour.bracket.thirdPlace]) {
            if (!involves(match)) continue
            match.score1 = '0'
            match.score2 = '0'
            match.winner = null
            delete match.forfeit
        }
    }
    refreshAfterDisqualification(tour)
}

/* ===== Оголошення для чату ===== */

const MATCH_ANNOUNCE_MAX = 80
const FINAL_ANNOUNCE_MAX = 120

function announceTeamLabel(data: TournamentData, cat: Category, id: string | null, { spaced = false } = {}) {
    if (!id) return 'TBD'
    return teamLabel(data, cat, id).split(' — ').join(spaced ? ' / ' : '/')
}

function matchAnnounceScores(match: Match) {
    const s1 = match.score1 === '' || match.score1 == null ? '0' : String(match.score1)
    const s2 = match.score2 === '' || match.score2 == null ? '0' : String(match.score2)
    return { s1, s2 }
}

function truncateAnnouncePart(text: string, maxLen: number) {
    if (text.length <= maxLen) return text
    if (maxLen <= 1) return '…'
    return `${text.slice(0, maxLen - 1)}…`
}

function announceFormatLabel(data: TournamentData, cat: Category) {
    const n = playersPerTeam(data, cat)
    return `${n}х${n}`
}

function announceCategoryPhrase(cat: Category, { inside = false } = {}) {
    if (cat === '90-98') return 'у категорії 90 - 98'
    return inside ? 'у категорії 99+' : 'категорія 99+'
}

/** Обрізає найдовшу частину, доки текст не влізе (або різати вже нічого) */
function shrinkAnnounceParts(compose: () => string, parts: Record<string, string>, maxLen: number) {
    let text = compose()
    while (text.length > maxLen) {
        const key = Object.keys(parts)
            .sort((a, b) => parts[b].length - parts[a].length)
            .find((k) => parts[k].length > 2)
        if (!key) break
        parts[key] = truncateAnnouncePart(parts[key], parts[key].length - 1)
        text = compose()
    }
    return text
}

function fitAnnounceText(compose: () => string, parts: Record<string, string>, maxLen: number) {
    return shrinkAnnounceParts(compose, parts, maxLen).slice(0, maxLen)
}

function buildFinalAnnounce(data: TournamentData, cat: Category, match: Match) {
    const winnerId = resolveMatchWinner(match)
    const { s1, s2 } = matchAnnounceScores(match)
    if (winnerId) {
        const score = winnerId === match.p1 ? `${Number(s1)}:${Number(s2)}` : `${Number(s2)}:${Number(s1)}`
        const parts = { winners: announceTeamLabel(data, cat, winnerId, { spaced: true }) }
        const head = `Переможцями PvP-турніру ${announceFormatLabel(data, cat)} ${announceCategoryPhrase(cat, { inside: true })} з рахунком ${score} стають `
        return fitAnnounceText(() => `${head}${parts.winners}!`, parts, FINAL_ANNOUNCE_MAX)
    }
    const parts = {
        left: announceTeamLabel(data, cat, match.p1, { spaced: true }),
        right: announceTeamLabel(data, cat, match.p2, { spaced: true }),
    }
    const head = `Фінал PvP-турніру ${announceFormatLabel(data, cat)} ${announceCategoryPhrase(cat)}: `
    return fitAnnounceText(() => `${head}${parts.left} (${s1}) vs ${parts.right} (${s2})`, parts, FINAL_ANNOUNCE_MAX)
}

/** Стисле оголошення бою для чату (≤80). Фінал — окремий формат (≤120). */
export function buildMatchAnnounce(data: TournamentData, cat: Category, match: Match, stage: string) {
    if (stage === 'Фінал') return buildFinalAnnounce(data, cat, match)
    const bestOf = Number(match.bestOf) || 1
    const { s1, s2 } = matchAnnounceScores(match)
    const parts = {
        left: announceTeamLabel(data, cat, match.p1),
        right: announceTeamLabel(data, cat, match.p2),
    }
    let stageText = stage
    const compose = () =>
        bestOf > 1
            ? `${stageText} ${boLabel(bestOf)} ${parts.left} (${s1}) vs ${parts.right} (${s2})`
            : `${stageText} ${boLabel(bestOf)} ${parts.left} vs ${parts.right}`
    let text = shrinkAnnounceParts(compose, parts, MATCH_ANNOUNCE_MAX)
    while (text.length > MATCH_ANNOUNCE_MAX && stageText.length > 2) {
        stageText = truncateAnnouncePart(stageText, stageText.length - 1)
        text = compose()
    }
    return text.slice(0, MATCH_ANNOUNCE_MAX)
}

/** Стадія для оголошення: у чат пишуть «Четвертьфінал» */
export function announceRoundLabel(roundIndex: number, totalRounds: number) {
    const label = roundLabel(roundIndex, totalRounds)
    return label === 'Чвертьфінал' ? 'Четвертьфінал' : label
}

export function teamRosterText(data: TournamentData, cat: Category, id: string | null) {
    return announceTeamLabel(data, cat, id)
}
