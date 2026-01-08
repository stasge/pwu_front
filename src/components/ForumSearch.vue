<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchPost } from '@/utils/fetchApi';
import type { IForumTheme } from '@/models/forum';

const router = useRouter()
const searchQuery = ref('')
const searchResults = ref<IForumTheme[]>([])
const showSearchDropdown = ref(false)
const hasSearched = ref(false)
const isMobileSearchOpen = ref(false)
const searchTimeout = ref<number | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchDropdownRef = ref<HTMLDivElement | null>(null)
const mobileSearchInputRef = ref<HTMLInputElement | null>(null)

const performSearch = async (query: string) => {
    if (!query || query.trim().length < 2) {
        searchResults.value = []
        showSearchDropdown.value = false
        hasSearched.value = false
        return
    }

    try {
        const { data } = await fetchPost('forum/searchThemes', { search: query.trim() })
        searchResults.value = data || []
        hasSearched.value = true
        showSearchDropdown.value = true
    } catch (error) {
        searchResults.value = []
        hasSearched.value = true
        showSearchDropdown.value = true
    }
}

const handleSearchInput = () => {
    if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
    }
    
    searchTimeout.value = setTimeout(() => {
        performSearch(searchQuery.value)
    }, 300)
}

const goToTheme = (theme: IForumTheme) => {
    router.push({ 
        name: 'separate-theme', 
        params: { 
            theme_id: theme.id.toString(), 
            cat_id: theme.id_main.toString() 
        } 
    })
    searchQuery.value = ''
    searchResults.value = []
    showSearchDropdown.value = false
    hasSearched.value = false
    isMobileSearchOpen.value = false
}

const emit = defineEmits<{
    searchOpened: []
    searchClosed: []
}>()

const openMobileSearch = () => {
    isMobileSearchOpen.value = true
    emit('searchOpened')
    // Фокусуємо поле введення після відкриття
    setTimeout(() => {
        mobileSearchInputRef.value?.focus()
    }, 100)
}

const closeMobileSearch = () => {
    isMobileSearchOpen.value = false
    searchQuery.value = ''
    searchResults.value = []
    showSearchDropdown.value = false
    hasSearched.value = false
    emit('searchClosed')
}

// Експортуємо функцію для виклику ззовні
defineExpose({
    closeMobileSearch
})

const handleClickOutside = (event: MouseEvent) => {
    if (
        searchInputRef.value && 
        searchDropdownRef.value &&
        !searchInputRef.value.contains(event.target as Node) &&
        !searchDropdownRef.value.contains(event.target as Node)
    ) {
        showSearchDropdown.value = false
    }
    
    // Закриваємо мобільний пошук при кліку на backdrop
    if (isMobileSearchOpen.value) {
        const mobileContent = document.querySelector('.forum-search__mobile-content')
        const mobileIcon = document.querySelector('.forum-search__mobile-icon')
        const target = event.target as Node
        
        if (
            mobileContent &&
            mobileIcon &&
            !mobileContent.contains(target) &&
            !mobileIcon.contains(target)
        ) {
            closeMobileSearch()
        }
    }
}

onMounted(() => {
    window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    window.removeEventListener('click', handleClickOutside)
    if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
    }
})
</script>

