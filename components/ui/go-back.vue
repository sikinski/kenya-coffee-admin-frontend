<template>
    <button class="go-back center" @click="$router.go(-1)">
        <svg width="50" height="50" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.75 23.75L10.25 15L17.75 6.25" stroke="#603a27" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
        </svg>
    </button>
</template>

<script setup>
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
.go-back
    padding: 5px
    border-radius: 5px
    border: 1px solid var(--text-color)
    width: 35px
    height: 35px
</style>