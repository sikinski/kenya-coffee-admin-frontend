<template>
    <div class="menu-item-card" :class="{ 'menu-item-card_inactive': !item.active }">
        <div class="item-image" v-if="item.imageThumbnail">
            <img :src="getImageUrl(item.imageThumbnail)" alt="" class="item-img" />
        </div>
        <div class="item-content">
            <div class="item-header">
                <h4 class="item-name">{{ item.name }}</h4>
                <button class="item-actions-btn" @click="$emit('edit', item)" title="Редактировать">
                    <img src="@/assets/images/icons/pencil.svg" alt="" class="action-icon">
                </button>
                <button class="item-actions-btn" @click="$emit('delete', item.id)" title="Удалить">
                    <img src="@/assets/images/icons/close-round.svg" alt="" class="action-icon">
                </button>
            </div>
            <div class="item-description" v-if="item.description" v-html="item.description"></div>
            <div class="item-meta">
                <span class="item-type">
                    <img v-if="getTypeIcon(item.typeId)" :src="getTypeIcon(item.typeId)" alt="" class="type-icon-small" />
                    {{ getTypeName(item.typeId) }}
                </span>
                <template v-if="getVolumes(item).length">
                    <span class="item-weight" v-for="(volume, index) in getVolumes(item)" :key="index">
                        {{ volume }}
                    </span>
                </template>
            </div>
            <div class="item-tags" v-if="item.tags?.length">
                <span 
                    class="item-tag" 
                    v-for="tag in item.tags" 
                    :key="tag.id"
                    :style="getTagStyle(tag)"
                >
                    <img v-if="tag.icon" :src="tag.icon" alt="" class="tag-icon" />
                    {{ tag.name }}
                </span>
            </div>
            <div class="item-footer">
                <div class="item-prices">
                    <span class="item-price" v-if="item.discountPrice">
                        <span class="price-old">{{ formatPrice(item.price) }}</span>
                        <span class="price-new">{{ item.discountPrice }} ₽</span>
                    </span>
                    <span class="item-price" v-else>{{ formatPrice(item.price) }}</span>
                </div>
                <span class="item-status" :class="{ 'item-status_active': item.active }">
                    {{ item.active ? 'Активна' : 'Неактивна' }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { shouldUseWhiteText } from '@/helpers/tagColors'

const props = defineProps({
    item: {
        type: Object,
        required: true
    },
    types: {
        type: Array,
        default: () => []
    }
})

defineEmits(['edit', 'delete'])

const getTypeName = (typeId) => {
    const type = findById(typeId, props.types)
    return type?.name || ''
}

const getTypeIcon = (typeId) => {
    const type = findById(typeId, props.types)
    return type?.icon || null
}

const getVolumes = (item) => {
    // Если volumes - массив, возвращаем его
    if (item.volumes && Array.isArray(item.volumes) && item.volumes.length > 0) {
        return item.volumes
    }
    // Для обратной совместимости: если есть volume или weight как строка
    if (item.volume) {
        return [item.volume]
    }
    if (item.weight) {
        return [item.weight]
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
    
    // Если это объект с from и to
    if (typeof price === 'object' && price !== null) {
        if (price.from && price.to && price.from === price.to) {
            // Фиксированная цена
            return `${price.from} ₽`
        } else if (price.from && !price.to) {
            // Цена от
            return `от ${price.from} ₽`
        } else if (!price.from && price.to) {
            // Цена до
            return `до ${price.to} ₽`
        } else if (price.from && price.to) {
            // Диапазон цен
            return `${price.from} - ${price.to} ₽`
        }
    }
    
    // Старый формат - просто число
    return `${price} ₽`
}
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *

.menu-item-card
    background-color: #fff
    border: 1px solid var(--border-color)
    border-radius: 12px
    overflow: hidden
    transition: all 0.2s ease
    &:hover
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)
        border-color: var(--accent-red)
    &_inactive
        opacity: 0.7
    .item-image
        width: 100%
        height: 200px
        overflow: hidden
        background-color: var(--second-bg)
        .item-img
            width: 100%
            height: 100%
            object-fit: contain
    .item-content
        padding: 16px
        .item-header
            display: flex
            justify-content: space-between
            align-items: flex-start
            gap: 8px
            margin-bottom: 8px
            .item-name
                font-size: 16px
                font-weight: 700
                color: var(--text-color)
                margin: 0
                flex: 1
            .item-actions-btn
                background: none
                border: none
                cursor: pointer
                padding: 4px
                border-radius: 4px
                transition: all 0.2s ease
                &:hover
                    background-color: var(--second-bg)
                .action-icon
                    width: 16px
                    height: 16px
        .item-description
            font-size: 13px
            color: var(--text-secondary)
            margin-bottom: 12px
            line-height: 1.5
        .item-meta
            display: flex
            gap: 8px
            margin-bottom: 8px
            flex-wrap: wrap
            .item-type
                display: flex
                align-items: center
                gap: 6px
                padding: 4px 10px
                background-color: rgba(232, 69, 32, 0.1)
                color: var(--accent-red)
                border-radius: 12px
                font-size: 11px
                font-weight: 600
                .type-icon-small
                    width: 14px
                    height: 14px
                    object-fit: contain
            .item-weight
                padding: 4px 10px
                background-color: var(--second-bg)
                color: var(--text-secondary)
                border-radius: 12px
                font-size: 11px
        .item-tags
            display: flex
            flex-wrap: wrap
            gap: 6px
            margin-bottom: 12px
            .item-tag
                display: inline-flex
                align-items: center
                gap: 6px
                padding: 4px 8px
                background-color: var(--second-bg)
                color: var(--text-color)
                border-radius: 12px
                font-size: 11px
                .tag-icon
                    width: 12px
                    height: 12px
                    object-fit: contain
        .item-footer
            display: flex
            justify-content: space-between
            align-items: center
            padding-top: 12px
            border-top: 1px solid var(--border-color)
            .item-prices
                display: flex
                flex-direction: column
                gap: 4px
                .item-price
                    font-size: 18px
                    font-weight: 700
                    color: var(--accent-red)
                    .price-old
                        font-size: 14px
                        color: var(--text-light)
                        text-decoration: line-through
                        margin-right: 8px
                    .price-new
                        color: var(--accent-red)
            .item-status
                font-size: 12px
                padding: 4px 10px
                border-radius: 12px
                background-color: var(--second-bg)
                color: var(--text-secondary)
                &_active
                    background-color: rgba(78, 159, 112, 0.1)
                    color: var(--green-color)

@media only screen and (min-width: $bp-pc)
    .menu-item-card
        .item-content
            .item-header
                .item-name
                    font-size: 18px
            .item-description
                font-size: 15px
            .item-meta
                .item-type
                    font-size: 13px
                .item-weight
                    font-size: 13px
            .item-tags
                .item-tag
                    font-size: 13px
            .item-footer
                .item-prices
                    .item-price
                        font-size: 20px
                        .price-old
                            font-size: 16px
                .item-status
                    font-size: 14px
</style>
