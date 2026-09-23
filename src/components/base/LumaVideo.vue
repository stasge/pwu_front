<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

/*
 * Відео з чорним фоном, де чорне стає прозорим.
 * Десктоп: звичайний <video>, прозорість робить svg-фільтр із css батька.
 * Мобільні: Safari не застосовує svg-фільтри до <video>, тому малюємо кадри
 * у <canvas> через WebGL і рахуємо альфу з яскравості в шейдері.
 */
const props = withDefaults(defineProps<{
    src: string
    type?: string
    /** множник яскравості -> альфа, як у feColorMatrix (1.2 1.2 1.2 0 0) */
    gain?: number
}>(), {
    type: 'video/mp4',
    gain: 1.2,
})

const isTouchDevice = typeof window !== 'undefined'
    && window.matchMedia('(hover: none) and (pointer: coarse)').matches

const useCanvas = ref(isTouchDevice)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let video: HTMLVideoElement | null = null
let gl: WebGLRenderingContext | null = null
let frameHandle: number | null = null
let stopped = false

const VERTEX_SHADER = `
attribute vec2 p;
varying vec2 v;
void main() {
    v = (p + 1.0) * 0.5;
    gl_Position = vec4(p, 0.0, 1.0);
}`

const FRAGMENT_SHADER = `
precision mediump float;
uniform sampler2D t;
uniform float g;
varying vec2 v;
void main() {
    vec3 c = texture2D(t, v).rgb;
    float a = clamp((c.r + c.g + c.b) * g, 0.0, 1.0);
    gl_FragColor = vec4(c * a, a);
}`

function compile(context: WebGLRenderingContext, kind: number, source: string) {
    const shader = context.createShader(kind)!
    context.shaderSource(shader, source)
    context.compileShader(shader)
    return shader
}

function initGl(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true })
    if (!context) return null

    const program = context.createProgram()!
    context.attachShader(program, compile(context, context.VERTEX_SHADER, VERTEX_SHADER))
    context.attachShader(program, compile(context, context.FRAGMENT_SHADER, FRAGMENT_SHADER))
    context.linkProgram(program)
    if (!context.getProgramParameter(program, context.LINK_STATUS)) return null
    context.useProgram(program)

    const buffer = context.createBuffer()
    context.bindBuffer(context.ARRAY_BUFFER, buffer)
    context.bufferData(context.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), context.STATIC_DRAW)
    const position = context.getAttribLocation(program, 'p')
    context.enableVertexAttribArray(position)
    context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0)

    const texture = context.createTexture()
    context.bindTexture(context.TEXTURE_2D, texture)
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE)
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE)
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR)
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR)
    context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, true)

    context.uniform1f(context.getUniformLocation(program, 'g'), props.gain)
    return context
}

function draw() {
    if (!gl || !video || !canvasRef.value) return
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
        gl.viewport(0, 0, canvasRef.value.width, canvasRef.value.height)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
}

function scheduleFrame() {
    if (stopped || !video) return
    if ('requestVideoFrameCallback' in video) {
        frameHandle = video.requestVideoFrameCallback(() => {
            draw()
            scheduleFrame()
        })
    } else {
        frameHandle = requestAnimationFrame(() => {
            draw()
            scheduleFrame()
        })
    }
}

onMounted(() => {
    if (!useCanvas.value || !canvasRef.value) return

    gl = initGl(canvasRef.value)
    if (!gl) {
        // без WebGL показуємо звичайне відео
        useCanvas.value = false
        return
    }

    video = document.createElement('video')
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.setAttribute('playsinline', '')
    video.setAttribute('muted', '')
    video.src = props.src
    video.addEventListener('loadedmetadata', () => {
        if (!canvasRef.value || !video) return
        canvasRef.value.width = video.videoWidth
        canvasRef.value.height = video.videoHeight
    })
    video.play().catch(() => {})
    scheduleFrame()
})

onBeforeUnmount(() => {
    stopped = true
    if (video && frameHandle !== null) {
        if ('cancelVideoFrameCallback' in video) {
            video.cancelVideoFrameCallback(frameHandle)
        } else {
            cancelAnimationFrame(frameHandle)
        }
    }
    video?.pause()
    video?.removeAttribute('src')
    video?.load()
    video = null
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    gl = null
})
</script>

<template>
    <canvas v-if="useCanvas" ref="canvasRef" class="luma-canvas"></canvas>
    <video v-else autoplay muted loop playsinline>
        <source :src="src" :type="type">
    </video>
</template>
