<template>
    <div class="graphs">
        <div class="sales-graph">
            <div class="nav-btns">
                <button class="nav-btn nav-btn_active">За неделю</button>
                <button class="nav-btn">За месяц</button>
                <button class="nav-btn">За год</button>
            </div>
            <charts-sales-chart />
        </div>

    </div>
</template>

<script setup>
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *

.graphs
    display: grid
    grid-template-columns: 1fr 1fr
    grid-gap: 40px
    .sales-graph
        height: 300px
        .nav-btns
            display: flex
            flex-wrap: wrap
            gap: 0
            .nav-btn
                border: 1px solid var(--border-color)
                padding: 3px 10px
                font-size: 14px
                &_active, &:hover
                    background-color: var(--creme-color)
                &_active
                    border-color: var(--creme-color)

        .canvas
            height: 100%
</style>