<template>
    <div class="forum-search flex align-items-center">
        <!-- Desktop Search -->
        <div class="forum-search__wrapper forum-search__wrapper--desktop" ref="searchInputRef">
            <input 
                v-model="searchQuery"
                @input="handleSearchInput"
                @focus="showSearchDropdown = hasSearched"
                type="text" 
                placeholder="Пошук..." 
                class="forum-search__input"
            />
            <img src="@/assets/icons/forum-search.svg" alt="search" class="forum-search__icon">
            <div 
                v-if="showSearchDropdown" 
                class="forum-search__dropdown"
                ref="searchDropdownRef"
            >
                <div 
                    v-if="searchResults.length > 0"
                    v-for="theme in searchResults" 
                    :key="theme.id"
                    @click="goToTheme(theme)"
                    class="forum-search__dropdown-item"
                >
                    <div class="forum-search__dropdown-item-title">{{ theme.name }}</div>
                    <div class="forum-search__dropdown-item-meta">
                    </div>
                </div>
                <div 
                    v-else
                    class="forum-search__dropdown-empty"
                >
                    Нічого не знайдено
                </div>
            </div>
        </div>

        <!-- Mobile Search Icon -->
        <button 
            @click="openMobileSearch"
            class="forum-search__mobile-icon"
        >
            <img src="@/assets/icons/forum-search.svg" alt="search">
        </button>

        <!-- Mobile Search Panel -->
        <div 
            v-if="isMobileSearchOpen"
            class="forum-search__mobile-panel"
        >
            <div class="forum-search__mobile-content">
                <div class="forum-search__mobile-header">
                    <div class="forum-search__mobile-wrapper">
                        <input 
                            v-model="searchQuery"
                            @input="handleSearchInput"
                            @focus="showSearchDropdown = hasSearched"
                            ref="mobileSearchInputRef"
                            type="text" 
                            placeholder="Пошук..." 
                            class="forum-search__mobile-input"
                        />
                        <img src="@/assets/icons/forum-search.svg" alt="search" class="forum-search__mobile-icon-input">
                    </div>
                    <button 
                        @click="closeMobileSearch"
                        class="forum-search__mobile-close"
                    >
                        Закрити
                    </button>
                </div>
                <div 
                    v-if="showSearchDropdown" 
                    class="forum-search__mobile-dropdown"
                >
                    <div 
                        v-if="searchResults.length > 0"
                        v-for="theme in searchResults" 
                        :key="theme.id"
                        @click="goToTheme(theme)"
                        class="forum-search__dropdown-item"
                    >
                        <div class="forum-search__dropdown-item-title">{{ theme.name }}</div>
                        <div class="forum-search__dropdown-item-meta">
                        </div>
                    </div>
                    <div 
                        v-else
                        class="forum-search__dropdown-empty"
                    >
                        Нічого не знайдено
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.forum-search {
    position: relative;
    width: clamp(250px, 25vw, 350px);

    @media (max-width: 768px) {
        width: auto;
    }

    &__wrapper {
        position: relative;
        width: 100%;

        &--desktop {
            @media (max-width: 768px) {
                display: none;
            }
        }
    }

    &__mobile-icon {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        margin-left: 8px;

        @media (max-width: 768px) {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        img {
            width: 24px;
            height: 24px;
            opacity: 0.8;
        }

        &:hover img {
            opacity: 1;
        }
    }

    &__mobile-panel {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 1002;
        animation: fadeIn 0.2s ease-out forwards;

        @media (max-width: 768px) {
            display: block;
        }
    }

    &__mobile-content {
        position: absolute;
        top: 80px;
        left: 0;
        right: 0;
        background: rgba(10, 10, 10, 0.98);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        padding: 16px;
        border-bottom: 1px solid rgba(248, 248, 248, 0.2);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        transform: translateY(-100%);
        animation: slideDown 0.3s ease-out forwards;
    }

    &__mobile-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 0;
    }

    &__mobile-wrapper {
        flex: 1;
        position: relative;
    }

    &__mobile-input {
        width: 100%;
        padding: 12px 15px 12px 40px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        color: #f8f8f8;
        font-size: 16px;
        outline: none;

        &::placeholder {
            color: rgba(248, 248, 248, 0.5);
        }

        &:focus {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.2);
        }
    }

    &__mobile-icon-input {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        opacity: 0.7;
        width: 20px;
        height: 20px;
    }

    &__mobile-close {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: #f8f8f8;
        padding: 12px 20px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;

        &:hover {
            background: rgba(255, 255, 255, 0.15);
        }
    }

    &__mobile-dropdown {
        margin-top: 12px;
        max-height: 70dvh;
        overflow-y: auto;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 8px;
        border: 1px solid rgba(248, 248, 248, 0.1);

        &::-webkit-scrollbar {
            width: 6px;
        }

        &::-webkit-scrollbar-track {
            background: rgba(60, 60, 60, 0.5);
            border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb {
            background: rgba(248, 248, 248, 0.3);
            border-radius: 3px;

            &:hover {
                background: rgba(248, 248, 248, 0.5);
            }
        }
    }

    &__input {
        width: 100%;
        padding: 10px 15px 10px 40px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 999px;
        backdrop-filter: blur(70px);
        background: rgba(255, 255, 255, 0.1);
        color: #f8f8f8;
        font-size: 14px;
        transition: all 0.3s ease;
        outline: none;

        &::placeholder {
            color: rgba(248, 248, 248, 0.5);
        }

        &:focus {
            background: rgba(255, 255, 255, 0.2);
        }
    }

    &__icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        opacity: 0.7;
    }

    &__dropdown {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 1);
        border: 1px solid rgba(248, 248, 248, 0.2);
        border-radius: 8px;
        max-height: 400px;
        overflow-y: auto;
        z-index: 1000;

        &::-webkit-scrollbar {
            width: 6px;
        }

        &::-webkit-scrollbar-track {
            background: rgba(60, 60, 60, 0.5);
            border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb {
            background: rgba(248, 248, 248, 0.3);
            border-radius: 3px;

            &:hover {
                background: rgba(248, 248, 248, 0.5);
            }
        }
    }

    &__dropdown-item {
        padding: 12px 15px;
        cursor: pointer;
        transition: all 0.2s ease;
        border-bottom: 1px solid rgba(248, 248, 248, 0.1);

        &:last-child {
            border-bottom: none;
        }

        &:hover {
            background: rgba(25, 25, 25, 0.5);
        }
    }

    &__dropdown-item-title {
        color: #f8f8f8;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
        line-height: 1.4;
    }

    &__dropdown-item-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        color: rgba(248, 248, 248, 0.6);
        font-size: 12px;

        span {
            &:nth-child(2) {
                opacity: 0.5;
            }
        }
    }

    &__dropdown-empty {
        padding: 20px 15px;
        text-align: center;
        color: rgba(248, 248, 248, 0.6);
        font-size: 14px;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideDown {
    from {
        transform: translateY(-100%);
    }
    to {
        transform: translateY(0);
    }
}
</style>

