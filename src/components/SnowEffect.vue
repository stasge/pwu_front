<template>
  <canvas ref="canvas" class="snow-canvas"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
let animationFrameId: number
let snowflakes: Array<{
  x: number
  y: number
  radius: number
  speed: number
  wind: number
}> = []

const createSnowflake = () => {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight - window.innerHeight,
    radius: Math.random() * 2.5 + 0.5, // 0.5-3px точки
    speed: Math.random() * 1 + 0.5, // швидкість падіння
    wind: Math.random() * 0.5 - 0.25 // вітер
  }
}

const initSnow = () => {
  const isMobile = window.innerWidth <= 768
  const count = isMobile ? 20 : 100
  snowflakes = []
  for (let i = 0; i < count; i++) {
    snowflakes.push(createSnowflake())
  }
}

const updateSnow = () => {
  snowflakes.forEach(flake => {
    flake.y += flake.speed
    flake.x += flake.wind
    
    // Якщо сніжинка вийшла за межі екрану, повертаємо її вгору
    if (flake.y > window.innerHeight) {
      flake.y = -10
      flake.x = Math.random() * window.innerWidth
    }
    
    if (flake.x > window.innerWidth) {
      flake.x = 0
    } else if (flake.x < 0) {
      flake.x = window.innerWidth
    }
  })
}

const drawSnow = () => {
  if (!canvas.value) return
  
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return
  
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.beginPath()
  
  snowflakes.forEach(flake => {
    ctx.moveTo(flake.x, flake.y)
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
  })
  
  ctx.fill()
}

const animate = () => {
  updateSnow()
  drawSnow()
  animationFrameId = requestAnimationFrame(animate)
}

const resizeCanvas = () => {
  if (!canvas.value) return
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
}

onMounted(() => {
  if (canvas.value) {
    resizeCanvas()
    initSnow()
    animate()
    window.addEventListener('resize', resizeCanvas)
  }
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
.snow-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
}
</style>
