import { useUserStore } from "@/stores/userStore";
import type { Http2ServerRequest } from "http2";
import { ofetch } from "ofetch";

const baseURL = import.meta.env.VITE_API_URL;


export const fetchPost = (uri: string, body: any) => {
    return ofetch(uri, {baseURL, method: 'POST', body, onRequest: addToken}).catch(async (error) => {
        const refresh = localStorage.getItem('pwu_refresh_token')
        if (error.status === 401 && refresh) {
            await refreshToken(refresh).then(
                () => {
                    fetchPost(uri, body)
                },
            )
        }
    })
}

export const fetchGet = (uri: string, data: any = {}) => {
    const params: any = {};
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value != null && value !== '') {
            params[key] = value;
        }
    }
    return ofetch(uri, {baseURL, method: 'GET', params, onRequest: addToken}).catch(async (error) => {
        const refresh = localStorage.getItem('pwu_refresh_token')
        if (error.status === 401 && refresh) {
            await refreshToken(refresh).then(
                () => {
                    fetchGet(uri, data)
                },
            )
        }
    })
}

const addToken = ({request, options}: {request: Http2ServerRequest, options: any}) => {
    const token = localStorage.getItem("pwu_token");
    if (token) {
        options.headers = {...(options.headers ?? {}), "Auth": `${token}`};
    }
}

const refreshToken = async (refresh: string) => {
    const userStore = useUserStore()
    const {data: accessToken} = await ofetch('refresh', {baseURL, method: 'GET', headers: {'Auth': refresh}}).catch(error => userStore.logoutUser())
    if (accessToken) {
        localStorage.setItem('pwu_token', accessToken)
    }
}