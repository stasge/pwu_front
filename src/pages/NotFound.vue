<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="not-found">
    <div class="not-found__container">
      <div class="not-found__content">
        <div class="not-found__number">404</div>
        <h1 class="not-found__title">Сторінка не знайдена</h1>
        <p class="not-found__description">
          Схоже, що ви загубилися в просторах нашого сервера. 
          Не хвилюйтеся, навіть найкращі герої іноді потрапляють не туди!
        </p>
        <button @click="goHome" class="fantasy-btn ml-4">
          <span>на головну</span>
        </button>
      </div>
      <div class="not-found__logo-container">
        <video class="not-found__logo-video" autoplay muted loop playsinline>
          <source src="@/assets/video/Fireball.webm" type="video/webm">
        </video>
        <img class="not-found__logo" src="@/assets/images/hero-logo.png" alt="hero logo">
      </div>
    </div>
    <!-- Маски як у CTA -->
    <img src="@/assets/images/CTA-mask.png" class="not-found__mask-top" alt="not found mask top">
    <img src="@/assets/images/CTA-mask.png" class="not-found__mask-bottom" alt="not found mask bottom">
  </div>
</template>

<style scoped lang="scss">
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('@/assets/images/CTA-bg.jpg') no-repeat center / cover;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    z-index: 1;
  }

  &__container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4rem;
    max-width: 1200px;
    width: 100%;
    padding: 2rem;
    position: relative;
    z-index: 5;

    @media (max-width: 768px) {
      flex-direction: column-reverse;
      gap: 2rem;
      text-align: center;
    }
  }

  &__content {
    flex: 1;
    max-width: 500px;
  }

  &__number {
    font-family: "VollkornSC", sans-serif;
    font-size: clamp(8rem, 15vw, 12rem);
    font-weight: 400;
    background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px rgba(251, 210, 152, 0.5);
    line-height: 0.8;
    margin-bottom: 1rem;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: blur(20px);
      opacity: 0.3;
      z-index: -1;
    }
  }

  &__title {
    font-family: "VollkornSC", sans-serif;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 400;
    color: #f8f8f8;
    margin-bottom: 1.5rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }

  &__description {
    font-family: "Candara", sans-serif;
    font-size: clamp(1rem, 2vw, 1.2rem);
    color: #f8f8f8;
    line-height: 1.6;
    margin-bottom: 2.5rem;
    opacity: 0.9;
  }

  &__button {
    min-width: 280px;
    font-size: 1.2rem;
    padding: 15px 30px;
  }

  &__logo-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: clamp(170px, 20vw, 274px);
    max-width: 274px;
    isolation: isolate;

    @media (max-width: 768px) {
      width: clamp(150px, 30vw, 274px);
      max-width: 274px;
    }
  }

  &__logo {
    position: relative;
    width: 100%;
    height: auto;
    z-index: 1;
  }

  &__logo-video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 2;
    pointer-events: none;
    mix-blend-mode: screen;

    /* маска з PNG-лого (має бути з прозорістю) */
    -webkit-mask-image: url('@/assets/images/hero-logo.png');
    mask-image: url('@/assets/images/hero-logo.png');
    -webkit-mask-size: contain;
    mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;

    filter: contrast(1.6) brightness(1.2);
  }
  &__mask-top {
    position: absolute;
    top: -1px;
    left: -1px;
    width: 100%;
    height: clamp(76px, 10vw, 197px);
    z-index: 3;
  }
  
  &__mask-bottom {
    transform: rotate(180deg);
    position: absolute;
    bottom: -1px;
    left: -1px;
    width: 100%;
    height: clamp(76px, 10vw, 197px);
    z-index: 3;
  }
}


// Адаптивність
@media (max-width: 768px) {
  .not-found {
    padding: 2rem 1rem;
    
    &__container {
      padding: 1rem;
    }
    
    &__button {
      min-width: 250px;
      font-size: 1rem;
    }
  }
}
</style>
