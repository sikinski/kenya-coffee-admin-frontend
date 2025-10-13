<template>
    <div class="graphs">
        <div class="sales-graph graph-wrapper">
            <div class="nav-btns">
                <button class="nav-btn nav-btn_active">За неделю</button>
                <button class="nav-btn">За месяц</button>
                <button class="nav-btn">За год</button>
            </div>
            <charts-sales-chart />
        </div>

        <div class="products-graph graph-wrapper">
            <div class="nav-btns">
                <button class="nav-btn nav-btn_active">Кофе</button>
                <button class="nav-btn">Др.напитки</button>
                <button class="nav-btn">Еда</button>
            </div>
            <charts-products-chart />
        </div>
    </div>
</template>

<script setup>
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *

.graphs
    display: grid
    grid-template-columns: 1fr
    grid-gap: 20px
    .graph-wrapper
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