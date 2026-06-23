<script setup lang="ts">
import { useAsyncCallWrapper } from "@/composables/useAsyncCallWrapper";
import { useUserStore } from "@/stores/userStore";
import { fetchGet, fetchPost } from "@/utils/fetchApi";
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

const emit = defineEmits(["verificationDone"]);
const { t } = useI18n();
const toast = useToast();
const { wrapAsyncCall } = useAsyncCallWrapper();
const userStore = useUserStore();

const verificationForm = reactive({
  code: "",
});

const verificationRules = {
  code: { required },
};
const verificationV$ = useVuelidate(verificationRules, verificationForm);

const verify = async () => {
  if (!(await verificationV$.value.$validate())) {
    return;
  }

  await wrapAsyncCall(
    async () => {
      const { data: user } = await fetchPost("user/sendCode", {
        code: verificationForm.code,
      });
      userStore.loadUser(user);
      emit("verificationDone");
    },
    (e) => {
      toast.error(t(e.data.msg));
      return true;
    },
    "Ви успішно верифікували обліковий запис"
  );
};

const sendVerificationCode = async () => {
  await wrapAsyncCall(
    async () => {
      await fetchGet("user/verification", {});
    },
    (e) => {
      toast.error(t(e.data.msg));
      return true;
    },
    "Код верифікації було відправлено повторно. Перевірте вашу електрону пошту"
  );
};
</script>
<template>
  <form
    @submit.prevent="verify"
    class="flex flex-column justify-content-center"
  >
    <h2 class="mb-5">
      На вашу пошту було відправлено код для верифікації
    </h2>
    <div class="field w-full">
      <label for="login" class="w-full">Код для верифікації</label>
      <input
        v-model="verificationForm.code"
        id="login"
        type="text"
        :class="{ invalid: verificationV$.code.$error }"
        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
      />
    </div>
    <p class="text-xl mb-3">
      Якщо ви не бачите листа — перевірте папку «Спам».
    </p>
    <span @click="sendVerificationCode" class="underline cursor-pointer">
      Відправити код повторно
    </span>
    <button type="submit" class="btn btn-sm mt-3 align-self-center">
      Відправити
    </button>

  </form>
</template>
<style scoped lang="scss"></style>
