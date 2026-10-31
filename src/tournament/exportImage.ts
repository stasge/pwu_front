/**
 * «Копіювати картинкою» (перенесено з pvp-teams): будує HTML-аркуш, рендерить його
 * через html2canvas у кадр 1920×1080 із золотою рамкою й кутами та кладе PNG у буфер.
 */
import html2canvas from 'html2canvas'
import cornerTL from '@/assets/images/tournament/Corner-TL.svg'
import cornerTR from '@/assets/images/tournament/Corner-TR.svg'
import cornerBL from '@/assets/images/tournament/Corner-BL.svg'
import cornerBR from '@/assets/images/tournament/Corner-BR.svg'
import './export.scss'
import {
    CATEGORIES,
    describeRandomPlacement,
    formatLabel,
    FORMATS,
    groupStandings,
    isTeamReg,
    mainGroupFullyPlayed,
    playersPerTeam,
    randomizerTeamSize,
    resolveTiebreakOrder,
    roundLabel,
    slotCount,
    TEAM_SLOTS,
    teamLabel,
    tiebreakTitle,
} from './logic'
import type { Category, Match, Player, TournamentData } from './types'

/* ===== HTML-утиліти ===== */

function escapeHtml(text: unknown) {
    return String(text ?? '')
        .split('&').join('&amp;')
        .split('<').join('&lt;')
        .split('>').join('&gt;')
        .split('"').join('&quot;')
}

function sepSpan(text: string) {
    return `<span class="sep">${escapeHtml(text)}</span>`
}

/** Підсвічує vs у вже escape-нутому тексті */
function withHighlightedSeps(escapedText: string) {
    return escapedText.split(' vs ').join(` ${sepSpan('vs')} `)
}

function teamLabelHtml(data: TournamentData, cat: Category, id: string | null) {
    if (!id) return ''
    return withHighlightedSeps(escapeHtml(teamLabel(data, cat, id)))
}

function formatTeamVsHtml(data: TournamentData, cat: Category, id1: string | null, id2: string | null) {
    return `${teamLabelHtml(data, cat, id1)} ${sepSpan('vs')} ${teamLabelHtml(data, cat, id2)}`
}

/** Для груп: ніки / vs / ніки у 3 рядки */
function formatTeamVsStackedHtml(data: TournamentData, cat: Category, id1: string | null, id2: string | null) {
    return `
    <div class="export-vs-stack">
      <div class="export-vs-stack__team">${teamLabelHtml(data, cat, id1) || '—'}</div>
      <div class="export-vs-stack__sep">${sepSpan('vs')}</div>
      <div class="export-vs-stack__team">${teamLabelHtml(data, cat, id2) || '—'}</div>
    </div>`
}

function formatScoreHtml(s1: unknown, s2: unknown) {
    if ((s1 === '' || s1 == null) && (s2 === '' || s2 == null)) return ''
    return `${escapeHtml(s1 ?? '')}${sepSpan(':')}${escapeHtml(s2 ?? '')}`
}

/* ===== Реєстрація ===== */

function regTableColgroup(team = false) {
    return `
    <colgroup>
      <col class="col-num">
      <col class="col-nick">
      <col class="col-class${team ? ' col-class--team' : ''}">
      <col class="col-level${team ? ' col-level--team' : ''}">
    </colgroup>`
}

function regTableHead(team: boolean) {
    return `<th class="col-num">№</th><th class="col-nick">${team ? 'ніки' : 'нік'}</th><th class="col-class">клас</th><th class="col-level">рівень</th>`
}

function stackHtml(members: Player[], key: 'nick' | 'class' | 'level') {
    return `<div class="team-stack">${members.map((m) => `<div class="team-stack__item">${escapeHtml(m[key])}</div>`).join('')}</div>`
}

function stackPlaceholder(size: number) {
    return `<div class="team-stack">${Array.from({ length: Math.max(1, size) }, () => '<div class="team-stack__item">&nbsp;</div>').join('')}</div>`
}

function teamRowsHtml(data: TournamentData, cat: Category) {
    const size = playersPerTeam(data, cat)
    const rows: string[] = []
    for (let i = 0; i < TEAM_SLOTS; i++) {
        const members = data.teams[cat][i]?.members.slice(0, size) ?? []
        const empty = !members.length
        const ph = stackPlaceholder(size)
        rows.push(`
      <tr class="${empty ? 'data-table__slot-empty' : ''}">
        <td class="col-num">${i + 1}</td>
        <td class="col-nick">${empty ? ph : stackHtml(members, 'nick')}</td>
        <td class="col-class">${empty ? ph : stackHtml(members, 'class')}</td>
        <td class="col-level">${empty ? ph : stackHtml(members, 'level')}</td>
      </tr>`)
    }
    return rows.join('')
}

