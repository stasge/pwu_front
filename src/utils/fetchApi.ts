import { ofetch } from "ofetch";

const baseURL = import.meta.env.VITE_API_URL;


export const fetchPost = (uri: string, body: any) => {
    return ofetch(uri, {baseURL, method: 'POST', body})
}