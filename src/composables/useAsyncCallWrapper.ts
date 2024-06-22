import {useLoading} from "vue-loading-overlay";
import {useToast} from "vue-toastification";

export function useAsyncCallWrapper() {
    const loading = useLoading();
    const toast = useToast();

    async function wrapAsyncCall<T = any>(call: () => any, errorHandler?: (e: any) => boolean, successText?: string): Promise<T | undefined> {
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
                toast.error("Серверна помилка")
            }
        } finally {
            spinner.hide();
        }
    }
    return {wrapAsyncCall}
}