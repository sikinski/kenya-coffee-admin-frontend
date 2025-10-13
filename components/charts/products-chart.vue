<template>
    <client-only>
        <v-chart class="canvas" :option="productsConfig" />
    </client-only>
</template>

<script setup>
import { ref } from 'vue'

// Поддельные данные по продуктам
const products = [
    "Капучино",
    "Латте",
    "Американо",
    "Флэт Уайт",
    "Эспрессо",
    "Мокко"

]
const sales = [120, 80, 60, 150, 40, 100] // произвольные цифры

const productsConfig = ref({
    title: {
        text: 'Продажи по продуктам (ТЕСТ)',
        left: 'center',
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' } // подсветка столбика
    },
    grid: {
        left: '0%',
        right: '0%',
        bottom: '0%',
        containLabel: true
    },
    xAxis: {
        type: 'category',
        data: products,
        axisLabel: { rotate: 20 } // чтобы длинные названия помещались
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            name: 'Продажи',
            type: 'bar',
            data: sales,
            itemStyle: {
                color: '#ca9279',
            },
            emphasis: {
                itemStyle: {
                    color: '#e84520' // super-highlight
                }
            },
            animationDuration: 1000, // анимация роста
        }
    ]
})
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
</style>