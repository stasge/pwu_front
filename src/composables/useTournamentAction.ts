import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useConfirm } from 'primevue/useconfirm'
import { TournamentError } from '@/tournament/logic'

type ExportModule = typeof import('@/tournament/exportImage')

/** Спільний для всіх кнопок прапорець: одночасно рендериться лише одна картинка */
const imageBusy = ref(false)

/** Дії адмінки турніру: показ помилок логіки, підтвердження, копіювання тексту й картинок */
export function useTournamentAction() {
    const toast = useToast()
    const confirm = useConfirm()

    /** Виконує мутацію; TournamentError показується адміну, а не падає */
    const run = <T>(action: () => T, successText?: string | ((result: T) => string)): T | undefined => {
        try {
            const result = action()
            const text = typeof successText === 'function' ? successText(result) : successText
            if (text) toast.success(text)
            return result
        } catch (e) {
            if (e instanceof TournamentError) {
                toast.error(e.message)
                return undefined
            }
            throw e
        }
    }

    const ask = (event: Event, message: string, accept: () => void) => {
        confirm.require({
            target: event.currentTarget as HTMLElement,
            message,
            icon: 'pi pi-exclamation-triangle',
            rejectProps: { label: 'Ні', severity: 'secondary', outlined: true },
            acceptProps: { label: 'Так' },
            accept,
        })
    }

    const copyText = async (text: string, successText = 'Скопійовано') => {
        if (!text) {
            toast.error('Немає тексту для копіювання')
            return
        }
        try {
            await navigator.clipboard.writeText(text)
            toast.success(successText)
        } catch {
            toast.error('Не вдалося скопіювати')
        }
    }

    /** Рендер аркуша в PNG і копіювання в буфер (модуль із html2canvas вантажиться лише тут) */
    const copyImage = async (build: (exporter: ExportModule) => string | string[]) => {
        if (imageBusy.value) return
        imageBusy.value = true
        const pending = toast.info('Готую картинку…', { timeout: false })
        try {
            const exporter = await import('@/tournament/exportImage')
            const html = build(exporter)
            if (!html || (Array.isArray(html) && !html.length)) {
                toast.error('Немає що копіювати')
                return
            }
            const result = await exporter.copyHtmlAsImage(html)
            if (result === 'copied') toast.success('Картинку скопійовано в буфер')
            else if (result === 'downloaded') toast.success('Збережено як PNG')
        } catch (e) {
            console.error(e)
            toast.error('Не вдалося скопіювати картинку (дозвіл буфера?)')
        } finally {
            toast.dismiss(pending)
            imageBusy.value = false
        }
    }

    return { run, ask, copyText, copyImage, imageBusy }
}
