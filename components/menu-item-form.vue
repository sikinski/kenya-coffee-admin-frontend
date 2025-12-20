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
                <label class="form-label">Изображения</label>
                <div class="images-upload">
                    <input type="file" ref="imageInput" @change="handleImageSelect" accept="image/*" multiple
                        class="file-input" />
                    <button type="button" class="upload-btn" @click="$refs.imageInput.click()"
                        :disabled="uploadingImage">
                        <span class="upload-icon"></span>
                        {{ uploadingImage ? 'Загрузка...' : 'Добавить изображения' }}
                    </button>
                    <div class="images-list" v-if="formData.images && formData.images.length">
                        <div v-for="(image, index) in formData.images" :key="index" class="image-item"
                            :class="{ 'image-item_main': index === 0 }" draggable="true"
                            @dragstart="handleDragStart(index, $event)" @dragover.prevent="handleDragOver($event)"
                            @drop="handleDrop(index, $event)" @dragend="handleDragEnd">
                            <div class="image-preview-wrapper">
                                <img :src="getImageUrl(image.imageThumbnail || image.thumbnail)" alt=""
                                    class="preview-img" />
                                <div class="image-overlay">
                                    <span class="image-badge" v-if="index === 0">Главное</span>
                                    <button type="button" class="remove-image-btn" @click="removeImage(index)">
                                        <img src="@/assets/images/icons/close-round.svg" alt="" class="remove-icon">
                                    </button>
                                </div>
                            </div>
                        </div>
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
import { getImageUrl } from '@/utils/getImageUrl'

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

// Отдельный ref для volume для лучшей реактивности с Multiselect
const selectedVolumes = ref([])

// Тип цены: 'from', 'to', 'fixed'
const priceType = ref('fixed')

// Данные формы
const formData = ref({
    name: '',
    description: '',
    price: { from: null, to: null },
    discountPrice: null,
    volume: [],
    typeId: null,
    quantity: null,
    order: 0,
    active: true,
    tagIds: [],
    images: [] // Массив объектов { imageOrg, imageThumbnail }
})

// Для drag & drop
const draggedIndex = ref(null)
const dragOverIndex = ref(null)

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

// Синхронизируем selectedVolumes с formData.volume
watch(selectedVolumes, (newVolumes) => {
    formData.value.volume = Array.isArray(newVolumes) ? [...newVolumes] : []
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
        volume: [],
        typeId: null,
        quantity: null,
        order: 0,
        active: true,
        tagIds: [],
        images: []
    }
}

