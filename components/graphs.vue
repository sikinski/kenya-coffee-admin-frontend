<template>
    <div class="graphs">
        <div class="sales-graph graph-wrapper">
            <charts-sales-chart v-if="salesData" :data="salesData" />
        </div>

        <div class="products-graph graph-wrapper">
            <div class="nav-btns">
                <button class="nav-btn" v-for="pType in productTypes"
                    :class="{ 'nav-btn_active': productsFilters.product_type === pType }"
                    @click="productsFilters.product_type = pType">
                    {{ pType }}
                </button>

            </div>
            <charts-products-chart v-if="productsData" :data="productsData" />
        </div>
    </div>
</template>

<script setup>
import { onMounted, watch, ref, toRef } from 'vue';
const { $api } = useNuxtApp()

const props = defineProps({ filters: Object })
const filtersRef = toRef(props, 'filters') // Правильное создание рефа для пропса

const productsFilters = ref({})

// Инициализируем productsFilters при монтировании и при изменении filters
const initializeProductsFilters = () => {
    productsFilters.value = {
        product_type: 'Кофе',
        ...filtersRef.value // Берем актуальное значение
    }
}

const productTypes = ['Кофе', 'Другие напитки', 'Еда']

const salesData = ref(null)
const productsData = ref(null)

const getSalesGraphData = async () => {
    salesData.value = await $api.get(`/aqsi/sales-graph?${toQueryString(filtersRef.value)}`).then(res => res.data)
}

const getProductsGraphData = async () => {
    productsData.value = await $api.get(`/aqsi/products-graph?${toQueryString(productsFilters.value)}`).then(res => res.data)
}


// Следим за изменением filters из родителя
watch(filtersRef, async (newFilters) => {
    // Обновляем productsFilters актуальными значениями
    productsFilters.value = {
        product_type: 'Кофе',
        ...newFilters
    }

    await getSalesGraphData()
    await getProductsGraphData()
}, { deep: true })

// Следим за изменением productsFilters (включая изменения из родителя)
watch(productsFilters, async () => {
    await getProductsGraphData()
}, { deep: true })

onMounted(async () => {
    initializeProductsFilters()
    await getSalesGraphData()
})
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *

.graphs
    display: grid
    grid-template-columns: 1fr
    grid-gap: 24px
    .graph-wrapper
        display: flex
        flex-direction: column
        background-color: #fff
        border-radius: 16px
        padding: 20px
        border: 1px solid var(--border-color)
        .nav-btns
            display: flex
            flex-wrap: wrap
            gap: 8px
            margin-bottom: 20px
            .nav-btn
                border: 1px solid var(--border-color)
                padding: 8px 16px
                font-size: 13px
                font-weight: 500
                border-radius: 20px
                background-color: #fff
                color: var(--text-color)
                transition: all 0.2s ease
                cursor: pointer
                &:hover
                    border-color: var(--accent-red)
                    color: var(--accent-red)
                &_active
                    background-color: var(--accent-red)
                    border-color: var(--accent-red)
                    color: #fff
                    
        .canvas
            height: 280px
            margin-top: auto
            border-radius: 8px
            overflow: hidden

@media only screen and (min-width: $bp-tablet)
    .graphs
        grid-gap: 24px
        .graph-wrapper
            padding: 24px
            .nav-btns
                margin-bottom: 24px
                .nav-btn
                    font-size: 14px
                    padding: 10px 20px
            .canvas
                height: 320px

@media only screen and (min-width: $bp-pc)
    .graphs
        grid-template-columns: 1fr 1fr
        grid-gap: 24px
        .graph-wrapper
            padding: 28px
            .canvas
                height: 380px

@media only screen and (min-width: $bp-large)
    .graphs
        grid-gap: 32px
        .graph-wrapper
            padding: 36px
            .nav-btns
                margin-bottom: 28px
                .nav-btn
                    font-size: 15px
                    padding: 12px 24px
            .canvas
                height: 420px
</style>