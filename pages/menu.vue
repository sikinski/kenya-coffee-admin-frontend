<template>
    <div class="menu-page page-padding">
        <div class="content">
            <div class="header-section">
                <div class="header-top">
                    <ui-go-back />
                    <h1 class="h1">Меню</h1>
                </div>
                <div class="header-actions">
                    <button class="add-item-btn" @click="showItemForm = true" v-if="!showItemForm">
                        <span class="btn-text">Добавить позицию</span>
                        <span class="plus-icon"></span>
                    </button>
                </div>
            </div>

            <!-- Фильтры -->
            <div class="filters-section">
                <div class="filter-group">
                    <label class="filter-label">Тип:</label>
                    <Multiselect v-model="filters.typeId" :options="typeSelectOptions" :searchable="false"
                        placeholder="Все типы" @update:model-value="handleTypeFilterChange" />
                </div>
                <div class="filter-group">
                    <label class="filter-label">Активность:</label>
                    <Multiselect v-model="filters.active" :options="activeSelectOptions" :searchable="false"
                        placeholder="Все" @update:model-value="handleActiveFilterChange" />
                </div>
                <div class="filter-group">
                    <label class="filter-label">Теги:</label>
                    <div class="tags-filter">
                        <span class="tag-filter" v-for="tag in tags" :key="tag.id"
                            :class="{ 'tag-filter_active': filters.tagIds.includes(tag.id) }"
                            @click="toggleTagFilter(tag.id)">
                            {{ tag.name }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Управление типами и тегами -->
            <div class="management-section">
                <button class="manage-btn" @click="showTypesPanel = !showTypesPanel">
                    Управление типами
                </button>
                <button class="manage-btn" @click="showTagsPanel = !showTagsPanel">
                    Управление тегами
                </button>
            </div>

            <!-- Панель типов -->
            <div class="panel" v-if="showTypesPanel">
                <div class="panel-header">
                    <h3 class="panel-title">Типы позиций</h3>
                    <button class="close-panel-btn" @click="showTypesPanel = false">
                        <img src="@/assets/images/icons/close.svg" alt="" class="close-icon">
                    </button>
                </div>
                <button class="add-btn" @click="showTypeForm = true" v-if="!showTypeForm">
                    <span class="btn-text">Добавить тип</span>
                    <span class="plus-icon"></span>
                </button>
                <form v-if="showTypeForm" class="type-form" @submit.prevent="saveType">
                    <input type="text" class="input" v-model="typeForm.name" placeholder="Название типа" required />
                    <div class="form-actions">
                        <button type="submit" class="save-btn">Сохранить</button>
                        <button type="button" class="cancel-btn" @click="cancelTypeForm">Отмена</button>
                    </div>
                </form>
                <div class="items-list">
                    <div class="item-card" v-for="type in types" :key="type.id">
                        <span class="item-name">{{ type.name }}</span>
                        <button class="delete-btn" @click="deleteType(type.id)" title="Удалить">
                            <img src="@/assets/images/icons/close-round.svg" alt="" class="delete-icon">
                        </button>
                    </div>
                </div>
            </div>

            <!-- Панель тегов -->
            <div class="panel" v-if="showTagsPanel">
                <div class="panel-header">
                    <h3 class="panel-title">Теги</h3>
                    <button class="close-panel-btn" @click="showTagsPanel = false">
                        <img src="@/assets/images/icons/close.svg" alt="" class="close-icon">
                    </button>
                </div>
                <button class="add-btn" @click="showTagForm = true" v-if="!showTagForm">
                    <span class="btn-text">Добавить тег</span>
                    <span class="plus-icon"></span>
                </button>
                <form v-if="showTagForm" class="tag-form" @submit.prevent="saveTag">
                    <input type="text" class="input" v-model="tagForm.name" placeholder="Название тега" required />
                    <div class="form-actions">
                        <button type="submit" class="save-btn">Сохранить</button>
                        <button type="button" class="cancel-btn" @click="cancelTagForm">Отмена</button>
                    </div>
                </form>
                <div class="items-list">
                    <div class="item-card" v-for="tag in tags" :key="tag.id">
                        <span class="item-name">{{ tag.name }}</span>
                        <button class="delete-btn" @click="deleteTag(tag.id)" title="Удалить">
                            <img src="@/assets/images/icons/close-round.svg" alt="" class="delete-icon">
                        </button>
                    </div>
                </div>
            </div>

            <!-- Модальное окно с формой позиции -->
            <ui-modal-window v-if="showItemForm" @close="closeItemForm">
                <template #title>
                    <h3 class="modal-title">{{ editingItem ? 'Редактировать позицию' : 'Новая позиция' }}</h3>
                </template>
                <template #body>
                    <MenuItemForm :editing-item="editingItem" :types="types" :tags="tags" :saving="saving"
                        @save="handleSaveItem" @close="closeItemForm" />
                </template>
            </ui-modal-window>

            <!-- Список позиций -->
            <div class="items-section">
                <div class="section-header">
                    <div class="section-title">Позиции меню ({{ items.length }})</div>
                </div>
                <div class="items-grid" v-if="items.length">
                    <ProductCard v-for="item in items" :key="item.id" :item="item" :types="types" @edit="editItem"
                        @delete="deleteItem" />
                </div>
                <div class="empty" v-else>
                    Позиций не найдено
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Multiselect from '@vueform/multiselect'

const { $api } = useNuxtApp()
const config = useRuntimeConfig()

// Состояние
const items = ref([])
const types = ref([])
const tags = ref([])

// Опции для селектов (формат для Multiselect)
const typeSelectOptions = computed(() => {
    return [
        { label: 'Все типы', value: null },
        ...types.value.map(type => ({
            label: type.name,
            value: type.id
        }))
    ]
})

const activeSelectOptions = [
    { label: 'Все', value: null },
    { label: 'Активные', value: 'true' },
    { label: 'Неактивные', value: 'false' }
]
const showItemForm = ref(false)
const showTypesPanel = ref(false)
const showTagsPanel = ref(false)
const showTypeForm = ref(false)
const showTagForm = ref(false)
const editingItem = ref(null)
const saving = ref(false)

// Фильтры
const filters = ref({
    typeId: null,
    active: null,
    tagIds: []
})


const typeForm = ref({
    name: ''
})

const tagForm = ref({
    name: ''
})

// Загрузка данных
const loadTypes = async () => {
    try {
        types.value = await $api.get('/menu/types').then(res => res.data || [])
    } catch (error) {
        console.error('Ошибка загрузки типов:', error)
    }
}

const loadTags = async () => {
    try {
        tags.value = await $api.get('/menu/tags').then(res => res.data || [])
    } catch (error) {
        console.error('Ошибка загрузки тегов:', error)
    }
}

const loadItems = async () => {
    try {
        const params = {}
        if (filters.value.typeId) params.typeId = filters.value.typeId
        if (filters.value.active !== null && filters.value.active !== '') {
            params.active = filters.value.active === 'true' || filters.value.active === true
        }
        if (filters.value.tagIds.length) params.tagIds = filters.value.tagIds.join(',')

        items.value = await $api.get('/menu/items', { params }).then(res => res.data || [])
    } catch (error) {
        console.error('Ошибка загрузки позиций:', error)
    }
}

// Управление типами
const saveType = async () => {
    try {
        if (editingItem.value?.typeId) {
            await $api.put(`/menu/types/${editingItem.value.typeId}`, typeForm.value)
        } else {
            await $api.post('/menu/types', typeForm.value)
        }
        await loadTypes()
        cancelTypeForm()
    } catch (error) {
        console.error('Ошибка сохранения типа:', error)
        alert('Ошибка сохранения типа')
    }
}

const deleteType = async (id) => {
    if (!confirm('Удалить тип?')) return
    try {
        await $api.delete(`/menu/types/${id}`)
        await loadTypes()
        await loadItems()
    } catch (error) {
        console.error('Ошибка удаления типа:', error)
        alert('Ошибка удаления типа')
    }
}

const cancelTypeForm = () => {
    showTypeForm.value = false
    typeForm.value = { name: '' }
    editingItem.value = null
}

// Управление тегами
const saveTag = async () => {
    try {
        if (editingItem.value?.tagId) {
            await $api.put(`/menu/tags/${editingItem.value.tagId}`, tagForm.value)
        } else {
            await $api.post('/menu/tags', tagForm.value)
        }
        await loadTags()
        cancelTagForm()
    } catch (error) {
        console.error('Ошибка сохранения тега:', error)
        alert('Ошибка сохранения тега')
    }
}

const deleteTag = async (id) => {
    if (!confirm('Удалить тег?')) return
    try {
        await $api.delete(`/menu/tags/${id}`)
        await loadTags()
        await loadItems()
    } catch (error) {
        console.error('Ошибка удаления тега:', error)
        alert('Ошибка удаления тега')
    }
}

const cancelTagForm = () => {
    showTagForm.value = false
    tagForm.value = { name: '' }
    editingItem.value = null
}

// Управление позициями
const editItem = (item) => {
    editingItem.value = item
    showItemForm.value = true
}

const handleSaveItem = async (formData) => {
    saving.value = true
    try {
        // Формируем JSON объект вместо FormData
        const data = {
            // Обязательные поля
            name: formData.name || '',
            price: formData.price || 0,
            typeIds: formData.typeId ? [formData.typeId] : [],
            // Опциональные поля
            description: formData.description || null,
            discountPrice: formData.discountPrice || null,
            volume: formData.weight || null,
            quantity: formData.quantity !== null && formData.quantity !== undefined ? formData.quantity : null,
            order: formData.order || 0,
            active: formData.active !== undefined ? formData.active : true,
            tagIds: formData.tagIds && formData.tagIds.length ? formData.tagIds : [],
            // URL-ы изображений
            imageOriginal: formData.imageOriginal || null,
            imageThumbnail: formData.imageThumbnail || null
        }

        if (editingItem.value) {
            await $api.put(`/menu/items/${editingItem.value.id}`, data)
        } else {
            await $api.post('/menu/items', data)
        }

        await loadItems()
        closeItemForm()
    } catch (error) {
        console.error('Ошибка сохранения позиции:', error)
        alert('Ошибка сохранения позиции: ' + (error.response?.data?.error || error.message))
    } finally {
        saving.value = false
    }
}

const deleteItem = async (id) => {
    if (!confirm('Удалить позицию?')) return
    try {
        await $api.delete(`/menu/items/${id}`)
        await loadItems()
    } catch (error) {
        console.error('Ошибка удаления позиции:', error)
        alert('Ошибка удаления позиции')
    }
}

const closeItemForm = () => {
    showItemForm.value = false
    editingItem.value = null
}

// Вспомогательные функции

const toggleTagFilter = async (tagId) => {
    const index = filters.value.tagIds.indexOf(tagId)
    if (index > -1) {
        filters.value.tagIds.splice(index, 1)
    } else {
        filters.value.tagIds.push(tagId)
    }
    await loadItems()
}

const handleTypeFilterChange = async () => {
    await loadItems()
}

const handleActiveFilterChange = async () => {
    await loadItems()
}

watch(filters, async () => {
    await loadItems()
}, { deep: true })

onMounted(async () => {
    await loadTypes()
    await loadTags()
    await loadItems()
})

useHead({
    title: 'Меню — Кения',
})
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *

.menu-page
    background-color: var(--main-bg)
    min-height: 100vh

    .header-section
        margin-bottom: 24px
        .header-top
            display: flex
            align-items: center
            gap: 12px
            margin-bottom: 16px
        .h1
            font-size: 24px
            font-weight: 700
            color: var(--text-color)
            margin: 0
        .header-actions
            display: flex
            gap: 12px

    .add-item-btn, .add-btn
        display: flex
        align-items: center
        gap: 8px
        background-color: var(--accent-red)
        color: #fff
        padding: 10px 20px
        font-weight: 600
        font-size: 14px
        border: none
        border-radius: 12px
        cursor: pointer
        transition: all 0.2s ease
        &:hover
            background-color: var(--accent-orange)
            transform: translateY(-1px)
            box-shadow: 0 4px 12px rgba(232, 69, 32, 0.3)
        .btn-text
            color: #fff
        .plus-icon
            mask: url(@/assets/images/icons/plus.svg) no-repeat center
            mask-size: contain
            background-color: #fff
            width: 16px
            height: 16px

    // Фильтры
    .filters-section
        display: flex
        flex-wrap: wrap
        gap: 16px
        margin-bottom: 24px
        padding: 16px
        background-color: #fff
        border: 1px solid var(--border-color)
        border-radius: 12px
        position: relative
        .filter-group
            display: flex
            flex-direction: column
            gap: 8px
            min-width: 150px
            position: relative
            .filter-label
                font-size: 13px
                font-weight: 600
                color: var(--text-color)
                margin-bottom: 8px
        .tags-filter
            display: flex
            flex-wrap: wrap
            gap: 8px
            .tag-filter
                padding: 6px 12px
                background-color: var(--second-bg)
                border: 1px solid var(--border-color)
                border-radius: 20px
                font-size: 12px
                cursor: pointer
                transition: all 0.2s ease
                &:hover
                    border-color: var(--accent-red)
                &_active
                    background-color: rgba(232, 69, 32, 0.1)
                    border-color: var(--accent-red)
                    color: var(--accent-red)
                    font-weight: 600

    // Управление
    .management-section
        display: flex
        gap: 12px
        margin-bottom: 24px
        position: relative
        z-index: 0
        .manage-btn
            padding: 10px 20px
            background-color: #fff
            border: 1px solid var(--border-color)
            border-radius: 12px
            font-size: 14px
            font-weight: 500
            cursor: pointer
            transition: all 0.2s ease
            &:hover
                border-color: var(--accent-red)
                color: var(--accent-red)

    // Панели
    .panel
        background-color: #fff
        border: 1px solid var(--border-color)
        border-radius: 12px
        padding: 20px
        margin-bottom: 24px
        .panel-header
            display: flex
            justify-content: space-between
            align-items: center
            margin-bottom: 16px
            .panel-title
                font-size: 18px
                font-weight: 700
                color: var(--text-color)
                margin: 0
            .close-panel-btn
                background: none
                border: none
                cursor: pointer
                padding: 6px
                border-radius: 6px
                transition: all 0.2s ease
                &:hover
                    background-color: var(--second-bg)
                .close-icon
                    width: 18px
                    height: 18px
        .type-form, .tag-form
            display: flex
            flex-direction: column
            gap: 12px
            margin-bottom: 16px
            padding: 16px
            background-color: var(--second-bg)
            border-radius: 8px
            .input
                padding: 10px 14px
                border: 1px solid var(--border-color)
                border-radius: 8px
                font-size: 14px
                &:focus
                    outline: none
                    border-color: var(--accent-red)
            .form-actions
                display: flex
                gap: 12px
                justify-content: flex-end
                padding-top: 16px
                border-top: 1px solid var(--border-color)
                .save-btn
                    padding: 12px 24px
                    background-color: var(--accent-red)
                    color: #fff
                    border: none
                    border-radius: 8px
                    font-size: 14px
                    font-weight: 600
                    cursor: pointer
                    transition: all 0.2s ease
                    &:hover:not(:disabled)
                        background-color: var(--accent-orange)
                        transform: translateY(-1px)
                        box-shadow: 0 4px 12px rgba(232, 69, 32, 0.3)
                    &:disabled
                        opacity: 0.6
                        cursor: not-allowed
                .cancel-btn
                    padding: 12px 24px
                    background-color: var(--second-bg)
                    color: var(--text-color)
                    border: 1px solid var(--border-color)
                    border-radius: 8px
                    font-size: 14px
                    font-weight: 600
                    cursor: pointer
                    transition: all 0.2s ease
                    &:hover
                        border-color: var(--accent-red)
                        background-color: rgba(232, 69, 32, 0.05)
        .items-list
            display: flex
            flex-direction: column
            gap: 10px
            .item-card
                display: flex
                justify-content: space-between
                align-items: center
                padding: 12px 16px
                background-color: var(--second-bg)
                border: 1px solid var(--border-color)
                border-radius: 8px
                .item-name
                    font-size: 14px
                    font-weight: 500
                    color: var(--text-color)
                .delete-btn
                    background: none
                    border: none
                    cursor: pointer
                    padding: 4px
                    border-radius: 4px
                    transition: all 0.2s ease
                    &:hover
                        background-color: rgba(232, 69, 32, 0.1)
                    .delete-icon
                        width: 16px
                        height: 16px

    // Список позиций
    .items-section
        position: relative
        z-index: 0
        .section-header
            margin-bottom: 16px
            .section-title
                font-size: 18px
                font-weight: 700
                color: var(--text-color)
    .items-grid
        display: grid
        grid-template-columns: repeat(4, 1fr)
        gap: 20px
    .empty
        text-align: center
        padding: 60px 20px
        color: var(--text-secondary)
        font-size: 14px

@media only screen and (min-width: $bp-tablet)
    .menu-page
        .header-section
            .h1
                font-size: 28px
        .items-grid
            grid-template-columns: repeat(4, 1fr)

@media only screen and (min-width: $bp-pc)
    .menu-page
        .header-section
            .h1
                font-size: 32px
        .add-item-btn, .add-btn
            font-size: 16px
            padding: 12px 24px
        .filters-section
            .filter-group
                .filter-label
                    font-size: 15px
                .tags-filter
                    .tag-filter
                        font-size: 14px
        .management-section
            .manage-btn
                font-size: 16px
        .panel
            .panel-header
                .panel-title
                    font-size: 20px
            .type-form, .tag-form
                .input
                    font-size: 16px
            .items-list
                .item-card
                    .item-name
                        font-size: 16px
        .items-section
            .section-header
                .section-title
                    font-size: 20px
        .items-grid
            grid-template-columns: repeat(4, 1fr)

@media only screen and (min-width: $bp-large)
    .menu-page
        .header-section
            .h1
                font-size: 32px
        .items-grid
            grid-template-columns: repeat(4, 1fr)
</style>