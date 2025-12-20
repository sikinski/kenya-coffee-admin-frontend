<template>
    <div class="menu-page page-padding">
        <div class="content">
            <div class="header-section">
                <div class="h1-wrapper">
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
                            :class="{ 'tag-filter_active': filters.tagIds.includes(tag.id) }" :style="getTagStyle(tag)"
                            @click="toggleTagFilter(tag.id)">
                            <img v-if="tag.icon" :src="tag.icon" alt="" class="tag-icon" />
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
                <button class="add-btn" @click="showTypeForm = true" v-if="!showTypeForm && !editingType">
                    <span class="btn-text">Добавить тип</span>
                    <span class="plus-icon"></span>
                </button>
                <form v-if="showTypeForm" class="type-form" @submit.prevent="saveType">
                    <input type="text" class="input" v-model="typeForm.name" placeholder="Название типа" required />
                    <div class="icon-upload">
                        <label class="icon-label">Иконка (только SVG)</label>
                        <input type="file" ref="iconInput" @change="handleIconSelect" accept=".svg,image/svg+xml"
                            class="file-input" />
                        <button type="button" class="upload-btn" @click="$refs.iconInput.click()"
                            :disabled="uploadingIcon">
                            <span class="upload-icon"></span>
                            {{ uploadingIcon ? 'Загрузка...' : (typeForm.icon ? 'Изменить иконку' : 'Выбрать иконку') }}
                        </button>
                        <div class="icon-preview" v-if="typeForm.icon">
                            <img :src="typeForm.icon" alt="Иконка типа" class="preview-icon" />
                            <button type="button" class="remove-icon-btn" @click="removeIcon">
                                <img src="@/assets/images/icons/close-round.svg" alt="" class="remove-icon">
                            </button>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="save-btn">Сохранить</button>
                        <button type="button" class="cancel-btn" @click="cancelTypeForm">Отмена</button>
                    </div>
                </form>
                <div class="items-list">
                    <div class="item-card" v-for="type in types" :key="type.id">
                        <div class="item-content">
                            <img v-if="type.icon" :src="type.icon" alt="" class="type-icon" />
                            <span class="item-name">{{ type.name }}</span>
                        </div>
                        <div class="item-actions">
                            <button class="edit-btn" @click="editType(type)" title="Редактировать">
                                <img src="@/assets/images/icons/pencil.svg" alt="" class="action-icon">
                            </button>
                            <button class="delete-btn" @click="deleteType(type.id)" title="Удалить">
                                <img src="@/assets/images/icons/close-round.svg" alt="" class="delete-icon">
                            </button>
                        </div>
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
                <button class="add-btn" @click="showTagForm = true" v-if="!showTagForm && !editingTag">
                    <span class="btn-text">Добавить тег</span>
                    <span class="plus-icon"></span>
                </button>
                <form v-if="showTagForm" class="tag-form" @submit.prevent="saveTag">
                    <input type="text" class="input" v-model="tagForm.name" placeholder="Название тега" required />
                    <div class="icon-upload">
                        <label class="icon-label">Иконка (только SVG, необязательно)</label>
                        <input type="file" ref="tagIconInput" @change="handleTagIconSelect" accept=".svg,image/svg+xml"
                            class="file-input" />
                        <button type="button" class="upload-btn" @click="$refs.tagIconInput.click()"
                            :disabled="uploadingTagIcon">
                            <span class="upload-icon"></span>
                            {{ uploadingTagIcon ? 'Загрузка...' : (tagForm.icon ? 'Изменить иконку' : 'Выбрать иконку')
                            }}
                        </button>
                        <div class="icon-preview" v-if="tagForm.icon">
                            <img :src="tagForm.icon" alt="Иконка тега" class="preview-icon" />
                            <button type="button" class="remove-icon-btn" @click="removeTagIcon">
                                <img src="@/assets/images/icons/close-round.svg" alt="" class="remove-icon">
                            </button>
                        </div>
                    </div>
                    <div class="color-select">
                        <label class="color-label">Цвет фона (необязательно)</label>
                        <div class="colors-grid">
                            <button type="button" class="color-btn"
                                :class="{ 'color-btn_active': tagForm.color === null, 'color-btn_none': true }"
                                @click="tagForm.color = null" title="Без цвета">
                                <span class="color-none-icon">×</span>
                            </button>
                            <button type="button" class="color-btn" v-for="color in tagColors" :key="color"
                                :style="{ backgroundColor: color }"
                                :class="{ 'color-btn_active': tagForm.color === color }" @click="tagForm.color = color"
                                :title="color"></button>
                        </div>
                        <div class="color-preview" v-if="tagForm.color">
                            <span class="preview-tag" :style="{
                                backgroundColor: tagForm.color,
                                color: shouldUseWhiteText(tagForm.color) ? '#fff' : 'var(--text-color)'
                            }">
                                <img v-if="tagForm.icon" :src="tagForm.icon" alt="" class="preview-tag-icon" />
                                {{ tagForm.name || 'Пример тега' }}
                            </span>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="save-btn">Сохранить</button>
                        <button type="button" class="cancel-btn" @click="cancelTagForm">Отмена</button>
                    </div>
                </form>
                <div class="items-list">
                    <div class="item-card" v-for="tag in tags" :key="tag.id">
                        <div class="item-content">
                            <span class="item-tag-preview" :style="getTagStyle(tag)">
                                <img v-if="tag.icon" :src="tag.icon" alt="" class="tag-icon-small" />
                                {{ tag.name }}
                            </span>
                        </div>
                        <div class="item-actions">
                            <button class="edit-btn" @click="editTag(tag)" title="Редактировать">
                                <img src="@/assets/images/icons/pencil.svg" alt="" class="action-icon">
                            </button>
                            <button class="delete-btn" @click="deleteTag(tag.id)" title="Удалить">
                                <img src="@/assets/images/icons/close-round.svg" alt="" class="delete-icon">
                            </button>
                        </div>
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
import { ALL_TAG_COLORS, shouldUseWhiteText } from '@/helpers/tagColors'

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
    name: '',
    icon: null
})

