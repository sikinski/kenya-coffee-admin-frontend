<template>
    <div class="nav">
        <nuxt-link class="wrapper" to="/analysis">
            <img src="@/assets/images/icons/analysis.svg" alt="" class="icon" />
            <p class="name">Аналитика</p>
        </nuxt-link>
        <nuxt-link class="wrapper" to="/checklist">
            <img src="@/assets/images/icons/checklist.svg" alt="" class="icon" />
            <p class="name">Чеклист</p>
        </nuxt-link>
        <nuxt-link class="wrapper" to="/notes">
            <img src="@/assets/images/icons/notes.svg" alt="" class="icon" />
            <p class="name">Заметки</p>
        </nuxt-link>
        <nuxt-link class="wrapper" to="/menu">
            <img src="@/assets/images/icons/products.svg" alt="" class="icon" />
            <p class="name">Меню</p>
        </nuxt-link>
        <nuxt-link class="wrapper" to="/contacts">
            <img src="@/assets/images/icons/shop-location.svg" alt="" class="icon" />
            <p class="name">Контакты</p>
        </nuxt-link>
        <nuxt-link class="wrapper" to="/faq">
            <img src="@/assets/images/icons/add-info.svg" alt="" class="icon" />
            <p class="name">FAQ</p>
        </nuxt-link>
        <!-- <nuxt-link class="wrapper" to="/users">
            <img src="@/assets/images/icons/person.svg" alt="" class="icon" />
            <p class="name">Сменщики</p>
        </nuxt-link> -->

        <!-- <nuxt-link class="wrapper" to="/procurement">
            <img src="@/assets/images/icons/products.svg" alt="" class="icon" />
            <p class="name">Закупки</p>
        </nuxt-link> -->
    </div>
</template>

<script setup>
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
</style>