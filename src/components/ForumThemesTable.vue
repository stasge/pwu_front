<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { format } from 'date-fns'
import type { IForumTheme } from '@/models/forum'
import themeIcon from '@/assets/icons/theme-icon.svg'
import createdIcon from '@/assets/icons/created-icon.svg'
import answersIcon from '@/assets/icons/answers-icon.svg'
import viewsIcon from '@/assets/icons/views-icon.svg'
import updatedIcon from '@/assets/icons/updated-icon.svg'

interface IProps {
    themes: IForumTheme[]
    catId: number
    isAdmin: boolean
    currentUserId?: number
}

const props = defineProps<IProps>()

const emit = defineEmits<{
    edit: [themeIdMain: number, themeId: number]
    delete: [event: MouseEvent, themeId: number]
}>()

const openedActionMenuId = ref<number | null>(null)

const canManageTheme = (theme: IForumTheme) => props.isAdmin || props.currentUserId === theme.user_id

const showActionsColumn = computed(() => props.isAdmin || props.themes.some(canManageTheme))

const toggleActionMenu = (themeId: number) => {
    openedActionMenuId.value = openedActionMenuId.value === themeId ? null : themeId
}

const closeActionMenu = () => {
    openedActionMenuId.value = null
}

const onEditTheme = (themeIdMain: number, themeId: number) => {
    closeActionMenu()
    emit('edit', themeIdMain, themeId)
}

const onDeleteTheme = (event: MouseEvent, themeId: number) => {
    closeActionMenu()
    emit('delete', event, themeId)
}

const handleActionMenuClickOutside = () => {
    closeActionMenu()
}

onMounted(() => {
    document.addEventListener('click', handleActionMenuClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleActionMenuClickOutside)
})
</script>

