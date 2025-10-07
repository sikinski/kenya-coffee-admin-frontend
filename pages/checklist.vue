<template>
    <div class="checklist-page page-padding">
        <div class="content">
            <div class="h1-wrapper">
                <ui-go-back />
                <h1 class="h1">Чеклист.</h1>
            </div>
            <div class="container">
                <p class="title">Сегодня.</p>

                <ui-custom-checkbox v-for="(item, index) in todayList" :label="item.text" v-model="item.done"
                    :key="index" @click="updateTask(item.id, { done: !item.done })" />
            </div>

            <div class="day-wrapper" v-for="(day, index) in last30Days" :key="index"
                :class="{ 'day-wrapper_opened': day.showInners }"
                @click="{ day.showInners = !day.showInners; getTasks(day) }">
                <p class="title">{{ getShortDate(day.date) }}</p>
                <img src="@/assets/images/icons/arrow-down.svg" alt="" class="icon arrow-down transition" />

                <div class="inner" v-if="day.showInners" v-motion-fade @click.stop>
                    <template v-if="day.tasks?.length">
                        <div class="item" v-for="(item, index) in day.tasks" :key="index"
                            :class="{ 'item_done': item.done }">
                            <div class="item-header" v-if="!index">
                                <p class="author">{{ item.username }}</p>
                                <p class="done-count">
                                    {{day.tasks.filter(el => el.done).length}}
                                    /
                                    {{ day.tasks.length }}
                                </p>
                            </div>

                            {{ index + 1 }}. {{ item.text }}
                        </div>
                    </template>

                    <template v-else>
                        <div class="empty">Не найдено</div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'

const { $api } = useNuxtApp()
const todayList = ref([])
const last30Days = ref([]);
const MAX_SHOWN_DATES_COUNT = 30

const getTodayTasks = async () => {
    const date = new Date().toISOString().split("T")[0] // "2025-08-22"
    todayList.value = await $api.get(`/tasks?date=${date}`).then(res => res.data.tasks)
}

const getTasks = async (day) => {
    console.log(day);

    const date = day.date.toISOString().split("T")[0]
    console.log(date);

    day.tasks = await $api.get(`/tasks?date=${date}`).then(res => res.data.tasks)
}

const updateTask = async (task_id, body) => {
    await $api.put(`/tasks/${task_id}`, body).then(async () => {
        await getTodayTasks()
    })
}

const getLastDays = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // обнуляем время, чтобы работать с "днями"

    for (let i = 1; i <= MAX_SHOWN_DATES_COUNT; i++) { // начинаем с 1, чтобы не включать сегодня
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        last30Days.value.push({ date: d, showInners: false });
    }

}

onMounted(async () => {
    await getTodayTasks()
    await getLastDays()
})

useHead({
    title: 'Чеклист — Keния',
})
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
.checklist-page
    .container
        margin-top: 10px
        .title
            font-size: 18px
            border-bottom: 1px solid var(--border-color)
            padding: 10px 0
            font-weight: 600
    .day-wrapper
        display: grid
        grid-template-columns: 1fr auto
        padding: 10px 0
        padding-top: 20px
        border-bottom: 1px solid var(--border-color)
        &_opened
            .arrow-down
                transform: rotate(180deg)
        .title
            font-size: 1rem
        .arrow-down
            width: 14px
            height: 14px
            align-self: center
        .inner
            grid-column: 1/3
            margin: 10px 0
            margin-top: 20px
            display: flex
            flex-direction: column
            gap: 10px
            .item
                // padding: 0 20px
                font-weight: 500
                color: var(--text-color) 
                font-size: 14px
                text-align: center
                .item-header
                    display: flex
                    justify-content: space-between
                    align-items: center
                    font-weight: 600
                    margin-bottom: 10px
                    border-top: 1px solid var(--border-color)
                    border-bottom: 1px solid var(--border-color)
                    padding: 10px 0
                &_done
                    text-decoration: line-through
                    font-weight: 300
            .empty
                color: var(--text-color)
                    
        &:first-child
            border-top: 1px solid var(--main-dark)

@media only screen and (min-width: $bp-tablet)
    .checklist-page
        padding: 40px 0
        .container
            margin-top: 20px
            .title
                font-size: 22px
                padding: 14px 0
                margin-bottom: 20px
        .day-wrapper
            margin: 0
            padding: 20px
            padding-top: 40px
            .title
                font-size: 19px
            .arrow-down
                width: 18px
                height: 18px
            .inner
                margin: 20px 0
                margin-top: 40px
                .item
                    font-size: 1rem
                // ?
@media only screen and (min-width: $bp-tablet-landscape-up)
    .checklist-page
        padding: 20px 0
        .container
            .title
                font-size: 18px
                padding: 10px 0
        .day-wrapper
            padding: 20px 0
            .arrow-down
                width: 14px
                height: 14px
@media only screen and (min-width: $bp-pc)
    .checklist-page
        padding: 40px 0
        .container
            margin-bottom: 50px
        .day-wrapper
            padding: 30px 0
            .inner
                width: 50%
            .arrow-down
                width: 18px 
                height: 18px
</style>