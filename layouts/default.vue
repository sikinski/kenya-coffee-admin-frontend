<template>
    <div>
        <header class="header">
            <div class="content">
                <nuxt-link to="/" class="logo-wrapper">
                    <img src="/logo.png" alt="">
                </nuxt-link>

                <!-- <p class="time">{{ getCurrentTimeInGMT5() }}</p> -->

                <button class="menu-btn" @click="showMenu = !showMenu"><img src="@/assets/images/icons/burger.svg"
                        alt=""></button>
            </div>
        </header>

        <main>
            <slot />
        </main>

        <div class="nav-menu" v-if="showMenu" v-motion-slide-visible-top>
            <v-nav />
        </div>
    </div>
</template>

<script setup>
import { useWindowSize } from '@vueuse/core'
const { width } = useWindowSize();
const showMenu = ref(false)

if (width.value > 900) {
    showMenu.value = true
}

watch(showMenu, () => {
    const isMobile = width.value < 900
    console.log(isMobile);

    if (isMobile && showMenu.value) {
        document.documentElement.style.overflowY = 'hidden'
    } else {
        document.documentElement.style.overflowY = 'auto'
    }
})

function getCurrentTimeInGMT5() {
    const date = new Date();

    const options = {
        timeZone: 'Asia/Yekaterinburg',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    const formatter = new Intl.DateTimeFormat('ru-RU', options);
    const parts = formatter.formatToParts(date);

    const day = parts.find(part => part.type === 'day').value;
    const month = parts.find(part => part.type === 'month').value;
    const year = parts.find(part => part.type === 'year').value;
    const hour = parts.find(part => part.type === 'hour').value;
    const minute = parts.find(part => part.type === 'minute').value;

    return `${day}.${month} ${hour}:${minute}`;
}

useHead({
    title: 'Главная страница — Новый день',
})

</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
$HEADERSHEIGHT-mobile: 80px
$HEADERSHEIGHT-tablet: 100px
$HEADERSHEIGHT-desktop: 100px
.header
    padding: 16px 0
    background-color: #fff
    border-bottom: 1px solid var(--border-color)
    .content
        display: flex
        justify-content: space-between
        align-items: center
    .logo-wrapper
        width: 50px
        transition: transform 0.2s ease
        &:hover
            transform: scale(1.05)
    .time
        font-size: 18px
    .menu-btn
        border: none
        width: 50px
        background: transparent
        cursor: pointer
        padding: 8px
        border-radius: 8px
        transition: background-color 0.2s ease
        &:hover
            background-color: var(--second-bg)
        img
            width: 80%
    .nav-menu
        position: absolute
        top: $HEADERSHEIGHT-mobile
        left: 0
        background-color: #fff
        width: 100%
        height: calc(100vh - $HEADERSHEIGHT-mobile)
        padding: 20px
        z-index: 10
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1)
        .nav
            display: flex
            flex-direction: column
            gap: 8px
            height: 100%
            justify-content: flex-start
            padding-top: 20px
            .icon
                display: none
            .name
                text-align: left
                font-size: 16px
                font-weight: 500
            .wrapper
                padding: 14px 16px
                border-radius: 12px
                transition: all 0.2s ease
                &:hover
                    background-color: var(--second-bg)
            .router-link-active
                background-color: rgba(232, 69, 32, 0.1)
                .name
                    color: var(--accent-red)
                    font-weight: 600

@media only screen and (min-width: $bp-tablet)
    .header
        padding: 22px 0
        .logo-wrapper
            width: 60px
        .time
            font-size: 22px
        .menu-btn
            width: 60px
    .nav-menu
        top: $HEADERSHEIGHT-tablet
        height: calc(100vh - $HEADERSHEIGHT-tablet)
        .nav
            padding-bottom: $HEADERSHEIGHT-tablet
            gap: 24px
                
            .name
                font-size: 22px
                font-weight: 500

@media only screen and (min-width: $bp-tablet-landscape-up)
    $MENU-talbet-WIDTH: 200px
    .header
        margin-left: calc($MENU-talbet-WIDTH + 40px)
        margin-right: 40px
        padding: 12px 0
        .menu-btn
            display: none
        .logo-wrapper
            width: 60px

    .nav-menu
        position: fixed
        left: 0
        top: 0
        height: 100%
        width: $MENU-talbet-WIDTH
        background-color: #fff
        border-right: 1px solid var(--border-color)
        padding: 24px 0
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04)
        .nav
            gap: 4px
            padding-bottom: 0
            .wrapper
                display: grid
                grid-template-columns: 24px 1fr
                grid-gap: 12px
                padding: 14px 24px
                align-items: center
                border-radius: 0
                margin: 0 12px
                transition: all 0.2s ease
                &:hover
                    background-color: var(--second-bg)
            .router-link-active
                background-color: rgba(232, 69, 32, 0.1)
                .name
                    color: var(--accent-red)
                    font-weight: 600
            .icon
                display: block
                width: 22px
                height: 22px
            .name
                text-align: left
                font-size: 15px
                font-weight: 500
    main
        margin-left: calc($MENU-talbet-WIDTH + 40px)
        margin-right: 40px

@media only screen and (min-width: $bp-pc)
    $MENU-desktop-WIDTH: 300px
    .header
        margin-left: calc($MENU-desktop-WIDTH + 40px)
        .menu-btn
            display: none
        .logo-wrapper
            width: 70px
    .nav-menu
        width: $MENU-desktop-WIDTH
        padding: 32px 0
        .nav
            gap: 4px
            .wrapper
                grid-template-columns: 28px 1fr
                transition: all 0.2s ease
                padding: 16px 32px
                margin: 0 16px
                border-radius: 12px
                &:hover
                    background-color: var(--second-bg)
            .router-link-active
                background-color: rgba(232, 69, 32, 0.1)
                .name
                    color: var(--accent-red)
                    font-weight: 600
            .icon
                width: 24px
                height: 24px
            .name
                font-size: 16px
                transition: all 0.2s ease
                font-weight: 500
    main
        margin-left: calc($MENU-desktop-WIDTH + 40px)

@media only screen and (min-width: $bp-large)
    $MENU-large-WIDTH: 320px
    .header
        margin-left: calc($MENU-large-WIDTH + 60px)
        padding: 16px 0
        .logo-wrapper
            width: 80px
    .nav-menu
        width: $MENU-large-WIDTH
        padding: 40px 0
        .nav
            gap: 6px
            .wrapper
                grid-template-columns: 30px 1fr
                padding: 18px 40px
                margin: 0 20px
            .icon
                width: 26px
                height: 26px
            .name
                font-size: 18px
    main
        margin-left: calc($MENU-large-WIDTH + 60px)
</style>