function soloRowsHtml(data: TournamentData, cat: Category, from: number, to: number) {
    const list = data.players[cat]
    const rows: string[] = []
    for (let i = from; i < Math.min(slotCount(data, cat), to); i++) {
        const p = list[i]
        rows.push(
            p
                ? `<tr><td class="col-num">${i + 1}</td><td class="col-nick">${escapeHtml(p.nick)}</td><td class="col-class">${escapeHtml(p.class)}</td><td class="col-level">${escapeHtml(p.level)}</td></tr>`
                : `<tr class="data-table__slot-empty"><td class="col-num">${i + 1}</td><td class="col-nick"></td><td class="col-class"></td><td class="col-level"></td></tr>`
        )
    }
    return rows.join('')
}

function regExportHeadHtml(data: TournamentData, cat: Category, meta: string) {
    return `
    <div class="export-group__head">
      <span class="export-group__cat">${escapeHtml(cat)}</span>
      <span class="export-group__format">${escapeHtml(formatLabel(data, cat))}</span>
      <span class="export-group__meta">${meta}</span>
    </div>`
}

function regCategoryHtml(data: TournamentData, cat: Category, rowsPerTable = 0) {
    if (isTeamReg(data, cat)) {
        return `
      <div class="export-group">
        ${regExportHeadHtml(data, cat, `команд ${data.teams[cat].length}/${TEAM_SLOTS}`)}
        <table class="export-table export-table--teams">
          ${regTableColgroup(true)}
          <thead><tr>${regTableHead(true)}</tr></thead>
          <tbody>${teamRowsHtml(data, cat)}</tbody>
        </table>
      </div>`
    }

    const slots = slotCount(data, cat)
    // довгі списки ділимо на кілька таблиць поруч, щоб лишались читабельними
    const tableCount = rowsPerTable > 0 ? Math.ceil(slots / rowsPerTable) : 1
    const perTable = Math.ceil(slots / tableCount)
    const tables: string[] = []
    for (let from = 0; from < slots; from += perTable) {
        tables.push(`
      <table class="export-table export-table--solo">
        ${regTableColgroup()}
        <thead><tr>${regTableHead(false)}</tr></thead>
        <tbody>${soloRowsHtml(data, cat, from, from + perTable)}</tbody>
      </table>`)
    }
    return `
    <div class="export-group">
      ${regExportHeadHtml(data, cat, `персонажів ${data.players[cat].length}/${slots}`)}
      <div class="export-group__tables">${tables.join('')}</div>
    </div>`
}

function regExportHtml(data: TournamentData, rowsPerTable = 0) {
    const anyTeam = CATEGORIES.some((c) => isTeamReg(data, c))
    const anySolo = CATEGORIES.some((c) => !isTeamReg(data, c))
    const title = anyTeam && anySolo ? 'Зареєстровані' : anyTeam ? 'Зареєстровані команди' : 'Зареєстровані гравці'
    return `
    <div class="export-sheet export-sheet--reg" data-stretch="full">
      <h2 class="export-sheet__title">${title}</h2>
      <div class="export-sheet__grid">
        ${CATEGORIES.map((cat) => regCategoryHtml(data, cat, rowsPerTable)).join('')}
      </div>
    </div>`
}

/** Варіанти картинки реєстрації: цілі списки або довгі списки, розбиті на колонки */
export function registrationExport(data: TournamentData) {
    return [0, 24, 16, 12].map((rows) => regExportHtml(data, rows))
}

/* ===== Сформовані команди ===== */

export function formedTeamsExport(data: TournamentData) {
    const teams = data.randomizer.formedTeams
    if (!teams.length) return ''
    const format = FORMATS.find((f) => f.id === randomizerTeamSize(data))?.label || ''
    return `
    <div class="export-sheet export-sheet--formed" data-layouts="export-sheet--cols-5 export-sheet--cols-6 export-sheet--cols-3">
      <h2 class="export-sheet__title">Сформовані команди${format ? ` · ${escapeHtml(format)}` : ''}</h2>
      <div class="export-formed-grid">
        ${teams
            .map(
                (team, index) => `
          <div class="export-formed-card">
            <div class="export-formed-card__head">Команда ${index + 1}</div>
            <ul class="export-formed-card__list">${team.map((nick) => `<li>${escapeHtml(nick)}</li>`).join('')}</ul>
          </div>`
            )
            .join('')}
      </div>
    </div>`
}

