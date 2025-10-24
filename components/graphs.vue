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
    grid-gap: 20px
    .graph-wrapper
        display: flex
        flex-direction: column
        .nav-btns
            display: flex
            flex-wrap: wrap
            gap: 0
            margin-top: 20px
            .nav-btn
                border: 1px solid var(--border-color)
                padding: 5px 12px
                font-size: 14px
                transition: .3s ease
                
                &_active, &:hover
                    background-color: var(--creme-color)
                    border-color: var(--creme-color)
                    
        .canvas
            height: 270px
            margin-top: auto
@media only screen and (min-width: $bp-tablet)
    .graphs
        grid-gap: 40px
        .graph-wrapper
            .canvas
                height: 300px
@media only screen and (min-width: $bp-pc)
    .graphs
        grid-template-columns: 1fr 1fr
        grid-gap: 20px
        .graph-wrapper
            .canvas
                height: 370px
</style>