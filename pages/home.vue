<template>
    <div class="home-page">
        <div class="content">
            <div class="header-section">
                <h1 class="h1">Добро пожаловать!</h1>
                <div class="user-info">
                    <span class="user-label">Сегодня на смене:</span>
                    <span class="user-name">{{ user_name }}</span>
                    <button class="logout-btn" @click="useLogout" title="Выйти">
                        <img src="@/assets/images/icons/pencil.svg" alt="" class="change-icon">
                    </button>
                </div>
            </div>

            <v-nav class="nav-container" />

            <div class="logs-section">
                <div class="logs-card">
                    <p class="logs-text">Здесь будут логи ( кто что делал в админке и в какое время )</p>
                </div>
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
    background-color: var(--main-bg)
    min-height: 100vh

    .header-section
        margin-bottom: 32px
        .user-info
            display: flex
            align-items: center
            gap: 12px
            padding: 12px 16px
            background-color: #fff
            border: 1px solid var(--border-color)
            border-radius: 12px
            .user-label
                font-size: 14px
                color: var(--text-secondary)
                font-weight: 500
            .user-name
                font-size: 15px
                font-weight: 600
                color: var(--text-color)
            .logout-btn
                margin-left: auto
                background: none
                border: none
                padding: 6px
                cursor: pointer
                border-radius: 6px
                transition: all 0.2s ease
                display: flex
                align-items: center
                justify-content: center
                &:hover
                    background-color: var(--second-bg)
                .change-icon
                    height: 16px
                    width: 16px
                    opacity: 0.7
                    transition: opacity 0.2s ease
                &:hover .change-icon
                    opacity: 1

    .nav-container
        display: grid
        grid-template-columns: repeat(2, 1fr)
        gap: 12px
        margin-bottom: 32px
        .wrapper
            display: grid
            grid-template-columns: 24px 1fr 
            gap: 12px
            align-items: center
            padding: 16px 20px
            background-color: #fff
            border: 1px solid var(--border-color)
            border-radius: 12px
            transition: all 0.2s ease
            cursor: pointer
            &:hover
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06)
                border-color: var(--accent-red)
                transform: translateY(-1px)
            .icon
                width: 24px
                height: 24px
            .name
                font-weight: 600
                font-size: 15px
                color: var(--text-color)

    .logs-section
        margin-top: 32px
        .logs-card
            padding: 32px
            background-color: #fff
            border: 1px solid var(--border-color)
            border-radius: 12px
            text-align: center
            min-height: 200px
            display: flex
            justify-content: center
            align-items: center
        .logs-text
            color: var(--text-secondary)
            font-size: 14px
            font-weight: 500

@media only screen and (min-width: $bp-tablet)
    .home-page
        .header-section
            .user-info
                padding: 14px 20px
                .user-label
                    font-size: 15px
                .user-name
                    font-size: 16px
        .nav-container
            grid-template-columns: repeat(3, 1fr)
            gap: 16px
            .wrapper
                padding: 20px 24px
                .name
                    font-size: 16px

@media only screen and (min-width: $bp-tablet-landscape-up)
    .home-page
        .nav-container
            display: none

@media only screen and (min-width: $bp-pc)
    .home-page
        .logs-section
            .logs-card
                padding: 40px
            .logs-text
                font-size: 16px

@media only screen and (min-width: $bp-large)
    .home-page
        .header-section
            .user-info
                padding: 16px 24px
                .user-label
                    font-size: 16px
                .user-name
                    font-size: 17px
        .logs-section
            .logs-card
                padding: 48px
            .logs-text
                font-size: 18px

</style>