/* ===== Групи ===== */

const GROUPS_EXPORT_LAYOUTS = [
    'export-sheet--wide',
    'export-sheet--wide+export-sheet--wide3',
    'export-sheet--grid2',
    'export-sheet--wide+export-sheet--grid2',
    'export-sheet--wide+export-sheet--wide3+export-sheet--grid2',
].join(' ')

function pairsTableHtml(rows: string) {
    return `
    <table class="export-table export-table--pairs">
      <colgroup><col class="col-nick"><col class="col-score"></colgroup>
      <thead><tr><th class="col-nick">результати боїв</th><th class="col-score">рахунок</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`
}

function groupsExportHtml(data: TournamentData, cat: Category, stacked: boolean) {
    const tour = data.tournaments[cat]
    const formatPair = (m: Match) =>
        stacked ? formatTeamVsStackedHtml(data, cat, m.p1, m.p2) : formatTeamVsHtml(data, cat, m.p1, m.p2)
    const pairRows = (matches: Match[]) =>
        matches.map((m) => `<tr><td class="col-nick">${formatPair(m)}</td><td class="col-score">${formatScoreHtml(m.score1, m.score2)}</td></tr>`).join('')

    return `
    <div class="export-sheet export-sheet--groups${stacked ? '' : ' export-sheet--groups-single'}" data-layouts="${GROUPS_EXPORT_LAYOUTS}">
      <h2 class="export-sheet__title">Групи ${escapeHtml(cat)}</h2>
      <div class="export-sheet__grid">
        ${tour.groups
            .map((g) => {
                const table = groupStandings(tour, g, { includeTiebreaks: true })
                const tiebreaks = mainGroupFullyPlayed(g) ? g.tiebreaks : []
                const tiebreakHtml = tiebreaks
                    .map((tb) => {
                        const random = tb.randomOrder?.length
                            ? `<div class="export-group__name export-group__note">Рандом:<br>${describeRandomPlacement(data, cat, g, tb).map(escapeHtml).join('<br>')}</div>`
                            : resolveTiebreakOrder(tb).needsRandom
                              ? '<div class="export-group__name export-group__note">Потрібен рандом місць</div>'
                              : ''
                        return `
                  <div class="export-group__tiebreak">
                    <div class="export-group__name">${escapeHtml(tiebreakTitle(tour, g, tb))}</div>
                    ${pairsTableHtml(pairRows(tb.matches))}
                    ${random}
                  </div>`
                    })
                    .join('')

                return `
          <div class="export-group">
            <div class="export-group__name">Група ${escapeHtml(g.name)}</div>
            <div class="export-group__body">
              <div class="export-group__standings">
                <table class="export-table">
                  <colgroup><col class="col-num"><col class="col-nick"><col class="col-stat"></colgroup>
                  <thead><tr><th class="col-num">#</th><th class="col-nick">команда</th><th class="col-stat">бали</th></tr></thead>
                  <tbody>
                    ${table
                        .map((row, i) => `<tr><td class="col-num">${row.dq ? '—' : i + 1}</td><td class="col-nick">${teamLabelHtml(data, cat, row.id)}</td><td class="col-stat">${row.wins}</td></tr>`)
                        .join('')}
                  </tbody>
                </table>
              </div>
              <div class="export-group__matches">${pairsTableHtml(pairRows(g.matches.filter((m) => !m.tiebreak)))}</div>
              ${tiebreakHtml ? `<div class="export-group__tiebreaks">${tiebreakHtml}</div>` : ''}
            </div>
          </div>`
            })
            .join('')}
      </div>
    </div>`
}

export function groupsExport(data: TournamentData, cat: Category) {
    if (!data.tournaments[cat].groups.length) return []
    return [groupsExportHtml(data, cat, true), groupsExportHtml(data, cat, false)]
}

/* ===== Сітка ===== */

function exportMatchWinner(s1: unknown, s2: unknown) {
    const a = Number(s1)
    const b = Number(s2)
    if (s1 === '' || s2 === '' || s1 == null || s2 == null) return 0
    if (!Number.isFinite(a) || !Number.isFinite(b) || a === b) return 0
    return a > b ? 1 : 2
}