// Заполнение формы при редактировании
watch(() => props.editingItem, (item) => {
    if (item) {
        // Обрабатываем объемы: если это массив - используем его, если строка - преобразуем в массив
        let volumes = []
        if (item.volume && Array.isArray(item.volume)) {
            volumes = item.volume
        } else if (item.volume && typeof item.volume === 'string') {
            volumes = [item.volume]
        } else if (item.volumes && Array.isArray(item.volumes)) {
            // Для обратной совместимости
            volumes = item.volumes
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

        // Обрабатываем изображения: если это массив - используем его, если старый формат - преобразуем
        let images = []
        if (item.images && Array.isArray(item.images)) {
            images = item.images
        } else if (item.imageOrg || item.imageThumbnail) {
            // Старый формат - преобразуем в массив
            images = [{
                imageOrg: item.imageOrg || null,
                imageThumbnail: item.imageThumbnail || null
            }]
        }

        selectedVolumes.value = volumes
        formData.value = {
            name: item.name,
            description: item.description || '',
            price: price,
            discountPrice: item.discountPrice || null,
            volume: volumes,
            typeId: item.types?.[0]?.id || item.typeId || null,
            quantity: item.quantity || null,
            order: item.order || 0,
            active: item.active !== undefined ? item.active : true,
            tagIds: item.tags?.map(t => t.id) || [],
            images: images
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
    formData.value.volume = [...selectedVolumes.value]
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
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    uploadingImage.value = true
    try {
        // Загружаем все выбранные файлы
        const uploadPromises = files.map(async (file) => {
            const imageData = new FormData()
            imageData.append('image', file)

            const response = await $api.post('/images', imageData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (response.data) {
                return {
                    imageOrg: response.data.original,
                    imageThumbnail: response.data.thumbnail
                }
            }
            return null
        })

        const uploadedImages = await Promise.all(uploadPromises)
        const validImages = uploadedImages.filter(img => img !== null)

        // Добавляем новые изображения в массив
        formData.value.images = [...formData.value.images, ...validImages]
    } catch (error) {
        console.error('Ошибка загрузки изображений:', error)
        alert('Ошибка загрузки изображений: ' + (error.response?.data?.error || error.message))
    } finally {
        uploadingImage.value = false
        if (imageInput.value) {
            imageInput.value.value = ''
        }
    }
}

const removeImage = (index) => {
    formData.value.images.splice(index, 1)
}

// Drag & Drop функции
const handleDragStart = (index, event) => {
    draggedIndex.value = index
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', event.target)
    event.target.style.opacity = '0.5'
}

const handleDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
}

const handleDrop = async (dropIndex, event) => {
    event.preventDefault()

    if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
        draggedIndex.value = null
        return
    }

    // Перемещаем элемент в массиве
    const images = [...formData.value.images]
    const draggedImage = images[draggedIndex.value]
    images.splice(draggedIndex.value, 1)
    images.splice(dropIndex, 0, draggedImage)

    formData.value.images = images
    draggedIndex.value = null
    dragOverIndex.value = null

    // Отправляем новый порядок на сервер, если редактируем существующую позицию
    if (props.editingItem && props.editingItem.id) {
        try {
            // Формируем массив с порядком изображений (используем индексы или id, если есть)
            const imageOrder = images.map((img, index) => ({
                id: img.id || null,
                order: index
            }))

            await $api.put(`/menu/items/${props.editingItem.id}/images/order`, {
                images: imageOrder
            })
        } catch (error) {
            console.error('Ошибка обновления порядка изображений:', error)
            // Не показываем ошибку пользователю, так как это не критично
        }
    }
}

const handleDragEnd = (event) => {
    event.target.style.opacity = '1'
    draggedIndex.value = null
    dragOverIndex.value = null
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
        grid-template-columns: 1fr
        gap: 12px
        margin-bottom: 20px
        .form-group
            display: flex
            flex-direction: column
            gap: 6px
            position: relative
            &-full
                grid-column: 1 / -1
            .form-label
                font-size: 12px
                font-weight: 600
                color: var(--text-color)
            .input
                padding: 10px 12px
                border: 1px solid var(--border-color)
                border-radius: 8px
                font-size: 13px
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
                gap: 6px
                .price-type-buttons
                    display: flex
                    gap: 6px
                    .price-type-btn
                        flex: 1
                        padding: 8px 10px
                        background-color: var(--second-bg)
                        border: 1px solid var(--border-color)
                        border-radius: 8px
                        font-size: 12px
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
                gap: 6px
                .tag-select, .volume-select
                    display: inline-flex
                    align-items: center
                    gap: 4px
                    padding: 6px 12px
                    background-color: var(--second-bg)
                    border: 2px solid var(--border-color)
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
            .images-upload
                display: flex
                flex-direction: column
                gap: 10px
                .file-input
                    display: none
                .upload-btn
                    display: flex
                    align-items: center
                    gap: 6px
                    padding: 10px 16px
                    background-color: var(--second-bg)
                    border: 1px solid var(--border-color)
                    border-radius: 8px
                    font-size: 13px
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
                        width: 14px
                        height: 14px
                .images-list
                    display: grid
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr))
                    gap: 10px
                    .image-item
                        position: relative
                        cursor: move
                        transition: all 0.2s ease
                        &.image-item_main
                            .image-preview-wrapper
                                border: 2px solid var(--accent-red)
                        &:hover
                            transform: translateY(-2px)
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)
                        .image-preview-wrapper
                            position: relative
                            width: 100%
                            aspect-ratio: 1
                            border: 1px solid var(--border-color)
                            border-radius: 8px
                            overflow: hidden
                            background-color: var(--second-bg)
                            .preview-img
                                width: 100%
                                height: 100%
                                object-fit: cover
                            .image-overlay
                                position: absolute
                                top: 0
                                left: 0
                                right: 0
                                bottom: 0
                                background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, transparent 30%)
                                opacity: 0
                                transition: opacity 0.2s ease
                                display: flex
                                align-items: flex-start
                                justify-content: space-between
                                padding: 6px
                                .image-badge
                                    background-color: var(--accent-red)
                                    color: #fff
                                    padding: 3px 6px
                                    border-radius: 4px
                                    font-size: 10px
                                    font-weight: 600
                                .remove-image-btn
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
                                        width: 10px
                                        height: 10px
                        &:hover .image-overlay
                            opacity: 1
            .checkbox-label
                display: flex
                align-items: center
                gap: 6px
                cursor: pointer
                .checkbox-input
                    width: 16px
                    height: 16px
                    cursor: pointer
                .checkbox-text
                    font-size: 13px
                    color: var(--text-color)
    .form-actions
        display: flex
        flex-direction: column
        gap: 10px
        padding-top: 16px
        border-top: 1px solid var(--border-color)
        .save-btn, .cancel-btn
            width: 100%
            padding: 12px 20px
            border-radius: 8px
            font-size: 14px
            font-weight: 600
            cursor: pointer
            transition: all 0.2s ease
        .save-btn
            background-color: var(--accent-red)
            color: #fff
            border: none
            &:hover:not(:disabled)
                background-color: var(--accent-orange)
                transform: translateY(-1px)
                box-shadow: 0 4px 12px rgba(232, 69, 32, 0.3)
            &:disabled
                opacity: 0.6
                cursor: not-allowed
        .cancel-btn
            background-color: var(--second-bg)
            color: var(--text-color)
            border: 1px solid var(--border-color)
            &:hover
                border-color: var(--accent-red)
                background-color: rgba(232, 69, 32, 0.05)