const editingType = ref(null)
const uploadingIcon = ref(false)
const iconInput = ref(null)

const tagForm = ref({
    name: '',
    color: null,
    icon: null
})

const editingTag = ref(null)
const tagColors = ALL_TAG_COLORS
const uploadingTagIcon = ref(false)
const tagIconInput = ref(null)

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

// Преобразование файла в data URI
const fileToDataURI = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

// Обработка выбора иконки
const handleIconSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Проверяем, что файл - SVG
    const isValidSVG = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
    if (!isValidSVG) {
        alert('Пожалуйста, выберите файл в формате SVG')
        if (iconInput.value) {
            iconInput.value.value = ''
        }
        return
    }

    uploadingIcon.value = true
    try {
        const dataURI = await fileToDataURI(file)
        // Убеждаемся, что data URI содержит правильный MIME тип для SVG
        if (!dataURI.startsWith('data:image/svg+xml')) {
            // Если MIME тип не указан или неправильный, исправляем его
            const base64Data = dataURI.split(',')[1]
            typeForm.value.icon = `data:image/svg+xml;base64,${base64Data}`
        } else {
            typeForm.value.icon = dataURI
        }
    } catch (error) {
        console.error('Ошибка загрузки иконки:', error)
        alert('Ошибка загрузки иконки: ' + (error.message || 'Неизвестная ошибка'))
    } finally {
        uploadingIcon.value = false
        if (iconInput.value) {
            iconInput.value.value = ''
        }
    }
}

// Удаление иконки
const removeIcon = () => {
    typeForm.value.icon = null
    if (iconInput.value) {
        iconInput.value.value = ''
    }
}

// Обработка выбора иконки для тега
const handleTagIconSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Проверяем, что файл - SVG
    const isValidSVG = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
    if (!isValidSVG) {
        alert('Пожалуйста, выберите файл в формате SVG')
        if (tagIconInput.value) {
            tagIconInput.value.value = ''
        }
        return
    }

    uploadingTagIcon.value = true
    try {
        const dataURI = await fileToDataURI(file)
        // Убеждаемся, что data URI содержит правильный MIME тип для SVG
        if (!dataURI.startsWith('data:image/svg+xml')) {
            // Если MIME тип не указан или неправильный, исправляем его
            const base64Data = dataURI.split(',')[1]
            tagForm.value.icon = `data:image/svg+xml;base64,${base64Data}`
        } else {
            tagForm.value.icon = dataURI
        }
    } catch (error) {
        console.error('Ошибка загрузки иконки тега:', error)
        alert('Ошибка загрузки иконки тега: ' + (error.message || 'Неизвестная ошибка'))
    } finally {
        uploadingTagIcon.value = false
        if (tagIconInput.value) {
            tagIconInput.value.value = ''
        }
    }
}

