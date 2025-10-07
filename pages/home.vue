<template>
    <div class="home-page">
        <div class="content">
            <h1 class="h1">Добро пожаловать!</h1>

            <p class="today-person">Сегодня на смене: {{ user_name }} <img src="@/assets/images/icons/pencil.svg"
                    @click="useLogout" alt="" class="change-icon"></p>


            <v-nav class="container mt" />

            <div class="logs">
                Здесь будут логи ( кто что делал в админке и в какое время )
            </div>
        </div>
    </div>
</template>

<script setup>
const user_name = useCookie('user_name').value

useHead({
    title: 'Главная — Keния',
})
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
.home-page
    padding: 20px 0
    .today-person
        font-style: italic
        margin: 15px 0
        display: grid
        grid-template-columns: auto 1fr
        grid-gap: 10px
        .change-icon
            height: 17px
            opacity: .8
            cursor: pointer
    .container
        display: grid
        grid-template-columns: 1fr 1fr
        // grid-gap: 10px
        .wrapper
            display: grid
            grid-template-columns: 30px 1fr 
            gap: 15px
            align-items: center
            border-bottom: 1px solid var(--border-color)
            padding: 30px 10px
            .icon
                width: 30px
                height: 30px
            .name
                font-weight: 600
            &:nth-child(even)
                border-left:  1px solid var(--border-color)
            &:nth-child(5), &:nth-child(6)
                border-bottom: none
    .logs
        margin-top: 50px
        text-align: center
        min-height: 200px
        display: flex
        justify-content: center
        align-items: center
@media only screen and (min-width: $bp-tablet)
    .home-page
        .h1
            text-align: center
            font-size: 2.25rem
        .today-person
            display: flex
            justify-content: center
            font-size: 18px
            .icon
                height: 20px
        .container
            .wrapper
                display: flex
                flex-direction: column
                gap: 30px
                padding: 40px
                .name
                    font-size: 20px
@media only screen and (min-width: $bp-tablet-landscape-up)
    .home-page
        .h1
            font-size: 2rem
        .container
            display: none

@media only screen and (min-width: $bp-pc)
    .home-page
        padding: 40px 0
        .h1
            text-align: left
            font-size: 2.5rem
        .today-person
            justify-content: flex-start

</style>