// Tablet styles (min-width: 600px)
@media only screen and (min-width: $bp-tablet)
    .item-form
        .form-grid
            gap: 14px
            margin-bottom: 22px
            .form-group
                gap: 8px
                .form-label
                    font-size: 13px
                .input
                    padding: 12px 14px
                    font-size: 14px
                .price-selector
                    gap: 8px
                    .price-type-buttons
                        gap: 8px
                        .price-type-btn
                            padding: 8px 12px
                            font-size: 13px
                .tags-select, .volumes-select
                    gap: 8px
                    .tag-select, .volume-select
                        gap: 6px
                        padding: 8px 14px
                        font-size: 13px
                        .tag-icon
                            width: 14px
                            height: 14px
                .images-upload
                    gap: 12px
                    .upload-btn
                        gap: 8px
                        padding: 12px 20px
                        font-size: 14px
                        .upload-icon
                            width: 16px
                            height: 16px
                    .images-list
                        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr))
                        gap: 12px
                        .image-item
                            .image-preview-wrapper
                                .image-overlay
                                    padding: 8px
                                    .image-badge
                                        padding: 4px 8px
                                        font-size: 11px
                                    .remove-image-btn
                                        width: 24px
                                        height: 24px
                                        .remove-icon
                                            width: 12px
                                            height: 12px
                .checkbox-label
                    gap: 8px
                    .checkbox-input
                        width: 18px
                        height: 18px
                    .checkbox-text
                        font-size: 14px
        .form-actions
            flex-direction: row
            gap: 12px
            justify-content: flex-end
            .save-btn, .cancel-btn
                width: auto
                padding: 12px 24px

// PC styles (min-width: 1200px)
@media only screen and (min-width: $bp-pc)
    .item-form
        .form-grid
            grid-template-columns: repeat(2, 1fr)
            gap: 16px
            margin-bottom: 24px
</style>
