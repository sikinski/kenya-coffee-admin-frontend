<template>
    <div class="users-page page-padding">
        <div class="content">
            <div class="h1-wrapper">
                <ui-go-back />
                <h1 class="h1">Сменщики.</h1>
            </div>
            <p class="text">Что сюда добавить ?)</p>

            <div class="items">
                <div class="item" v-for="user in users" :key="id">
                    <p class="name">{{ user.name }}</p>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup>
import { onMounted } from 'vue';

const { $api } = useNuxtApp()
const users = ref([])

const getUsers = async () => {
    await $api.get(`/users`).then(res => users.value = res.data).catch(() => [])
}

onMounted(async () => {
    await getUsers()
})
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
.users-page
    .text
        font-size: 20px
        text-align: center
        margin-top: 20px
    .items
        margin-top: 40px
        display: flex
        flex-direction: column
        gap: 10px
</style>