<template>
    <div class="forum-themes-table">
        <div class="forum-themes-table__corner forum-themes-table__corner--top-left"></div>
        <div class="forum-themes-table__corner forum-themes-table__corner--top-right"></div>
        <div class="forum-themes-table__corner forum-themes-table__corner--bottom-left"></div>
        <div class="forum-themes-table__corner forum-themes-table__corner--bottom-right"></div>

        <div class="forum-themes-table__header">
            <div class="forum-themes-table__col forum-themes-table__col--topic">
                <img :src="themeIcon" alt="theme" class="forum-themes-table__header-icon" />
                <span>Тема</span>
            </div>
            <div class="forum-themes-table__col forum-themes-table__col--created">
                <img :src="createdIcon" alt="created" class="forum-themes-table__header-icon" />
                <span>Створено</span>
            </div>
            <div class="forum-themes-table__col forum-themes-table__col--replies">
                <img :src="answersIcon" alt="answers" class="forum-themes-table__header-icon" />
                <span>Відповіді</span>
            </div>
            <div class="forum-themes-table__col forum-themes-table__col--views">
                <img :src="viewsIcon" alt="views" class="forum-themes-table__header-icon" />
                <span>Перегляди</span>
            </div>
            <div class="forum-themes-table__col forum-themes-table__col--updated">
                <img :src="updatedIcon" alt="updated" class="forum-themes-table__header-icon" />
                <span>Оновлено</span>
            </div>
            <div v-if="showActionsColumn" class="forum-themes-table__col forum-themes-table__col--actions">Дії</div>
        </div>

        <div class="forum-themes-table__body">
            <div v-for="theme of themes" :key="theme.id" class="forum-themes-table__row">
                <div class="forum-themes-table__mobile-corner forum-themes-table__mobile-corner--top-left"></div>
                <div class="forum-themes-table__mobile-corner forum-themes-table__mobile-corner--top-right"></div>
                <div class="forum-themes-table__mobile-corner forum-themes-table__mobile-corner--bottom-left"></div>
                <div class="forum-themes-table__mobile-corner forum-themes-table__mobile-corner--bottom-right"></div>

                <div class="forum-themes-table__col forum-themes-table__col--topic">
                    <RouterLink
                        :to="{ name: 'separate-theme', params: { theme_id: theme.id, cat_id: catId } }"
                        class="forum-themes-table__theme-link"
                    >
                        {{ theme.name }}
                    </RouterLink>
                </div>
                <div class="forum-themes-table__meta">
                    <div class="forum-themes-table__col forum-themes-table__col--created" data-label="Створено:">
                        {{ format(new Date(theme.created_at), 'dd.MM.yyyy, HH:mm') }}
                    </div>
                    <div class="forum-themes-table__col forum-themes-table__col--replies" data-label="Відповіді:">
                        {{ theme.messages_count }}
                    </div>
                    <div class="forum-themes-table__col forum-themes-table__col--views" data-label="Перегляди:">
                        {{ theme.views_count }}
                    </div>
                    <div class="forum-themes-table__col forum-themes-table__col--updated" data-label="Оновлено:">
                        {{ format(new Date(theme.edited_at || theme.created_at), 'dd.MM.yyyy, HH:mm') }}
                    </div>
                </div>

                <div v-if="canManageTheme(theme)" class="forum-themes-table__col forum-themes-table__col--actions">
                    <div class="forum-themes-table__actions" @click.stop>
                        <button
                            class="forum-themes-table__actions-trigger"
                            title="Дії"
                            @click.stop="toggleActionMenu(theme.id)"
                        >
                            ⋮
                        </button>

                        <div
                            v-if="openedActionMenuId === theme.id"
                            class="forum-themes-table__actions-menu"
                        >
                            <button
                                class="forum-themes-table__actions-menu-item"
                                @click.stop="onEditTheme(theme.id_main, theme.id)"
                            >
                                <span>Редагувати тему</span>
                                <img width="20" height="20" src="@/assets/images/feather.svg" alt="Edit">
                            </button>
                            <button
                                v-if="isAdmin"
                                class="forum-themes-table__actions-menu-item forum-themes-table__actions-menu-item--danger"
                                @click.stop="onDeleteTheme($event, theme.id)"
                            >
                                <span>Видалити тему</span>
                                <img src="@/assets/images/Boom.svg" alt="Trash">
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.forum-themes-table {
    backdrop-filter: blur(64px);
    background: rgba(250, 250, 250, 0.05);
    border-radius: 5px;
    border: none;
    position: relative;
    padding: 20px 10px;

    @media (max-width: 768px) {
        background: none;
        backdrop-filter: none;
        padding: 0;
    }

    &__corner {
        position: absolute;
        width: 10px;
        height: 10px;
        background-image: url('@/assets/images/profile-corner.svg');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        z-index: 1;
        pointer-events: none;

        &--top-left { top: 0; left: 0; transform: rotate(0deg); }
        &--top-right { top: 0; right: 0; transform: rotate(90deg); }
        &--bottom-left { bottom: 0; left: 0; transform: rotate(-90deg); }
        &--bottom-right { bottom: 0; right: 0; transform: rotate(180deg); }

        @media (max-width: 768px) {
            display: none;
        }
    }

    &__header {
        display: grid;
        grid-template-columns: 2fr 1fr 0.8fr 0.8fr 1fr 0.5fr;
        gap: 16px;
        padding: 0 20px 14px;
        font-size: 14px;
        color: #fff;

        @media (max-width: 768px) { display: none; }
    }

    &__header-icon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
    }

    &__col {
        display: flex;
        align-items: center;

        &--topic {
            font-size: 16px;
        }

        &--created,
        &--replies,
        &--views,
        &--updated {
            justify-content: center;
            text-align: center;
        }

        &--actions {
            justify-content: flex-end;

            @media (max-width: 768px) {
                position: absolute;
                top: 15px;
                right: 15px;
                z-index: 3;
            }
        }

        @media (max-width: 768px) {
            &--created,
            &--replies,
            &--views,
            &--updated {
                background: rgba(0, 0, 0, 0.4);
                border-radius: 30px;
                justify-content: flex-start;
                display: inline-flex;
                width: auto;
                font-size: 12px;
                letter-spacing: -0.04em;
                color: #f8f8f8;
                padding: 3px 8px;
                margin-right: 0;
                gap: 4px;

                &::before {
                    content: attr(data-label);
                    color: rgba(248, 248, 248, 0.7);
                }
            }
        }
    }

    &__body {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    &__meta {
        display: contents;

        @media (max-width: 768px) {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 10px;
        }
    }

    &__row {
        display: grid;
        grid-template-columns: 2fr 1fr 0.8fr 0.8fr 1fr 0.5fr;
        gap: 16px;
        padding: 14px 20px;

        &:nth-child(odd) {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
        }

        @media (max-width: 768px) {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 15px;
            position: relative;
            border-radius: 10px;
            background: rgba(8, 10, 15, 0.9);
            backdrop-filter: blur(30px);
        }
    }

    &__mobile-corner {
        display: none;

        @media (max-width: 768px) {
            display: block;
            position: absolute;
            width: 10px;
            height: 10px;
            background-image: url('@/assets/images/profile-corner.svg');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            z-index: 1;
            pointer-events: none;

            &--top-left { top: 0; left: 0; transform: rotate(0deg); }
            &--top-right { top: 0; right: 0; transform: rotate(90deg); }
            &--bottom-left { bottom: 0; left: 0; transform: rotate(-90deg); }
            &--bottom-right { bottom: 0; right: 0; transform: rotate(180deg); }
        }
    }

    &__theme-link {
        color: #f8f8f8;
        text-decoration: none;
        font-size: 16px;
        transition: color 0.3s ease;
        font-weight: 500;

        &:hover {
            color: #fadfae;
        }

        @media (max-width: 768px) {
            font-size: 18px;
            line-height: 110%;
            letter-spacing: -0.06em;
            font-weight: 400;
            padding-right: 42px;
            margin-bottom: 8px;
        }
    }

    &__actions {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    &__actions-trigger {
        width: 32px;
        height: 32px;
        border: none;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.75);
        font-size: 22px;
        line-height: 1;
        border-radius: 50%;
        cursor: pointer;

        @media (max-width: 768px) {
            width: 24px;
            height: 24px;
            font-size: 14px;
        }
    }

    &__actions-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 290px;
        overflow: hidden;
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: rgba(15, 15, 20, 1);
        backdrop-filter: blur(18px);
        z-index: 20;
    }

    &__actions-menu-item {
        width: 100%;
        border: none;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px;
        cursor: pointer;
        color: #f8f8f8;
        background: rgba(255, 255, 255, 0.04);

        @media (max-width: 768px) {
            padding: 10px 12px;
        }

        &:not(:last-child) {
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        span {
            font-family: 'VollkornSC', sans-serif;
            font-size: 16px;
            line-height: 100%;
            letter-spacing: -0.06em;
            text-align: left;

            @media (max-width: 768px) {
                font-size: 14px;
            }
        }

        img {
            width: 22px;
            height: 22px;
            flex-shrink: 0;
        }

        &--danger {
            color: #e77979;
        }

    }
}
</style>
