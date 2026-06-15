import { Plugin, FileRepository } from 'ckeditor5';
import { fetchPost } from './fetchApi';

interface UploadImageResponse {
    msg: string;
    status_code: number;
    fileName: string;
}

class ValorUploadAdapter {
    private loader: { file: Promise<File> };
    private aborted = false;

    constructor(loader: { file: Promise<File> }) {
        this.loader = loader;
    }

    upload() {
        return this.loader.file.then((file) => {
            if (this.aborted) {
                return Promise.reject('Upload aborted');
            }

            const formData = new FormData();
            formData.append('file', file);

            return fetchPost('/upload-image', formData).then((response) => {
                const data = ('data' in response && response.data
                    ? response.data
                    : response) as UploadImageResponse;

                if (data.status_code !== 200 || !data.fileName) {
                    return Promise.reject(data.msg || 'Image upload failed');
                }

                const filesBase = import.meta.env.VITE_FILES_URL as string;
                return { default: filesBase + data.fileName };
            });
        });
    }

    abort() {
        this.aborted = true;
    }
}

export class ValorImageUploadAdapter extends Plugin {
    static get pluginName() {
        return 'ValorImageUploadAdapter' as const;
    }

    static get requires() {
        return [FileRepository] as const;
    }

    init() {
        this.editor.plugins.get('FileRepository').createUploadAdapter = (loader) =>
            new ValorUploadAdapter(loader);
    }
}
