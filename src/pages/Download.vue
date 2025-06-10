<script setup lang="ts">
</script>
<template>
  <div class="download-page">
      <div class="download-page__inner px-3">
          <div class="download-page__container">
            <h1 class="download-page__title text-white">Завантаження клієнта</h1>
            <a  href="https://valor.in.ua/files/PWUkraine.zip" target="_blank" class="btn btn-sm mt-5">Завантажити</a>
            <p class="mt-3">1. Після завантаження знайдіть файл архіву на вашому комп’ютері.</p>
            <p class="mt-2">2. Клікніть правою кнопкою миші > Обрати “Розпакувати до...” (або "Extract Here", якщо англійська).</p>
            <img src="@/assets/images/dwload-tip-1.png" alt="tip 1" class="mt-3">
            <p class="mt-2">3. Розпакуйте у зручну папку (наприклад, D:\Games\PW_Valor).</p>
            <p class="mt-2">4. Зайдіть у розпаковану папку і запустіть VALOR.exe.</p>
            <img src="@/assets/images/dwload-tip-2.png" alt="tip 2" class="mt-3">
            <p class="mt-2">Якщо при запуску гри з'являється синє вікно з повідомленням "ОС Windows захистила цей ПК", це стандартне попередження від SmartScreen — воно з'являється при запуску файлів від невідомих видавців.</p>
            <div class="flex gap-2 w-full">
                <img src="@/assets/images/dwload-tip-3.png" alt="tip 3" class="mt-3 w-6">
                <img src="@/assets/images/dwload-tip-4.png" alt="tip 4" class="mt-3 w-6">
            </div>
            <p class="mt-3"><i><strong>Якщо у вас Windows 11, ось інструкція, як додати папку з грою в виключення, бо вбудований захист Windows (аналог антивірусу) може блокувати гру.</strong></i></p>
            <p class="mt-2"><i><strong>Як додати папку в виключення Захисника Windows (Windows Defender):</strong></i></p>
            <ul class="pl-5 mt-2">
                <li>Відкрийте <strong>Параметри</strong> (натисніть Win + I).</li>
                <li>Перейдіть у розділ <strong>Конфіденційність і безпека</strong> → <strong>Безпека Windows</strong>.</li>
                <li>Натисніть <strong>Відкрити безпеку Windows</strong>.</li>
                <li>Виберіть <strong>Захист від вірусів та загроз</strong>.</li>
                <li>Прокрутіть вниз і натисніть <strong>Керування налаштуваннями</strong> (у розділі «Параметри захисту від вірусів та загроз»).</li>
                <li>Прокрутіть до блоку <strong>Виключення</strong> і натисніть <strong>Додати або видалити виключення</strong>.</li>
                <li>Натисніть <strong>Додати виключення</strong> → виберіть <strong>Папка</strong>.</li>
                <li>Знайдіть і виберіть папку з грою, щоб додати її до виключень.</li>
            </ul>
            <p class="mt-3">5. Встановіть програму у зручне для вас місце.</p>
            <img src="@/assets/images/dwload-tip-7.png" alt="tip 7" class="mt-3">
            <img src="@/assets/images/dwload-tip-5.png" alt="tip 5" class="mt-3">
            <img src="@/assets/images/dwload-tip-6.png" alt="tip 6" class="mt-3">
            <img src="@/assets/images/dwload-tip-8.png" alt="tip 8" class="mt-3">
            <img src="@/assets/images/dwload-tip-9.png" alt="tip 9" class="mt-3">
            <img src="@/assets/images/dwload-tip-10.png" alt="tip 10" class="mt-3">
            <img src="@/assets/images/dwload-tip-11.png" alt="tip 11" class="mt-3">
            <img src="@/assets/images/dwload-tip-12.png" alt="tip 12" class="mt-3">
            <img src="@/assets/images/dwload-tip-13.png" alt="tip 13" class="mt-3">
            <p class="mt-2">6. Також не забудьте заздалегідь зареєструвати свій акаунт.</p>
            <img src="@/assets/images/dwload-tip-14.png" alt="tip 14" class="mt-3">
            <img src="@/assets/images/dwload-tip-15.png" alt="tip 15" class="mt-3">
            <p class="mt-2">7. І створити ігровий акаунт у особистому кабінеті, логін і пароль якого буде використовуватися для авторизації в грі.</p>
            <img src="@/assets/images/dwload-tip-16.png" alt="tip 15" class="mt-3">
            <a  href="https://valor.in.ua/files/PWUkraine.zip" target="_blank" class="btn btn-sm mt-5">Завантажити</a>
        </div>
    </div>
  </div>
  </template>
<style scoped lang="scss">
.download-page {
    width: 100%;
    
    &__container {
        color: white;
        background: rgba(93, 119, 144, 0.2);
        padding: clamp(20px, 5vw, 40px);
        border-radius: 10px;
    }

    img {
        border-radius: 5px;
    }

    * {
        max-width: 100%;
    }

}
</style>