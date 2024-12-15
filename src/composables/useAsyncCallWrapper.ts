import {useLoading} from "vue-loading-overlay";
import {useToast} from "vue-toastification";
import { useI18n } from 'vue-i18n'

export function useAsyncCallWrapper() {
    const {t} = useI18n()
    const loading = useLoading();
    const toast = useToast();

    async function wrapAsyncCall<T = any>(call: () => any, errorHandler?: ((e: any) => boolean) | null, successText?: string): Promise<T | undefined> {
        const spinner = loading?.show();
        try {
            return await call().then((r: any) => {
                if (successText) {
                    toast.success(successText);
                }
                return r;
            });

        } catch (e: any) {
            if (!errorHandler || !errorHandler(e)) {
                toast.error(t(e.msg))
            }
        } finally {
            spinner.hide();
        }
    }
    return {wrapAsyncCall}
}