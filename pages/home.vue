<template>
    <div class="home-page">
        <div class="content">
            <h1 class="h1">Добро пожаловать!</h1>

            <p class="today-person">Сегодня на смене: {{ user_name }} <img src="@/assets/images/icons/pencil.svg"
                    @click="useLogout" alt="" class="change-icon"></p>

            <div class="container mt">
                <nuxt-link class="wrapper" to="/checklist">
                    <img src="@/assets/images/icons/checklist.svg" alt="" class="icon" />
                    <p class="name">Чеклист</p>
                </nuxt-link>
                <nuxt-link class="wrapper" to="/notes">
                    <img src="@/assets/images/icons/notes.svg" alt="" class="icon" />
                    <p class="name">Заметки</p>
                </nuxt-link>
                <nuxt-link class="wrapper" to="/reporting">
                    <img src="@/assets/images/icons/reporting.svg" alt="" class="icon" />
                    <p class="name">Отчетность</p>
                </nuxt-link>
                <nuxt-link class="wrapper" to="/users">
                    <img src="@/assets/images/icons/person.svg" alt="" class="icon" />
                    <p class="name">Сменщики</p>
                </nuxt-link>
            </div>

        </div>
    </div>
</template>

<script setup>
const user_name = useCookie('user_name').value
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
            grid-template-columns: 1fr 1fr 
            align-items: center
            border-bottom: 1px solid var(--text-color)
            padding: 30px 20px
            .icon
                width: 40px
                height: 40px
            .name
                font-weight: 600
            &:nth-child(even)
                border-left:  1px solid var(--text-color)
</style>