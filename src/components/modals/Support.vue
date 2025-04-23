<script setup lang="ts">
import { onMounted, ref } from "vue";

const supportRef = ref();
onMounted(() => {
  setTimeout(() => {
    supportRef.value.style.left = "-120px";
  }, 20000);
  setInterval(() => {
    supportRef.value.style.left = "-120px";
  }, 300000);
});

const close = () => {
  supportRef.value.style.left = "-135%";
};

const support = () => {
  //some support logic
  close()
}
</script>
<template>
  <div ref="supportRef" class="support">
    <img class="support__img" src="@/assets/images/support-img.png" alt="" />
    <div class="support__text">
      <img src="@/assets/images/support-text.svg" alt="" />
      <button @click="support" class="support__btn btn btn-sm">Підтримати</button>
      <svg
        @click="close"
        class="support__close"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.34523 2.08398C4.45046 1.98005 4.61498 1.96746 4.7339 2.04492L4.78175 2.08398L11.0513 8.35352C11.5601 8.86237 12.3913 8.86316 12.8999 8.35449L12.8989 8.35352L19.1753 2.08789C19.2765 1.98666 19.4413 1.97178 19.562 2.0498L19.6109 2.08887L21.8911 4.36816C22.0087 4.48569 22.0092 4.682 21.8921 4.7998L15.6157 11.0703C15.1382 11.5467 15.1098 12.3064 15.5259 12.8184L15.6148 12.917L15.6157 12.918L21.8882 19.1895C22.0053 19.3065 22.0069 19.5028 21.8892 19.6221L19.604 21.8984C19.4999 22.0016 19.3347 22.015 19.2153 21.9375L19.1675 21.8984L12.898 15.6289C12.4214 15.1523 11.66 15.1219 11.148 15.5391L11.0493 15.6279L4.77394 21.8955H4.77296C4.66987 21.9983 4.50559 22.0109 4.38722 21.9336L4.33937 21.8955L2.05714 19.6152C1.94029 19.498 1.93925 19.3018 2.05714 19.1826L8.33546 12.9141C8.81298 12.4378 8.84115 11.678 8.42531 11.166L8.33644 11.0674L8.33546 11.0664L2.063 4.79297H2.06203C1.95875 4.69002 1.94544 4.52623 2.02296 4.4082L2.06203 4.36133L4.34523 2.08398Z"
          fill="white"
          stroke="black"
        />
      </svg>
    </div>
  </div>
</template>
<style scoped lang="scss">
.support {
  width: 600px;
  position: fixed;
  top: 200px;
  left: -135%;
  z-index: 1000;
  transition: all 1s;

  @media (max-width: 560px) {
    width: 500px;
  }

  &__img {
    width: 100%;
    transform: rotate(35deg);
  }

  &__text {
    position: absolute;
    left: 50%;
    top: -80px;

    @media (max-width: 560px) {
      width: 235px;

      img {
        width: 230px;
      }
    }
  }

  &__btn {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-42%);
    animation: btn-click 3s ease-in-out infinite;

    @media (max-width: 560px) {
      bottom: 15px;
    }
  }

  &__close {
    position: absolute;
    right: 0;
    top: 0;
    cursor: pointer;
  }
}

@keyframes btn-click {
  0% {
    transform: translateX(-42%) scale(1);
  }
  6% {
    transform: translateX(-42%) scale(1.1);
  }
  12% {
    transform: translateX(-42%) scale(1);
  }
  18% {
    transform: translateX(-42%) scale(1.1);
  }
  24% {
    transform: translateX(-42%) scale(1);
  }

  /* решта часу — пауза */
  100% {
    transform: translateX(-42%) scale(1);
  }
}
</style>
