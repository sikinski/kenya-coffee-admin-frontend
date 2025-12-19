<template>
    <client-only>
        <v-chart class="canvas" :option="salesConfig" />
    </client-only>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    data: Object // { period: "month", data: [{ text: '16.09 - 20.09', value: 118817 }, ...] }
})

const { data } = toRefs(props)
console.log(data.value);


const salesConfig = computed(() => {
    const periodLabel = getWordPeriod(data.value.period)
    const xData = data.value.data.map(d => d.text)
    const yData = data.value.data.map(d => Math.round(d.value)) // округляем

    return {
        title: {
            text: `Продажи за ${periodLabel}`,
            left: 'center',
            textStyle: { color: '#333', fontSize: 18 }
        },
        tooltip: {
            trigger: 'axis',
            formatter: params => {
                const p = params[0]
                return `${p.name}<br>${p.seriesName}: ${p.value.toLocaleString('ru-RU')} ₽`
            }
        },
        grid: {
            left: '0%',
            right: '0%',
            bottom: '0%',
            containLabel: true
        },
        xAxis: { type: 'category', boundaryGap: false, data: xData },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: value => value.toLocaleString('ru-RU') + ' ₽'
            }
        },
        series: [
            {
                name: 'Продажи',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                data: yData,
                lineStyle: { color: '#e84520', width: 3 },
                areaStyle: { color: 'rgba(232, 69, 32, 0.15)' },
                itemStyle: { color: '#e84520' },
                emphasis: { focus: 'series' },
                animationDuration: 1500,
                animationEasing: 'cubicOut'
            }
        ]
    }
})

</script>
