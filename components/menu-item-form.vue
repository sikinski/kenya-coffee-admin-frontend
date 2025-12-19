<template>
    <form class="item-form" @submit.prevent="handleSubmit" enctype="multipart/form-data">
        <div class="form-grid">
            <div class="form-group">
                <label class="form-label">Название *</label>
                <input type="text" class="input" v-model="formData.name" required />
            </div>

            <div class="form-group">
                <label class="form-label">Тип *</label>
                <Multiselect v-model="formData.typeId" :options="typeSelectOptions" :searchable="false"
                    placeholder="Выберите тип" />
            </div>

            <div class="form-group form-group-full">
                <label class="form-label">Описание</label>
                <ui-html-editor v-model="formData.description" placeholder="Введите описание позиции" />
            </div>

            <div class="form-group">
                <label class="form-label">Цена (₽) *</label>
                <input type="number" class="input" v-model.number="formData.price" step="0.01" required />
            </div>

            <div class="form-group">
                <label class="form-label">Цена со скидкой (₽)</label>
                <input type="number" class="input" v-model.number="formData.discountPrice" step="0.01" />
            </div>

            <div class="form-group">
                <label class="form-label">Объем/Вес</label>
                <input type="text" class="input" v-model="formData.weight" placeholder="например: 250 мл" />
            </div>

            <div class="form-group">
                <label class="form-label">Количество</label>
                <input type="number" class="input" v-model.number="formData.quantity" min="0" />
            </div>

            <div class="form-group">
                <label class="form-label">Порядок сортировки</label>
                <input type="number" class="input" v-model.number="formData.order" min="0" />
            </div>

            <div class="form-group form-group-full">
                <label class="form-label">Теги</label>
                <div class="tags-select">
                    <span class="tag-select" v-for="tag in tags" :key="tag.id"
                        :class="{ 'tag-select_active': formData.tagIds.includes(tag.id) }" @click="toggleTag(tag.id)">
                        {{ tag.name }}
                    </span>
                </div>
            </div>

            <div class="form-group form-group-full">
                <label class="form-label">Изображение</label>
                <div class="image-upload">
                    <input type="file" ref="imageInput" @change="handleImageSelect" accept="image/*"
                        class="file-input" />
                    <button type="button" class="upload-btn" @click="$refs.imageInput.click()"
                        :disabled="uploadingImage">
                        <span class="upload-icon"></span>
                        {{ uploadingImage ? 'Загрузка...' : 'Выбрать изображение' }}
                    </button>
                    <div class="image-preview" v-if="formData.imageThumbnail">
                        <img :src="getImageUrl(formData.imageThumbnail)" alt="" class="preview-img" />
                        <button type="button" class="remove-image-btn" @click="removeImage">
                            <img src="@/assets/images/icons/close-round.svg" alt="" class="remove-icon">
                        </button>
                    </div>
                </div>
            </div>

            <div class="form-group form-group-full">
                <label class="checkbox-label">
                    <input type="checkbox" v-model="formData.active" class="checkbox-input" />
                    <span class="checkbox-text">Активна</span>
                </label>
            </div>
        </div>

        <div class="form-actions">
            <button type="submit" class="save-btn" :disabled="saving">
                {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <button type="button" class="cancel-btn" @click="$emit('close')">Отмена</button>
        </div>
    </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Multiselect from '@vueform/multiselect'

const props = defineProps({
    editingItem: {
        type: Object,
        default: null
    },
    types: {
        type: Array,
        required: true
    },
    tags: {
        type: Array,
        required: true
    },
    saving: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['save', 'close'])

const imageInput = ref(null)

// Опции для селекта типов
const typeSelectOptions = computed(() => {
    return props.types.map(type => ({
        label: type.name,
        value: type.id
    }))
})

const { $api } = useNuxtApp()

// Данные формы
const formData = ref({
    name: '',
    description: '',
    price: 0,
    discountPrice: null,
    weight: '',
    typeId: null,
    quantity: null,
    order: 0,
    active: true,
    tagIds: [],
    image: null,
    imageOriginal: null,
    imageThumbnail: null
})

const resetForm = () => {
    formData.value = {
        name: '',
        description: '',
        price: 0,
        discountPrice: null,
        weight: '',
        typeId: null,
        quantity: null,
        order: 0,
        active: true,
        tagIds: [],
        image: null,
        imageOriginal: null,
        imageThumbnail: null
    }
}

// Заполнение формы при редактировании
watch(() => props.editingItem, (item) => {
    if (item) {
        formData.value = {
            name: item.name,
            description: item.description || '',
            price: item.price,
            discountPrice: item.discountPrice || null,
            weight: item.volume || item.weight || '',
            typeId: item.types?.[0]?.id || item.typeId || null,
            quantity: item.quantity || null,
            order: item.order || 0,
            active: item.active !== undefined ? item.active : true,
            tagIds: item.tags?.map(t => t.id) || [],
            image: null,
            imageOriginal: item.imageOriginal || null,
            imageThumbnail: item.imageThumbnail || null
        }
    } else {
        resetForm()
    }
}, { immediate: true })



const toggleTag = (tagId) => {
    const index = formData.value.tagIds.indexOf(tagId)
    if (index > -1) {
        formData.value.tagIds.splice(index, 1)
    } else {
        formData.value.tagIds.push(tagId)
    }
}

const uploadingImage = ref(false)

const handleImageSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    uploadingImage.value = true
    try {
        // Создаем FormData для загрузки изображения
        const imageData = new FormData()
        imageData.append('image', file)

        // Загружаем изображение через POST /images
        const response = await $api.post('/images', imageData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })

        // Сохраняем URL-ы из ответа
        if (response.data) {
            formData.value.imageOriginal = response.data.original
            formData.value.imageThumbnail = response.data.thumbnail
        }
    } catch (error) {
        console.error('Ошибка загрузки изображения:', error)
        alert('Ошибка загрузки изображения: ' + (error.response?.data?.error || error.message))
    } finally {
        uploadingImage.value = false
        if (imageInput.value) {
            imageInput.value.value = ''
        }
    }
}

