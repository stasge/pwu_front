import { ofetch } from "ofetch";

const baseURL = import.meta.env.VITE_API_URL;

const refreshToken = async () => {
    await ofetch('refresh', { baseURL, method: 'POST', credentials: 'include' });
};

const retryRequest = async (uri: string, options: any) => {
    try {
        return await ofetch(uri, options);
    } catch (error: any) {
        if (error?.response?.status === 401) {
            await refreshToken();
            return ofetch(uri, options);
        }
        throw error;
    }
};

export const fetchPost = (uri: string, body: any) => {
    const options = {
        baseURL, 
        method: 'POST',
        body,
        credentials: 'include',
    }
    return retryRequest(uri, options)
};

export const fetchGet = (uri: string, data: any = {}) => {
    const params: any = {};
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value != null && value !== '') {
            params[key] = value;
        }
    }

    const options = {
        baseURL, 
        method: 'GET', 
        params, 
        credentials: 'include',
    }
    return retryRequest(uri, options)
}