function exportMatchBox(p1Name: string, s1: unknown, p2Name: string, s2: unknown) {
    const winner = exportMatchWinner(s1, s2)
    const rowClass = (n: number) => `export-match__row${winner === n ? ' export-match__row--win' : ''}`
    return `
    <div class="export-match">
      <div class="${rowClass(1)}">
        <div class="export-match__name">${withHighlightedSeps(escapeHtml(p1Name || '—'))}</div>
        <div class="export-match__score">${escapeHtml(s1 ?? '')}</div>
      </div>
      <div class="${rowClass(2)}">
        <div class="export-match__name">${withHighlightedSeps(escapeHtml(p2Name || '—'))}</div>
        <div class="export-match__score">${escapeHtml(s2 ?? '')}</div>
      </div>
    </div>`
}

export function bracketExport(data: TournamentData, cat: Category) {
    const bracket = data.tournaments[cat].bracket
    if (!bracket) return ''
    const { rounds, thirdPlace } = bracket
    const total = rounds.length
    const early = rounds.slice(0, -1)
    const fin = rounds[total - 1][0]
    const label = (id: string | null) => teamLabel(data, cat, id)
    const box = (m: Match) => exportMatchBox(label(m.p1), m.score1, label(m.p2), m.score2)

    // лише фінал + 3 місце: окремий більший макет замість порожньої сітки
    if (!early.length) {
        const block = (title: string, mod: string, m: Match) => `
      <div class="export-podium__block export-podium__block--${mod}">
        <div class="export-podium__label">${title}</div>
        ${box(m)}
      </div>`
        return `
      <div class="export-sheet export-sheet--bracket export-sheet--finals-only" data-layouts="export-sheet--podium-row" data-max-scale="3.7">
        <h2 class="export-sheet__title">Сітка ${escapeHtml(cat)}</h2>
        <div class="export-podium">
          ${block('Фінал', 'final', fin)}
          ${block('Бій за 3 місце', 'third', thirdPlace)}
        </div>
      </div>`
    }

    const earlyHtml = early
        .map((round, ri) => {
            const pairs: Match[][] = []
            for (let i = 0; i < round.length; i += 2) pairs.push(round.slice(i, i + 2))
            return `
        <div class="export-bracket__col">
          <div class="export-bracket__col-body">
            ${pairs
                .map((pair, pairIndex) => {
                    const hasFeed = pair.length === 2
                    return `
              <div class="export-bracket__pair ${hasFeed ? '' : 'export-bracket__pair--solo'}">
                ${pair
                    .map(
                        (m, pi) => `
                  <div class="export-bracket__slot ${pairIndex === 0 && pi === 0 ? 'export-bracket__slot--titled' : ''}">
                    ${pairIndex === 0 && pi === 0 ? `<div class="export-bracket__label">${escapeHtml(roundLabel(ri, total))}</div>` : ''}
                    ${exportMatchBox(m.p1 ? label(m.p1) : !m.p2 ? 'TBD' : '—', m.score1, m.p2 ? label(m.p2) : 'bye', m.score2)}
                  </div>`
                    )
                    .join('')}
                ${hasFeed ? '<span class="export-bracket__stem"></span><span class="export-bracket__arrow"></span>' : ''}
              </div>`
                })
                .join('')}
          </div>
        </div>`
        })
        .join('')

    return `
    <div class="export-sheet export-sheet--bracket">
      <h2 class="export-sheet__title">Сітка ${escapeHtml(cat)}</h2>
      <div class="export-bracket">
        ${earlyHtml}
        <div class="export-bracket__col export-bracket__col--finals">
          <div class="export-bracket__col-body export-bracket__col-body--finals">
            <div class="export-bracket__finals-sizer" aria-hidden="true">${box(fin)}${box(thirdPlace)}</div>
            <div class="export-bracket__final-block">
              <div class="export-bracket__label export-bracket__label--accent">Фінал</div>
              ${box(fin)}
            </div>
            <div class="export-bracket__third-block">
              <div class="export-bracket__label export-bracket__label--accent">Бій за 3 місце</div>
              ${box(thirdPlace)}
            </div>
          </div>
        </div>
      </div>
    </div>`
}

/* ===== Рендер у картинку ===== */

