<template>
    <ui-modal-window v-if="visible" @close="$emit('close')">
        <template #title>
            <h3 class="modal-title">{{ item.name }}</h3>
        </template>
        <template #body>
            <div class="product-detail">
                <!-- Левая часть - свайпер изображений -->
                <div class="product-images" v-if="getImages(item).length">
                    <swiper-container class="product-swiper" slides-per-view="1" space-between="0" autoplay="true"
                        pagination="true">
                        <swiper-slide v-for="(image, index) in getImages(item)" :key="index">
                            <img :src="getImageUrl(image.imageOrg || image.imageOriginal || image.original)"
                                :alt="item.name" class="swiper-image" />
                        </swiper-slide>
                    </swiper-container>
                </div>
                <div class="product-images-placeholder" v-else>
                    <div class="placeholder-content">
                        <span>Нет изображений</span>
                    </div>
                </div>

                <!-- Правая часть - информация о продукте -->
                <div class="product-info">
                    <div class="info-section">
                        <h2 class="product-title">{{ item.name }}</h2>

                        <div class="product-meta" v-if="getTypes(item).length || getVolumes(item).length">
                            <template v-if="getTypes(item).length">
                                <span class="info-type" v-for="(type, index) in getTypes(item)" :key="type.id || index">
                                    <img v-if="type.icon" :src="type.icon" alt="" class="type-icon" />
                                    {{ type.name }}
                                </span>
                            </template>
                            <template v-if="getVolumes(item).length">
                                <span class="info-volume" v-for="(volume, index) in getVolumes(item)" :key="index">
                                    {{ getVolumeDisplay(volume) }}
                                </span>
                            </template>
                        </div>

                        <div class="product-description" v-if="item.description" v-html="item.description"></div>

                        <div class="product-tags" v-if="item.tags?.length">
                            <span class="info-tag" v-for="tag in item.tags" :key="tag.id" :style="getTagStyle(tag)">
                                <img v-if="tag.icon" :src="tag.icon" alt="" class="tag-icon" />
                                {{ tag.name }}
                            </span>
                        </div>

                        <div class="product-price-section">
                            <div class="price-main">
                                <span class="price-label">Цена:</span>
                                <span class="price-value" v-if="item.discountPrice">
                                    <span class="price-old">{{ formatPrice(item.price) }}</span>
                                    <span class="price-new">{{ item.discountPrice }} ₽</span>
                                </span>
                                <span class="price-value" v-else>{{ formatPrice(item.price) }}</span>
                            </div>
                        </div>

                        <div class="product-details">
                            <div class="detail-item" v-if="item.quantity !== null && item.quantity !== undefined">
                                <span class="detail-label">Количество:</span>
                                <span class="detail-value">{{ item.quantity }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Статус:</span>
                                <span class="detail-value" :class="{ 'detail-value_active': item.active }">
                                    {{ item.active ? 'Активна' : 'Неактивна' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </ui-modal-window>
</template>

<script setup>
import { shouldUseWhiteText } from '@/helpers/tagColors'
import { getImageUrl } from '@/utils/getImageUrl'
import { findById } from '@/utils/findById'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    item: {
        type: Object,
        required: true
    },
    types: {
        type: Array,
        default: () => []
    }
})

defineEmits(['close'])

const getTypes = (item) => {
    // Если types - массив объектов, возвращаем его
    if (item.types && Array.isArray(item.types) && item.types.length > 0) {
        return item.types
    }
    // Для обратной совместимости: если есть typeId, ищем в props.types
    if (item.typeId) {
        const type = findById(item.typeId, props.types)
        return type ? [type] : []
    }
    return []
}

const getVolumes = (item) => {
    // Если volume - массив объектов или строк, возвращаем его
    if (item.volume && Array.isArray(item.volume) && item.volume.length > 0) {
        return item.volume
    }
    // Для обратной совместимости: если есть volume как строка
    if (item.volume && typeof item.volume === 'string') {
        return [item.volume]
    }
    // Для обратной совместимости: если есть volumes (старый формат)
    if (item.volumes && Array.isArray(item.volumes) && item.volumes.length > 0) {
        return item.volumes
    }
    if (item.weight) {
        return [item.weight]
    }
    return []
}

const getVolumeDisplay = (volume) => {
    // Если volume - объект, извлекаем значение
    if (typeof volume === 'object' && volume !== null) {
        return volume.value || volume.name || volume.label || JSON.stringify(volume)
    }
    // Если volume - строка, возвращаем как есть
    return volume
}

const getImages = (item) => {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        return item.images
    }
    // Для обратной совместимости
    if (item.imageOrg || item.imageOriginal || item.imageThumbnail) {
        return [{
            imageOrg: item.imageOrg || item.imageOriginal || null,
            imageThumbnail: item.imageThumbnail || null
        }]
    }
    return []
}

