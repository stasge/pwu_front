import { ofetch } from "ofetch";

const baseURL = import.meta.env.VITE_API_URL;


export const fetchPost = (uri: string, body: any) => {
    return ofetch(uri, {
        baseURL, 
        method: 'POST',
        body,
        credentials: 'include',
    });
};

export const fetchGet = (uri: string, data: any = {}) => {
    const params: any = {};
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value != null && value !== '') {
            params[key] = value;
        }
    }
    return ofetch(uri, {baseURL, method: 'GET', params, credentials: 'include',})
}