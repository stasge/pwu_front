<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useToast } from 'vue-toastification';
import Modal from '@/components/base/modal.vue';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { fetchPost } from '@/utils/fetchApi';
import { inputToPollDate, pollDateToInput } from '@/utils/pollDate';
import {
    POLL_VISIBILITY_LABELS,
    type Poll,
    type PollVisibility,
} from '@/models/poll';

const emit = defineEmits<{ (e: 'saved'): void }>()

const toast = useToast()
const { wrapAsyncCall } = useAsyncCallWrapper()

const showed = ref(false)
const editingId = ref<number | null>(null)
/** Після першого голосу варіанти й видимість змінювати не можна */
const locked = ref(false)
const original = ref<Poll | null>(null)

const form = reactive({
    title: '',
    description: '',
    visibility: 'anonymous' as PollVisibility,
    options: ['', ''] as string[],
    startsAt: '',
    endsAt: '',
})

const isEdit = computed(() => editingId.value != null)

const resetForm = () => {
    form.title = ''
    form.description = ''
    form.visibility = 'anonymous'
    form.options = ['', '']
    form.startsAt = ''
    form.endsAt = ''
    locked.value = false
    original.value = null
}

const showDia = async (id?: number) => {
    resetForm()
    editingId.value = id ?? null
    if (id != null) {
        const resp = await wrapAsyncCall(() => fetchPost('admin/polls/get', { id }))
        const poll: Poll | undefined = resp?.data
        if (!poll) return
        original.value = poll
        locked.value = poll.totalVotes > 0
        form.title = poll.title
        form.description = poll.description ?? ''
        form.visibility = poll.visibility
        form.options = poll.options.map(o => o.text)
        form.startsAt = pollDateToInput(poll.startsAt)
        form.endsAt = pollDateToInput(poll.endsAt)
    }
    showed.value = true
}

const addOption = () => form.options.push('')
const removeOption = (index: number) => form.options.splice(index, 1)

const cleanOptions = () => form.options.map(o => o.trim()).filter(Boolean)

const validate = (): boolean => {
    if (!form.title.trim()) {
        toast.error('Вкажіть назву опитування')
        return false
    }
    if (!locked.value && cleanOptions().length < 2) {
        toast.error('Потрібно щонайменше 2 варіанти відповіді')
        return false
    }
    if (!!form.startsAt !== !!form.endsAt) {
        toast.error('Вкажіть і дату початку, і дату завершення (або жодної — тоді це чернетка)')
        return false
    }
    if (form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) {
        toast.error('Дата завершення має бути пізніше за дату початку')
        return false
    }
    return true
}

const buildCreateBody = () => ({
    title: form.title.trim(),
    description: form.description.trim() || null,
    visibility: form.visibility,
    options: cleanOptions(),
    startsAt: inputToPollDate(form.startsAt),
    endsAt: inputToPollDate(form.endsAt),
})

/** Часткове оновлення: 🔒-поля надсилаємо тільки якщо вони реально змінились */
const buildUpdateBody = () => {
    const body: Record<string, unknown> = {
        id: editingId.value,
        title: form.title.trim(),
        description: form.description.trim() || null,
        startsAt: inputToPollDate(form.startsAt),
        endsAt: inputToPollDate(form.endsAt),
    }
    const prev = original.value
    if (!locked.value && prev) {
        if (form.visibility !== prev.visibility) body.visibility = form.visibility
        const options = cleanOptions()
        const prevOptions = prev.options.map(o => o.text)
        if (options.length !== prevOptions.length || options.some((o, i) => o !== prevOptions[i])) {
            body.options = options
        }
    }
    return body
}

const save = async () => {
    if (!validate()) return
    const result = await wrapAsyncCall(
        () => isEdit.value
            ? fetchPost('admin/polls/update', buildUpdateBody())
            : fetchPost('admin/polls/create', buildCreateBody()),
        null,
        isEdit.value ? 'Опитування оновлено' : 'Опитування створено',
    )
    if (result) {
        showed.value = false
        emit('saved')
    }
}

const hasStarted = computed(() => original.value?.status === 'active' || original.value?.status === 'finished')

