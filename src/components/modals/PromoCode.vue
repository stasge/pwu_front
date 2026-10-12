<script setup lang="ts">
import Modal from "@/components/base/modal.vue";
import { reactive, ref } from "vue";
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { fetchPost } from "@/utils/fetchApi";
import type { GameUser } from "@/models/user";
import { useAsyncCallWrapper } from "@/composables/useAsyncCallWrapper";
import { useToast } from "vue-toastification";
import { format } from "date-fns";
import Select from 'primevue/select';
import Button from 'primevue/button';

const showModal = ref(false);
const { wrapAsyncCall } = useAsyncCallWrapper();
const toasts = useToast();
const availableAccounts = ref<{ is_active: boolean; user: GameUser }[]>([]);
const form = reactive<{
  code: string;
  game_id: number | null;
  role_id: number | null;
}>({
  code: "",
  game_id: null,
  role_id: null,
});
const rules = {
  code: { required },
};

const v$ = useVuelidate(rules, form, {$stopPropagation: true});

const showDia = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const resetForm = () => {
  form.code = "";
  form.game_id = null;
  form.role_id = null;
  availableAccounts.value = [];
  v$.value.reset();
};

const checkPromoCode = async () => {
  if (!(await v$.value.$validate())) {
    return;
  }
  await wrapAsyncCall(
    async () => {
      const { data } = await fetchPost("user/checkPromo", {
        code: form.code,
      });
      if (data.length) {
        availableAccounts.value = data;
      }
    },
    (err) => {
      toasts.error("Помилка при використанні промокоду");
      return true;
    },
  );
};

type AccountStatus = "available" | "used" | "noRoles";

const getAccountStatus = (acc: { is_active: boolean; user: GameUser }): AccountStatus => {
  if (!acc.is_active) return "used";
  if (!acc.user.roles?.length) return "noRoles";
  return "available";
};

const chooseAccount = (acc: { is_active: boolean; user: GameUser }) => {
  if (getAccountStatus(acc) !== "available") return;
  form.game_id = acc.user.id_game;
};

const applyPromo = async () => {
  await wrapAsyncCall(
    async () => {
      await fetchPost("user/promo", {...form});
      toasts.success("Промокод успішно використано"); 
      closeModal();
    }
  );
};

defineExpose({
  showDia,
});
</script>
<template>
  <Modal v-model:showed="showModal" @closeDia="closeModal">
    <template #header>
      <h2 class="modal__title w-full">
        <span v-if="!availableAccounts.length">Введіть промокод</span>
        <span v-else-if="availableAccounts.length && !form.game_id" class="block text-center">Оберіть ігровий акаунт</span>
        <div v-else class="flex align-items-center gap-3">
            <img width="22" src="@/assets/images/arrow-prev.svg" alt="back" class="cursor-pointer" @click.stop="form.game_id = form.role_id = null" />
            <span class="block text-center">Оберіть персонажа</span>
        </div>
      </h2>
    </template>
    <template #body>
      <form
        v-if="!availableAccounts.length"
        @submit.prevent="checkPromoCode"
        class="flex flex-column justify-content-center w-full"
      >
        <div class="field w-full">
          <label for="promoCode" class="w-full">Промокод</label>
          <div class="custom-input w-full" :class="{ error: v$.code.$error }">
            <div class="input-bg"></div>
            <input
              v-model="form.code"
              id="promoCode"
              type="text"
              placeholder="Введіть промокод"
            />
          </div>
        </div>
        <button type="submit" class="fantasy-btn mt-3 align-self-center">
          <span>Застосувати</span>
        </button>
      </form>
      <div v-else-if="availableAccounts.length && !form.game_id" class="w-full">
        <p>Обрати можна лише акаунти зі створеними персонажами, на яких цей промокод ще не застосовано</p>
        <div class="game-acc__wrapper custom-scroll">
          <div
            v-for="(acc, index) in availableAccounts"
            :key="acc.user.id"
            class="game-acc__item"
            :class="{ inactive: getAccountStatus(acc) !== 'available' }"
            @click.stop="chooseAccount(acc)"
          >
            <p>
              <span
                v-if="getAccountStatus(acc) === 'used'"
                class="game-acc__icon game-acc__icon--used game-acc__icon--start"
                title="Промокод уже застосовано на цьому акаунті"
              >✓</span>
              {{ index + 1 }}.
            </p>
            <p>{{ acc.user.username }}</p>
            <p>{{ format(acc.user.created_at, "dd-MM-yyyy") }}</p>
            <p>
              Персонажі: {{ acc.user.roles?.length ?? 0 }}
              <span
                v-if="getAccountStatus(acc) === 'noRoles'"
                class="game-acc__icon game-acc__icon--noRoles"
                title="Спочатку створіть персонажа в грі"
              >!</span>
            </p>
          </div>
        </div>
      </div>
      <div v-else class="w-full mt-3">
        <div class="flex flex-column gap-2 w-full">
          <Select 
            v-model="form.role_id" 
            :options="(availableAccounts.find((acc) => acc.user.id_game === form.game_id)?.user.roles ?? []).map((role) => ({ label: role.name, value: role.id }))" 
            optionLabel="label" 
            optionValue="value" 
            placeholder="Оберіть персонажа" 
            class="w-full" 
          />
        </div>
      </div>
      <button
        v-if="availableAccounts.length && form.game_id && form.role_id"
        class="fantasy-btn mt-3"
        :class="{ disabled: form.game_id && form.role_id }"
        @click="applyPromo()"
      >
        <span>Застосувати</span>
      </button>
    </template>
  </Modal>
</template>
<style scoped lang="scss">
.game-acc {
  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
    max-height: 240px;
    overflow-y: auto;
    padding-right: 10px;
    position: relative;
  }

  &__item {
    display: grid;
    grid-template-columns: 10% 30% 30% 30%;
    padding: 20px;
    background: rgba($color: #000000, $alpha: 0.4);
    border-radius: 10px;
    cursor: pointer;
    position: relative;

    & > * {
      text-align: center;
    }

    &.inactive {
      cursor: not-allowed;
      background: rgba($color: #000000, $alpha: 0.1);

      & > p {
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin-left: 4px;
    border-radius: 50%;
    border: 1px solid currentColor;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
    vertical-align: middle;

    &--used {
      color: #7fd38a;
    }

    &--noRoles {
      color: #f0c060;
    }

    &--start {
      position: absolute;
      left: 4px;
      top: 50%;
      transform: translateY(-50%);
      margin: 0;
    }
  }
}
</style>
