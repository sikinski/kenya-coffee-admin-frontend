<template>
    <client-only>
        <v-chart class="canvas" :option="productsConfig" />
    </client-only>
</template>

<script setup>
import { ref, toRefs } from 'vue'

const props = defineProps({
    data: {
        type: Array,
        required: true,
        default: []
    }
})

const { data } = toRefs(props)
console.log(data);

const productsConfig = ref({
    title: {
        text: 'Продажи по продуктам',
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
        data: computed(() => data.value.map(el => el.name)),
        axisLabel: { rotate: 20 } // чтобы длинные названия помещались
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            name: 'Продажи',
            type: 'bar',
            data: computed(() => data.value.map(el => el.count)),
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