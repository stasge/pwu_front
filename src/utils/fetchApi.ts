import { useUserStore } from "@/stores/userStore";
import type { Http2ServerRequest } from "http2";
import { ofetch } from "ofetch";

const baseURL = import.meta.env.VITE_API_URL;


export const fetchPost = (uri: string, body: any) => {
    return ofetch(uri, {baseURL, method: 'POST', body, onRequest: addToken})
}

export const fetchGet = (uri: string, data: any = {}) => {
    const params: any = {};
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value != null && value !== '') {
            params[key] = value;
        }
    }
    return ofetch(uri, {baseURL, method: 'GET', params, onRequest: addToken})
}

const addToken = async ({request, options}: {request: Http2ServerRequest, options: any}) => {
    const userStore = useUserStore()
    let accessToken = localStorage.getItem("pwu_token")
    const refreshToken = localStorage.getItem("pwu_refresh_token")
    if (!accessToken && refreshToken) {
        const {data: token} = await ofetch('refresh', {baseURL, method: 'GET', headers: {'Auth': refreshToken}}).catch(error => userStore.logoutUser())
        accessToken = token
        localStorage.setItem('pwu_token', token)
    }
    if (accessToken) {
        options.headers = {...(options.headers ?? {}), "Auth": `${accessToken}`};
    }
}