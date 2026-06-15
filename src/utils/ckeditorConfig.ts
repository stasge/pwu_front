import {
    Bold,
    Essentials,
    Italic,
    Mention,
    Paragraph,
    Undo,
    Heading,
    List,
    Alignment,
    MediaEmbed,
    Image,
    ImageUpload,
    Link,
    ImageResize,
    ImageStyle,
    ImageToolbar,
} from 'ckeditor5';
import { ValorImageUploadAdapter } from './ckeditorImageUploadAdapter';

export const ckeditorPlugins = [
    Bold,
    Essentials,
    Italic,
    Mention,
    Paragraph,
    Undo,
    Heading,
    List,
    Alignment,
    MediaEmbed,
    Image,
    ImageUpload,
    ValorImageUploadAdapter,
    Link,
    ImageResize,
    ImageStyle,
    ImageToolbar,
];

const defaultToolbar = [
    'heading',
    'bold',
    'italic',
    'alignment',
    '|',
    'numberedList',
    'bulletedList',
    '|',
    'link',
    'undo',
    'redo',
    'mediaEmbed',
    'imageUpload',
    '|',
    'imageStyle:alignLeft',
    'imageStyle:alignCenter',
    'imageStyle:alignRight',
    'imageStyle:inline',
    '|',
    'imageResize',
];

const imageConfig = {
    resizeUnit: '%' as const,
    toolbar: [
        'imageStyle:alignLeft',
        'imageStyle:alignCenter',
        'imageStyle:alignRight',
        'imageStyle:inline',
        '|',
        'imageTextAlternative',
        '|',
        'imageResize',
    ],
};

export const createEditorConfig = (toolbar: string[] = defaultToolbar) => ({
    plugins: ckeditorPlugins,
    toolbar,
    mediaEmbed: {
        previewsInData: true,
    },
    image: imageConfig,
});

export const editorConfig = createEditorConfig();
