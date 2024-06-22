import { useUserStore } from "@/stores/userStore";
import type { Http2ServerRequest } from "http2";
import { ofetch } from "ofetch";

const baseURL = import.meta.env.VITE_API_URL;


export const fetchPost = (uri: string, body: any) => {
    return handleRequest('POST', uri, body)
}

export const fetchGet = (uri: string, data: any = {}) => {
    const params: any = {};
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value != null && value !== '') {
            params[key] = value;
        }
    }
    return handleRequest('GET', uri, data)
}

const addToken = ({request, options}: {request: Http2ServerRequest, options: any}) => {
    const token = localStorage.getItem("pwu_token");
    if (token) {
        options.headers = {...(options.headers ?? {}), "Auth": `${token}`};
    }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

const handleRequest = async (method: Method, uri: string, options = {}, attemptRefresh = true): Promise<any> => {
    // if GET pass params, if POST/PUT/PATCH pass body 
    // TODO refactor
    const optionsName = ['POST', 'PUT', 'PATCH'].includes(method) ? 'body' : 'params'

    return ofetch(uri, {baseURL, method, [optionsName]: options, onRequest: addToken}).catch(error => {
        if (error.status === 401 && attemptRefresh) {
            useUserStore().refresh()
            return handleRequest(method, uri, options, false)
        } 
    })
}