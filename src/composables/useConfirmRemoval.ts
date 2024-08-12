import { useConfirm } from "primevue/useconfirm";

export function useConfirmRemoval() {
    const confirm = useConfirm();

    const confirmRemoval = (event: Event, id: number, message: string, action: (id: number) => void) => {
        confirm.require({
            target: event.currentTarget as HTMLElement,
            message,
            icon: 'pi pi-exclamation-triangle',
            rejectProps: {
                label: 'Ні',
                severity: 'secondary',
                outlined: true
            },
            acceptProps: {
                label: 'Так'
            },
            accept: () => {
                action(id)
            },
        });
    }
    return {confirmRemoval}
}