const getTagStyle = (tag) => {
    if (!tag.color) return {}
    return {
        backgroundColor: tag.color,
        color: shouldUseWhiteText(tag.color) ? '#fff' : 'var(--text-color)'
    }
}

const formatPrice = (price) => {
    if (!price) return '0 ₽'

    if (typeof price === 'object' && price !== null) {
        if (price.from && price.to && price.from === price.to) {
            return `${price.from} ₽`
        } else if (price.from && !price.to) {
            return `от ${price.from} ₽`
        } else if (!price.from && price.to) {
            return `до ${price.to} ₽`
        } else if (price.from && price.to) {
            return `${price.from} - ${price.to} ₽`
        }
    }

    return `${price} ₽`
}
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *

.product-detail
    gap: 32px
    padding: 0
    max-height: calc(90vh - 100px)
    overflow-y: auto
    .product-images
        min-width: 0
        width: 100%
        .product-swiper
            width: 100%
            max-width: 100%
            height: 100%
            min-height: 400px
            border-radius: 12px
            overflow: hidden
            .swiper-image
                width: 100%
                height: 100%
                object-fit: cover
                height: 400px
    .product-images-placeholder
        min-width: 0
        width: 100%
        min-height: 400px
        background-color: var(--second-bg)
        border-radius: 12px
        display: flex
        align-items: center
        justify-content: center
        .placeholder-content
            color: var(--text-secondary)
            font-size: 14px

    .product-info
        display: flex
        flex-direction: column
        gap: 20px
        margin-top: 20px
        overflow-y: auto
        .info-section
            display: flex
            flex-direction: column
            gap: 16px
            .product-title
                font-size: 24px
                font-weight: 700
                color: var(--text-color)
                margin: 0
            .product-meta
                display: flex
                flex-wrap: wrap
                gap: 8px
                align-items: center
                .info-type
                    display: inline-flex
                    align-items: center
                    gap: 6px
                    padding: 6px 12px
                    background-color: rgba(232, 69, 32, 0.1)
                    color: var(--accent-red)
                    border-radius: 12px
                    font-size: 13px
                    font-weight: 600
                    .type-icon
                        width: 16px
                        height: 16px
                        object-fit: contain
                .info-volume
                    padding: 6px 12px
                    background-color: var(--second-bg)
                    color: var(--text-secondary)
                    border-radius: 12px
                    font-size: 13px
            .product-description
                font-size: 14px
                color: var(--text-color)
                line-height: 1.6
                margin-top: 8px
            .product-tags
                display: flex
                flex-wrap: wrap
                gap: 8px
                .info-tag
                    display: inline-flex
                    align-items: center
                    gap: 6px
                    padding: 6px 12px
                    border-radius: 12px
                    font-size: 13px
                    .tag-icon
                        width: 14px
                        height: 14px
                        object-fit: contain
            .product-price-section
                padding: 16px
                background-color: var(--second-bg)
                border-radius: 12px
                .price-main
                    display: flex
                    align-items: center
                    gap: 12px
                    .price-label
                        font-size: 14px
                        font-weight: 600
                        color: var(--text-color)
                    .price-value
                        font-size: 24px
                        font-weight: 700
                        color: var(--accent-red)
                        .price-old
                            font-size: 18px
                            color: var(--text-light)
                            text-decoration: line-through
                            margin-right: 8px
                        .price-new
                            color: var(--accent-red)
            .product-details
                display: flex
                flex-direction: column
                gap: 12px
                padding-top: 16px
                border-top: 1px solid var(--border-color)
                .detail-item
                    display: flex
                    justify-content: space-between
                    align-items: center
                    .detail-label
                        font-size: 14px
                        color: var(--text-secondary)
                    .detail-value
                        font-size: 14px
                        font-weight: 600
                        color: var(--text-color)
                        &_active
                            color: var(--green-color)

@media only screen and (max-width: $bp-tablet)
    .product-detail
        grid-template-columns: 1fr
        gap: 24px
        .product-images
            .product-swiper
                min-height: 300px

@media only screen and (min-width: $bp-tablet-landscape-up)
    .product-detail
        display: grid
        grid-template-columns: 1fr 1fr
        gap: 32px
        padding: 24px
        .product-images,
        .product-images-placeholder
            margin-top: 0
            min-width: 0
            width: 100%
            max-width: 100%
            .product-swiper
                width: 100%
                max-width: 100%
                min-width: 0

        .product-info
            margin-top: 0
            min-width: 0
</style>
