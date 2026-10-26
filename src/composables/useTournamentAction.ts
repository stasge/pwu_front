import { useToast } from 'vue-toastification'
import { useConfirm } from 'primevue/useconfirm'
import { TournamentError } from '@/tournament/logic'

/** Дії адмінки турніру: показ помилок логіки, підтвердження, копіювання тексту */
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

    return { run, ask, copyText }
}
