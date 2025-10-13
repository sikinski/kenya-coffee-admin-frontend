<template>
    <client-only>
        <v-chart class="canvas" :option="salesConfig" />
    </client-only>
</template>

<script setup>
const salesConfig = {
    title: {
        text: 'Продажи за неделю (ТЕСТ)',
        left: 'center',
        textStyle: {
            color: '#333',
            fontSize: 18
        }
    },
    tooltip: {
        trigger: 'axis'
    },
    grid: {
        left: '0%',
        right: '0%',
        bottom: '0%',
        containLabel: true
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            name: 'Продажи',
            type: 'line',
            smooth: true, // плавная линия
            symbol: 'circle',
            symbolSize: 8,
            data: [120, 200, 150, 80, 70, 110, 130],
            lineStyle: {
                color: '#f89d82',
                width: 3
            },
            areaStyle: {
                color: 'rgba(248, 157, 130, 0.2)'
            },
            itemStyle: {
                color: '#e8451f'
            },
            emphasis: {
                focus: 'series'
            },
            animationDuration: 1500, // анимация появления линии
            animationEasing: 'cubicOut'
        }
    ]
}
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
</style>