const removeImage = () => {
    formData.value.image = null
    formData.value.imageOriginal = null
    formData.value.imageThumbnail = null
    if (imageInput.value) {
        imageInput.value.value = ''
    }
}

const handleSubmit = () => {
    emit('save', { ...formData.value })
}
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *

.item-form
    .form-grid
        display: grid
        grid-template-columns: repeat(2, 1fr)
        gap: 16px
        margin-bottom: 24px
        .form-group
            display: flex
            flex-direction: column
            gap: 8px
            position: relative
            &-full
                grid-column: 1 / -1
            .form-label
                font-size: 13px
                font-weight: 600
                color: var(--text-color)
            .input
                padding: 12px 14px
                border: 1px solid var(--border-color)
                border-radius: 8px
                font-size: 14px
                font-family: inherit
                transition: all 0.2s ease
                &:focus
                    outline: none
                    border-color: var(--accent-red)
                &:hover
                    border-color: var(--accent-red)
            .tags-select
                display: flex
                flex-wrap: wrap
                gap: 8px
                .tag-select
                    padding: 8px 14px
                    background-color: var(--second-bg)
                    border: 2px solid var(--border-color)
                    border-radius: 20px
                    font-size: 13px
                    cursor: pointer
                    transition: all 0.2s ease
                    &:hover
                        border-color: var(--accent-red)
                    &_active
                        background-color: rgba(232, 69, 32, 0.1)
                        border-color: var(--accent-red)
                        color: var(--accent-red)
                        font-weight: 600
            .image-upload
                display: flex
                flex-direction: column
                gap: 12px
                .file-input
                    display: none
                .upload-btn
                    display: flex
                    align-items: center
                    gap: 8px
                    padding: 12px 20px
                    background-color: var(--second-bg)
                    border: 1px solid var(--border-color)
                    border-radius: 8px
                    font-size: 14px
                    cursor: pointer
                    transition: all 0.2s ease
                    &:hover
                        border-color: var(--accent-red)
                        background-color: rgba(232, 69, 32, 0.05)
                    .upload-icon
                        mask: url(@/assets/images/icons/plus.svg) no-repeat center
                        mask-size: contain
                        background-color: var(--accent-red)
                        width: 16px
                        height: 16px
                .image-preview
                    position: relative
                    width: 200px
                    height: 200px
                    border: 1px solid var(--border-color)
                    border-radius: 8px
                    overflow: hidden
                    .preview-img
                        width: 100%
                        height: 100%
                        object-fit: cover
                    .remove-image-btn
                        position: absolute
                        top: 8px
                        right: 8px
                        background-color: rgba(0, 0, 0, 0.6)
                        border: none
                        border-radius: 50%
                        width: 28px
                        height: 28px
                        display: flex
                        align-items: center
                        justify-content: center
                        cursor: pointer
                        transition: all 0.2s ease
                        &:hover
                            background-color: rgba(0, 0, 0, 0.8)
                        .remove-icon
                            width: 14px
                            height: 14px
            .checkbox-label
                display: flex
                align-items: center
                gap: 8px
                cursor: pointer
                .checkbox-input
                    width: 18px
                    height: 18px
                    cursor: pointer
                .checkbox-text
                    font-size: 14px
                    color: var(--text-color)
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
</style>
