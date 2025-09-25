<template>
    <div>
        <header class="header">
            <div class="content">
                <nuxt-link to="/" class="logo-wrapper">
                    <img src="@/assets/images/coffee-cup.png" alt="">
                </nuxt-link>

                <p class="time">{{ getCurrentTimeInGMT5() }}</p>

                <!-- <button class="menu"><img src="@/assets/images/icons/burger.svg" alt=""></button> -->
            </div>
        </header>

        <main>
            <slot />
        </main>
    </div>
</template>

<script setup>

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
    .menu
        border: none
        width: 50px
        img
            width: 80%
</style>