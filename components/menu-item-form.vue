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
                <div class="price-selector">
                    <div class="price-type-buttons">
                        <button type="button" class="price-type-btn"
                            :class="{ 'price-type-btn_active': priceType === 'from' }" @click="priceType = 'from'">
                            От
                        </button>
                        <button type="button" class="price-type-btn"
                            :class="{ 'price-type-btn_active': priceType === 'to' }" @click="priceType = 'to'">
                            До
                        </button>
                        <button type="button" class="price-type-btn"
                            :class="{ 'price-type-btn_active': priceType === 'fixed' }" @click="priceType = 'fixed'">
                            Сброс
                        </button>
                    </div>
                    <input type="number" class="input" v-model.number="currentPriceValue" step="0.01" required
                        :placeholder="getPricePlaceholder()" />
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Цена со скидкой (₽)</label>
                <input type="number" class="input" v-model.number="formData.discountPrice" step="0.01" />
            </div>

            <div class="form-group form-group-full">
                <label class="form-label">Объем/Вес</label>
                <div class="volumes-select">
                    <span class="volume-select" v-for="volume in volumeOptions" :key="volume"
                        :class="{ 'volume-select_active': selectedVolumes.includes(volume) }"
                        @click="toggleVolume(volume)">
                        {{ volume }}
                    </span>
                </div>
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
                        :class="{ 'tag-select_active': formData.tagIds.includes(tag.id) }" :style="getTagStyle(tag)"
                        @click="toggleTag(tag.id)">
                        <img v-if="tag.icon" :src="tag.icon" alt="" class="tag-icon" />
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
import { ALL_VOLUME_WEIGHT_OPTIONS } from '@/helpers/volumeOptions'
import { shouldUseWhiteText } from '@/helpers/tagColors'

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

// Опции для выбора объемов/весов - преобразуем в простой массив строк для Multiselect
const volumeOptions = computed(() => {
    return ALL_VOLUME_WEIGHT_OPTIONS.map(opt => opt.value)
})

const { $api } = useNuxtApp()

// Отдельный ref для volumes для лучшей реактивности с Multiselect
const selectedVolumes = ref([])

// Тип цены: 'from', 'to', 'fixed'
const priceType = ref('fixed')

// Данные формы
const formData = ref({
    name: '',
    description: '',
    price: { from: null, to: null },
    discountPrice: null,
    volumes: [],
    typeId: null,
    quantity: null,
    order: 0,
    active: true,
    tagIds: [],
    image: null,
    imageOriginal: null,
    imageThumbnail: null
})

// Текущее значение цены для инпута
const currentPriceValue = ref(0)

// Получение плейсхолдера для инпута цены
const getPricePlaceholder = () => {
    if (priceType.value === 'from') return 'Цена от...'
    if (priceType.value === 'to') return 'Цена до...'
    return 'Цена'
}

// Обновление цены при изменении типа или значения
watch([priceType, currentPriceValue], () => {
    const value = currentPriceValue.value || null

    if (priceType.value === 'from') {
        formData.value.price = { from: value, to: null }
    } else if (priceType.value === 'to') {
        formData.value.price = { from: null, to: value }
    } else {
        // Фиксированная цена - оба поля одинаковые
        formData.value.price = { from: value, to: value }
    }
})

// При изменении типа цены сохраняем текущее значение, если оно есть
watch(priceType, (newType, oldType) => {
    if (oldType !== undefined && currentPriceValue.value) {
        // Значение уже есть, оно сохранится через watch выше
    }
})

// Синхронизируем selectedVolumes с formData.volumes
watch(selectedVolumes, (newVolumes) => {
    formData.value.volumes = Array.isArray(newVolumes) ? [...newVolumes] : []
}, { deep: true })

const resetForm = () => {
    selectedVolumes.value = []
    priceType.value = 'fixed'
    currentPriceValue.value = 0
    formData.value = {
        name: '',
        description: '',
        price: { from: null, to: null },
        discountPrice: null,
        volumes: [],
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
        // Обрабатываем объемы: если это массив - используем его, если строка - преобразуем в массив
        let volumes = []
        if (item.volumes && Array.isArray(item.volumes)) {
            volumes = item.volumes
        } else if (item.volume) {
            volumes = [item.volume]
        } else if (item.weight) {
            volumes = [item.weight]
        }

        // Обрабатываем цену: если это объект - используем его, если число - преобразуем
        let price = { from: null, to: null }
        if (item.price) {
            if (typeof item.price === 'object' && item.price !== null) {
                price = {
                    from: item.price.from ?? null,
                    to: item.price.to ?? null
                }
            } else {
                // Старый формат - фиксированная цена
                const priceValue = item.price
                price = { from: priceValue, to: priceValue }
            }
        }

        // Определяем тип цены
        if (price.from && price.to && price.from === price.to) {
            priceType.value = 'fixed'
            currentPriceValue.value = price.from
        } else if (price.from && !price.to) {
            priceType.value = 'from'
            currentPriceValue.value = price.from
        } else if (!price.from && price.to) {
            priceType.value = 'to'
            currentPriceValue.value = price.to
        } else {
            priceType.value = 'fixed'
            currentPriceValue.value = price.from || price.to || 0
        }

        selectedVolumes.value = volumes
        formData.value = {
            name: item.name,
            description: item.description || '',
            price: price,
            discountPrice: item.discountPrice || null,
            volumes: volumes,
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

const toggleVolume = (volume) => {
    const index = selectedVolumes.value.indexOf(volume)
    if (index > -1) {
        selectedVolumes.value.splice(index, 1)
    } else {
        selectedVolumes.value.push(volume)
    }
    // Синхронизируем с formData
    formData.value.volumes = [...selectedVolumes.value]
}

const getTagStyle = (tag) => {
    if (!tag.color) return {}
    return {
        backgroundColor: tag.color,
        color: shouldUseWhiteText(tag.color) ? '#fff' : 'var(--text-color)'
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
            .price-selector
                display: flex
                flex-direction: column
                gap: 8px
                .price-type-buttons
                    display: flex
                    gap: 8px
                    .price-type-btn
                        flex: 1
                        padding: 8px 12px
                        background-color: var(--second-bg)
                        border: 1px solid var(--border-color)
                        border-radius: 8px
                        font-size: 13px
                        font-weight: 500
                        color: var(--text-color)
                        cursor: pointer
                        transition: all 0.2s ease
                        &:hover
                            border-color: var(--accent-red)
                            background-color: rgba(232, 69, 32, 0.05)
                        &_active
                            background-color: var(--accent-red)
                            border-color: var(--accent-red)
                            color: #fff
                            font-weight: 600
            .tags-select, .volumes-select
                display: flex
                flex-wrap: wrap
                gap: 8px
                .tag-select, .volume-select
                    display: inline-flex
                    align-items: center
                    gap: 6px
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
                    .tag-icon
                        width: 14px
                        height: 14px
                        object-fit: contain
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
