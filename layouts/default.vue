<template>
    <div>
        <header class="header">
            <div class="content">
                <nuxt-link to="/" class="logo-wrapper">
                    <img src="/logo.jpg" alt="">
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
    padding: 15px 0
    .content
        display: flex
        justify-content: space-between
        align-items: center
    .logo-wrapper
        width: 50px
    .time
        font-size: 18px
    .menu-btn
        border: none
        width: 50px
        img
            width: 80%
.nav-menu
    position: absolute
    top: $HEADERSHEIGHT-mobile
    left: 0
    background-color: var(--creme-color)
    width: 100%
    height: calc(100vh - $HEADERSHEIGHT-mobile)
    padding: 13px
    z-index: 10
    .nav
        display: flex
        flex-direction: column
        gap: 10px
        height: 100%
        justify-content: center
        padding-bottom: $HEADERSHEIGHT-mobile
        .icon
            display: none
        .name
            text-align: center
            font-size: 18px
            font-weight: 500

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
        padding: 10px 0
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
        background-color: var(--main-bg)
        border-right: 1px solid var(--border-color)
        padding: 20px 0
        .nav
            gap: 0
            padding-bottom: 0
            .wrapper
                display: grid
                grid-template-columns: 23px 1fr
                grid-gap: 15px
                padding: 20px 30px
                align-items: center
            .router-link-active
                background-color: var(--creme-color)
                .name
                    color: #000
            .icon
                display: block
                width: 22px
                height: 22px
            .name
                text-align: left
                font-size: 16px
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
        padding: 40px 0
        .nav
            gap: 0
            .wrapper
                grid-template-columns: 27px 1fr
                transition: .3s ease
                padding: 20px 40px
                &:hover
                    background-color: var(--creme-color)
            .icon
                width: 30px
                height: 30px
            .name
                font-size: 21px
                transition: .3s ease
            .wrapper:hover
                .name
                    color: #000
    main
        margin-left: calc($MENU-desktop-WIDTH + 40px)
</style>