// Удаление иконки тега
const removeTagIcon = () => {
    tagForm.value.icon = null
    if (tagIconInput.value) {
        tagIconInput.value.value = ''
    }
}

// Управление типами
const saveType = async () => {
    try {
        const data = {
            name: typeForm.value.name
        }

        // Иконка необязательна - добавляем только если она есть
        // При обновлении типа можно отправить null, чтобы удалить иконку
        if (editingType.value) {
            // При обновлении отправляем icon явно (null если удалена, или значение если есть)
            data.icon = typeForm.value.icon || null
        } else {
            // При создании добавляем иконку только если она есть
            if (typeForm.value.icon) {
                data.icon = typeForm.value.icon
            }
        }

        if (editingType.value) {
            await $api.put(`/menu/types/${editingType.value.id}`, data)
        } else {
            await $api.post('/menu/types', data)
        }
        await loadTypes()
        cancelTypeForm()
    } catch (error) {
        console.error('Ошибка сохранения типа:', error)
        alert('Ошибка сохранения типа: ' + (error.response?.data?.error || error.message))
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
    typeForm.value = { name: '', icon: null }
    editingType.value = null
    if (iconInput.value) {
        iconInput.value.value = ''
    }
}

// Редактирование типа
const editType = (type) => {
    editingType.value = type
    typeForm.value = {
        name: type.name,
        icon: type.icon || null
    }
    showTypeForm.value = true
}

// Управление тегами
const saveTag = async () => {
    try {
        const data = {
            name: tagForm.value.name
        }

        // Иконка необязательна - добавляем только если она есть
        if (editingTag.value) {
            // При обновлении отправляем icon явно (null если удалена, или значение если есть)
            data.icon = tagForm.value.icon || null
        } else {
            // При создании добавляем иконку только если она есть
            if (tagForm.value.icon) {
                data.icon = tagForm.value.icon
            }
        }

        // Цвет необязателен - добавляем только если он выбран
        if (tagForm.value.color) {
            data.color = tagForm.value.color
        } else if (editingTag.value) {
            // При обновлении можно удалить цвет, отправив null
            data.color = null
        }

        if (editingTag.value) {
            await $api.put(`/menu/tags/${editingTag.value.id}`, data)
        } else {
            await $api.post('/menu/tags', data)
        }
        await loadTags()
        cancelTagForm()
    } catch (error) {
        console.error('Ошибка сохранения тега:', error)
        alert('Ошибка сохранения тега: ' + (error.response?.data?.error || error.message))
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
    tagForm.value = { name: '', color: null, icon: null }
    editingTag.value = null
    if (tagIconInput.value) {
        tagIconInput.value.value = ''
    }
}

// Редактирование тега
const editTag = (tag) => {
    editingTag.value = tag
    tagForm.value = {
        name: tag.name,
        color: tag.color || null,
        icon: tag.icon || null
    }
    showTagForm.value = true
}

// Получение стиля для тега с учетом цвета текста
const getTagStyle = (tag) => {
    if (!tag.color) return {}
    return {
        backgroundColor: tag.color,
        color: shouldUseWhiteText(tag.color) ? '#fff' : 'var(--text-color)'
    }
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
            price: formData.price || { from: null, to: null },
            typeIds: formData.typeId ? [formData.typeId] : [],
            // Опциональные поля
            description: formData.description || null,
            discountPrice: formData.discountPrice || null,
            volumes: formData.volumes && formData.volumes.length ? formData.volumes : [],
            quantity: formData.quantity !== null && formData.quantity !== undefined ? formData.quantity : null,
            order: formData.order || 0,
            active: formData.active !== undefined ? formData.active : true,
            tagIds: formData.tagIds && formData.tagIds.length ? formData.tagIds : [],
            // Массив изображений
            images: formData.images && formData.images.length ? formData.images : []
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

    .header-section
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
                display: inline-flex
                align-items: center
                gap: 6px
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
                .tag-icon
                    width: 12px
                    height: 12px
                    object-fit: contain

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
            .color-select
                display: flex
                flex-direction: column
                gap: 8px
                .color-label
                    font-size: 13px
                    font-weight: 600
                    color: var(--text-color)
                .colors-grid
                    display: grid
                    grid-template-columns: repeat(8, 1fr)
                    gap: 8px
                    .color-btn
                        width: 32px
                        height: 32px
                        border: 2px solid var(--border-color)
                        border-radius: 6px
                        cursor: pointer
                        transition: all 0.2s ease
                        padding: 0
                        background: #fff
                        display: flex
                        align-items: center
                        justify-content: center
                        &:hover
                            border-color: var(--accent-red)
                            transform: scale(1.1)
                        &_active
                            border-color: var(--accent-red)
                            border-width: 3px
                            box-shadow: 0 0 0 2px rgba(232, 69, 32, 0.2)
                        &_none
                            background-color: var(--second-bg)
                            .color-none-icon
                                font-size: 20px
                                color: var(--text-secondary)
                                font-weight: 300
                .color-preview
                    margin-top: 8px
                    .preview-tag
                        display: inline-flex
                        align-items: center
                        gap: 6px
                        padding: 6px 12px
                        border-radius: 12px
                        font-size: 12px
                        font-weight: 500
                        color: var(--text-color)
                        border: 1px solid var(--border-color)
                        .preview-tag-icon
                            width: 14px
                            height: 14px
                            object-fit: contain
            .icon-upload
                display: flex
                flex-direction: column
                gap: 8px
                .icon-label
                    font-size: 13px
                    font-weight: 600
                    color: var(--text-color)
                .file-input
                    display: none
                .upload-btn
                    display: flex
                    align-items: center
                    gap: 8px
                    padding: 10px 16px
                    background-color: #fff
                    border: 1px solid var(--border-color)
                    border-radius: 8px
                    font-size: 14px
                    cursor: pointer
                    transition: all 0.2s ease
                    &:hover:not(:disabled)
                        border-color: var(--accent-red)
                        background-color: rgba(232, 69, 32, 0.05)
                    &:disabled
                        opacity: 0.6
                        cursor: not-allowed
                    .upload-icon
                        mask: url(@/assets/images/icons/plus.svg) no-repeat center
                        mask-size: contain
                        background-color: var(--accent-red)
                        width: 16px
                        height: 16px
                .icon-preview
                    position: relative
                    width: 48px
                    height: 48px
                    border: 1px solid var(--border-color)
                    border-radius: 8px
                    overflow: hidden
                    background-color: #fff
                    .preview-icon
                        width: 100%
                        height: 100%
                        object-fit: contain
                    .remove-icon-btn
                        position: absolute
                        top: 4px
                        right: 4px
                        background-color: rgba(0, 0, 0, 0.6)
                        border: none
                        border-radius: 50%
                        width: 20px
                        height: 20px
                        display: flex
                        align-items: center
                        justify-content: center
                        cursor: pointer
                        transition: all 0.2s ease
                        &:hover
                            background-color: rgba(0, 0, 0, 0.8)
                        .remove-icon
                            width: 12px
                            height: 12px
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
                .item-content
                    display: flex
                    align-items: center
                    gap: 10px
                    flex: 1
                    .type-icon
                        width: 24px
                        height: 24px
                        object-fit: contain
                    .item-name
                        font-size: 14px
                        font-weight: 500
                        color: var(--text-color)
                    .item-tag-preview
                        display: inline-flex
                        align-items: center
                        gap: 6px
                        padding: 4px 10px
                        border-radius: 12px
                        font-size: 12px
                        font-weight: 500
                        color: var(--text-color)
                        border: 1px solid var(--border-color)
                        .tag-icon-small
                            width: 14px
                            height: 14px
                            object-fit: contain
                .item-actions
                    display: flex
                    gap: 8px
                    align-items: center
                .edit-btn, .delete-btn
                    background: none
                    border: none
                    cursor: pointer
                    padding: 4px
                    border-radius: 4px
                    transition: all 0.2s ease
                    &:hover
                        background-color: rgba(232, 69, 32, 0.1)
                    .action-icon, .delete-icon
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
        color: var(--text-secondary)
        font-size: 14px

@media only screen and (min-width: $bp-tablet)
    .menu-page
        .items-grid
            grid-template-columns: repeat(4, 1fr)

@media only screen and (min-width: $bp-pc)
    .menu-page
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
        .items-grid
            grid-template-columns: repeat(4, 1fr)
</style>