// Усі картинки одного розміру; вміст масштабується, щоб влізти в рамку
const EXPORT_IMAGE = {
    width: 1920,
    height: 1080,
    padX: 80,
    padTop: 150,
    padBottom: 70,
    maxScale: 2.6,
    frameInset: 24,
    cornerOffset: 20,
    cornerSize: 56,
    bg: '#0a0a0a',
    gold: '#fbd298',
}

// Коли масштаб обмежує висота — розширюємо аркуш груп/таблиць у вільну ширину кадру
const EXPORT_MAX_STRETCH = 1.4

let cornersPromise: Promise<(HTMLImageElement | null)[]> | null = null

function loadCorners() {
    cornersPromise ??= Promise.all(
        [cornerTL, cornerTR, cornerBL, cornerBR].map(
            (src) =>
                new Promise<HTMLImageElement | null>((resolve) => {
                    const img = new Image()
                    img.onload = () => resolve(img)
                    img.onerror = () => resolve(null)
                    img.src = src
                })
        )
    )
    return cornersPromise
}

function exportRoot() {
    let root = document.getElementById('pvp-export-root')
    if (!root) {
        root = document.createElement('div')
        root.id = 'pvp-export-root'
        root.className = 'pvp-export-root'
        root.setAttribute('aria-hidden', 'true')
        document.body.appendChild(root)
    }
    return root
}

function equalizeWidths(root: HTMLElement) {
    const matches = [...root.querySelectorAll<HTMLElement>('.export-match')]
    if (matches.length > 1) {
        const max = Math.max(...matches.map((el) => el.getBoundingClientRect().width))
        if (max > 0) {
            for (const el of matches) {
                el.style.width = `${Math.ceil(max)}px`
                el.style.tableLayout = 'fixed'
            }
        }
    }
    equalizeGroupWidths(root)
}

function equalizeGroupWidths(root: HTMLElement) {
    const groups = [...root.querySelectorAll<HTMLElement>('.export-sheet--groups .export-group, .export-sheet--reg .export-group')]
    if (!groups.length) return
    const max = Math.max(...groups.map((el) => el.getBoundingClientRect().width))
    if (max <= 0) return
    for (const el of groups) el.style.width = `${Math.ceil(max)}px`
    for (const table of root.querySelectorAll<HTMLElement>('.export-sheet--groups .export-table, .export-sheet--reg .export-table')) {
        table.style.width = '100%'
    }
}

function mountSheet(html: string, layoutClass: string) {
    const root = exportRoot()
    root.innerHTML = html
    const node = root.firstElementChild as HTMLElement | null
    if (!node) return null
    node.querySelector('.export-sheet__title')?.remove()
    node.classList.add('export-sheet--framed')
    if (layoutClass) node.classList.add(...layoutClass.split('+'))
    equalizeWidths(node)
    return node
}

// Аркуш може підняти межу збільшення через data-max-scale (розріджені макети)
function fitScale(node: HTMLElement) {
    const { width: W, height: H, padX, padTop, padBottom, maxScale } = EXPORT_IMAGE
    const rect = node.getBoundingClientRect()
    const cap = Number(node.dataset.maxScale) || maxScale
    return Math.min((W - padX * 2) / rect.width, (H - padTop - padBottom) / rect.height, cap)
}

// Перебирає всі варіанти HTML × макети (data-layouts, "a+b" = кілька класів) і монтує найкращий
function mountBestLayout(htmls: string[]) {
    let best: { html: string; layout: string; scale: number } | null = null
    for (const html of htmls) {
        const node = mountSheet(html, '')
        if (!node) continue
        const layouts = ['', ...(node.dataset.layouts || '').split(/\s+/).filter(Boolean)]
        for (const layout of layouts) {
            const candidate = layout ? mountSheet(html, layout) : node
            if (!candidate) continue
            const scale = fitScale(candidate)
            if (!best || scale > best.scale + 0.01) best = { html, layout, scale }
        }
    }
    return best ? mountSheet(best.html, best.layout) : null
}

function stretchSheet(node: HTMLElement) {
    const groups = node.querySelectorAll<HTMLElement>('.export-sheet__grid > .export-group')
    if (!groups.length) return
    const { width: W, padX } = EXPORT_IMAGE
    const rect = node.getBoundingClientRect()
    const scale = fitScale(node)
    // data-stretch="full": завжди на всю ширину кадру, щоб таблиці мали однакову ширину
    const maxStretch = node.dataset.stretch === 'full' ? Infinity : EXPORT_MAX_STRETCH
    const targetW = Math.min((W - padX * 2) / scale, rect.width * maxStretch)
    if (targetW < rect.width + 8) return

    node.classList.add('export-sheet--stretch')
    for (const el of groups) el.style.width = ''
    node.style.width = `${Math.floor(targetW)}px`

    // перенесені клітинки можуть вирости — відкочуємось, якщо це коштує масштабу
    if (fitScale(node) < scale - 0.01) {
        node.classList.remove('export-sheet--stretch')
        node.style.width = ''
        equalizeGroupWidths(node)
    }
}