defineExpose({ showDia })
</script>
<template>
    <Modal v-model:showed="showed">
        <template #header>
            <h2 class="modal__title">{{ isEdit ? 'Редагування опитування' : 'Нове опитування' }}</h2>
        </template>
        <template #body>
            <form class="poll-form" @submit.prevent="save">
                <p v-if="locked" class="poll-form__warning">
                    В опитуванні вже є голоси — варіанти та видимість змінювати не можна.
                </p>
                <p v-else-if="hasStarted" class="poll-form__warning">
                    Опитування вже стартувало. Зміна варіантів замінить їх повністю.
                </p>

                <label class="poll-form__field">
                    <span>Назва *</span>
                    <input v-model="form.title" type="text" maxlength="255" placeholder="Наприклад: Новий формат війни кланів">
                </label>

                <label class="poll-form__field">
                    <span>Опис</span>
                    <textarea v-model="form.description" rows="3" placeholder="Необов'язково"></textarea>
                </label>

                <label class="poll-form__field">
                    <span>Видимість голосів</span>
                    <select v-model="form.visibility" :disabled="locked">
                        <option v-for="(label, value) in POLL_VISIBILITY_LABELS" :key="value" :value="value">{{ label }}</option>
                    </select>
                </label>

                <div class="poll-form__field">
                    <span>Варіанти відповіді * (мінімум 2)</span>
                    <div v-for="(_, index) in form.options" :key="index" class="poll-form__option">
                        <input v-model="form.options[index]" type="text" :placeholder="`Варіант ${index + 1}`" :disabled="locked">
                        <button
                            v-if="!locked && form.options.length > 2"
                            type="button"
                            class="poll-form__remove"
                            title="Прибрати варіант"
                            @click="removeOption(index)"
                        >✕</button>
                    </div>
                    <button v-if="!locked" type="button" class="poll-form__add" @click="addOption">+ Додати варіант</button>
                </div>

                <div class="poll-form__row">
                    <label class="poll-form__field">
                        <span>Початок (час сервера)</span>
                        <input v-model="form.startsAt" type="datetime-local">
                    </label>
                    <label class="poll-form__field">
                        <span>Завершення (час сервера)</span>
                        <input v-model="form.endsAt" type="datetime-local">
                    </label>
                </div>
                <p class="poll-form__hint">Без дат опитування зберігається як чернетка і не видно користувачам.</p>

                <button type="submit" class="fantasy-btn small poll-form__submit">
                    <span>{{ isEdit ? 'Зберегти' : 'Створити' }}</span>
                </button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang="scss">
.poll-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: min(640px, 80vw);
    max-height: 70vh;
    overflow-y: auto;
    padding: 4px 8px 4px 0;

    @media (max-width: 768px) {
        width: 100%;
    }

    &__warning {
        margin: 0;
        padding: 10px 14px;
        border-radius: 5px;
        background: rgba(251, 210, 152, 0.1);
        border: 1px solid rgba(251, 210, 152, 0.3);
        color: #fbd298;
        font-family: "Candara", sans-serif;
        font-size: 14px;
    }

    &__row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;

        @media (max-width: 600px) {
            grid-template-columns: 1fr;
        }
    }

    &__field {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 !important;
        line-height: 1.2 !important;

        > span {
            font-family: "Candara", sans-serif;
            font-size: 14px;
            color: rgba(248, 248, 248, 0.7);
        }

        input,
        textarea,
        select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid rgba(248, 248, 248, 0.15);
            border-radius: 5px;
            background: rgba(0, 0, 0, 0.45);
            color: #f8f8f8;
            font-family: "Candara", sans-serif;
            font-size: 15px;
            outline: none;
            color-scheme: dark;

            &:focus { border-color: rgba(251, 210, 152, 0.6); }
            &:disabled { opacity: 0.5; cursor: not-allowed; }
        }

        textarea { resize: vertical; }
    }

    &__option {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    &__remove {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        border: 1px solid rgba(255, 82, 82, 0.3);
        border-radius: 5px;
        background: rgba(255, 82, 82, 0.08);
        color: #ff8a8a;
    }

    &__add {
        align-self: flex-start;
        padding: 6px 0;
        border: none;
        background: none;
        color: #fbd298;
        font-family: "Candara", sans-serif;
        font-size: 15px;
    }

    &__hint {
        margin: -8px 0 0;
        font-family: "Candara", sans-serif;
        font-size: 13px;
        color: rgba(248, 248, 248, 0.5);
    }

    &__submit {
        align-self: center;
        min-width: 200px;
        margin-top: 8px;
    }
}
</style>