function drawFrame(ctx: CanvasRenderingContext2D, title: string) {
    const { width: W, height: H, bg, gold, frameInset: inset, cornerOffset: off, cornerSize: size, padX } = EXPORT_IMAGE
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // таке ж м'яке світіння зверху, як на сайті
    const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, W * 0.55)
    glow.addColorStop(0, 'rgba(251, 210, 152, 0.10)')
    glow.addColorStop(1, 'rgba(251, 210, 152, 0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, H)

    // лінії рамки лише між кутовими орнаментами
    const gap = off + size - 6
    ctx.strokeStyle = 'rgba(248, 248, 248, 0.2)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(gap, inset)
    ctx.lineTo(W - gap, inset)
    ctx.moveTo(gap, H - inset)
    ctx.lineTo(W - gap, H - inset)
    ctx.moveTo(inset, gap)
    ctx.lineTo(inset, H - gap)
    ctx.moveTo(W - inset, gap)
    ctx.lineTo(W - inset, H - gap)
    ctx.stroke()

    ctx.fillStyle = gold
    ctx.font = "56px 'VollkornSC', serif"
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'center'
    ctx.fillText(title, W / 2, 100)

    const lineGrad = ctx.createLinearGradient(padX, 0, W - padX, 0)
    lineGrad.addColorStop(0, 'rgba(251, 210, 152, 0)')
    lineGrad.addColorStop(0.5, 'rgba(251, 210, 152, 0.55)')
    lineGrad.addColorStop(1, 'rgba(251, 210, 152, 0)')
    ctx.fillStyle = lineGrad
    ctx.fillRect(padX, 124, W - padX * 2, 2)
}

async function drawCorners(ctx: CanvasRenderingContext2D) {
    const { width: W, height: H, cornerOffset: off, cornerSize: size } = EXPORT_IMAGE
    const [tl, tr, bl, br] = await loadCorners()
    if (tl) ctx.drawImage(tl, off, off, size, size)
    if (tr) ctx.drawImage(tr, W - off - size, off, size, size)
    if (bl) ctx.drawImage(bl, off, H - off - size, size, size)
    if (br) ctx.drawImage(br, W - off - size, H - off - size, size, size)
}

export async function renderImage(htmls: string[]) {
    const { width: W, height: H, padTop, padBottom } = EXPORT_IMAGE
    const root = exportRoot()
    root.innerHTML = htmls[0]
    const title = root.querySelector('.export-sheet__title')?.textContent?.trim() ?? ''

    if (document.fonts?.ready) await document.fonts.ready

    const node = mountBestLayout(htmls)
    if (!node) return null
    stretchSheet(node)

    const rect = node.getBoundingClientRect()
    const scale = fitScale(node)
    const content = await html2canvas(node, { backgroundColor: null, scale, useCORS: true, logging: false })

    const out = document.createElement('canvas')
    out.width = W
    out.height = H
    const ctx = out.getContext('2d')!
    drawFrame(ctx, title)

    const drawW = rect.width * scale
    const drawH = rect.height * scale
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(content, Math.round((W - drawW) / 2), Math.round(padTop + (H - padTop - padBottom - drawH) / 2), drawW, drawH)

    await drawCorners(ctx)
    return out
}

/**
 * Рендерить аркуш(і) у PNG і кладе в буфер обміну; якщо буфер не підтримує картинки —
 * завантажує файл. Повертає, що саме сталося.
 */
export async function copyHtmlAsImage(htmlOrVariants: string | string[]): Promise<'copied' | 'downloaded' | null> {
    const htmls = (Array.isArray(htmlOrVariants) ? htmlOrVariants : [htmlOrVariants]).filter(Boolean)
    if (!htmls.length) return null
    try {
        const canvas = await renderImage(htmls)
        if (!canvas) return null
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
        if (!blob) throw new Error('PNG не створено')

        if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
            return 'copied'
        }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `pvp-${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)
        return 'downloaded'
    } finally {
        exportRoot().innerHTML = ''
    }
}
