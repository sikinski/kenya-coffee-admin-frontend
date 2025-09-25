<template>
    <div class="reporting-page page-padding">
        <div class="content">
            <div class="h1-wrapper">
                <ui-go-back />
                <h1 class="h1">Отчетность.</h1>
            </div>

            <div class="container">
                <p class="title">Сегодня.</p>
                <div class="today-table">
                    <div class="line">
                        <p class="text">Наличные</p>


                        <input type="text" class="input" placeholder="Ввод"
                            @input="e => { e.target.value = numberInput(e); todayReport.cash = e.target.value }"
                            v-model="todayReport.cash">
                        <p class="text">руб.</p>
                    </div>

                    <div class="line">
                        <p class="text">Безналичные</p>

                        <input type="text" class="input" placeholder="Ввод"
                            @input="e => { e.target.value = numberInput(e); todayReport.non_cash = e.target.value }"
                            v-model="todayReport.non_cash">
                        <p class="text">руб.</p>
                    </div>

                    <div class="line">
                        <p class="text">Итого</p>

                        <input type="text" class="input" placeholder="Ввод" v-model="totalSum" disabled>
                        <p class="text">руб.</p>
                    </div>

                    <div class="line">
                        <p class="text">Кол-во покупок (опционально)</p>

                        <input type="text" class="input" placeholder="Ввод"
                            @input="e => { e.target.value = numberInput(e); todayReport.number_purchases = e.target.value }"
                            v-model="todayReport.number_purchases">
                        <p class="text">руб.</p>
                    </div>

                    <div class="line">
                        <p class="text">Касса</p>

                        <input type="text" class="input" placeholder="Ввод"
                            @input="e => { e.target.value = numberInput(e); todayReport.cash_register = e.target.value }"
                            v-model="todayReport.cash_register">
                        <p class="text">руб.</p>
                    </div>
                </div>

                <div class="border-line"></div>
            </div>

            <div class="day-wrapper" v-for="(day, index) in last30Days" :key="index"
                :class="{ 'day-wrapper_opened': day.showInners }" @click="getReport(day)">
                <p class="title" @click="day.showInners = !day.showInners">{{ getShortDate(day.date) }}</p>
                <img src="@/assets/images/icons/arrow-down.svg" @click="day.showInners = !day.showInners"
                    class="icon arrow-down transition" />

                <div class="inner" v-if="day.showInners" v-motion-fade>
                    <template v-if="day.report"></template>

                    <div class="empty" v-else>
                        Данных не найдено. Вероятно, отчет не был заполнен за этот день
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const { $api } = useNuxtApp()
import { onMounted } from 'vue';

const MAX_SHOWN_DATES_COUNT = 30
const last30Days = ref([]);

const todayReport = ref({
    cash: null,
    non_cash: null,
    total: null,
    number_purchases: null,
    cash_register: null
})

const totalSum = computed(() => {
    return Number(todayReport.value.cash) + Number(todayReport.value.non_cash)
})

const getReport = async (day) => {
    const date = day.date.toISOString().split("T")[0]
    console.log(date);

    day.report = await $api.get(`/report?date=${date}`).then(res => res.data || todayReport.value).catch(() => null)
    return day.report
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

const updateTodayReport = async (date) => {
    const data = {
        cash: Number(todayReport.value.cash),
        non_cash: Number(todayReport.value.non_cash),
        total: Number(todayReport.value.total),
        number_purchases: Number(todayReport.value.number_purchases),
        cash_register: Number(todayReport.value.cash_register)
    }
    await $api.put(`/report?date=${date}`, data).then(res => console.log(res))
}

watch(todayReport, async () => {
    updateTodayReport(new Date().toISOString().split("T")[0])
}, { deep: true })

watch(totalSum, (val) => {
    todayReport.value.total = val
})

onMounted(async () => {
    await getLastDays()
    todayReport.value = await getReport({ date: new Date() }) // for today
    console.log(todayReport.value);

})
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
.reporting-page
    
    .container
        margin-top: 10px
        .title
            font-size: 18px
            border-bottom: 1px solid var(--main-dark)
            padding: 10px 0
            font-weight: 700
    .today-table
        display: flex
        flex-direction: column
        // gap: 10px
        margin: 40px 0
        .line
            display: grid
            grid-template-columns: 1fr 1fr 40px
            align-items: center
            gap: 10px
            border-bottom: 1px solid var(--main-dark)
            padding: 12px 0
            .text
                color: var(--text-color)
                font-size: 1rem
                font-weight: 500
            .input
                height: 40px
                text-align: center
                background-color: var(--block-bg)
                font-size: 1rem
                border-radius: 4px
    .border-line
        background-color: var(--main-dark)
        color: var(--text-color)
        width: 100%
        height: 25px
        border: 1px solid var(--main-dark)
        width: calc(100% + 40px)
        margin-left: -20px
        // border-radius: 4px
    .day-wrapper
        margin-top: 20px
        display: grid
        grid-template-columns: 1fr auto
        padding: 10px 0
        border-bottom: 1px solid var(--main-dark)
        &_opened
            .arrow-down
                transform: rotate(180deg)
        .title
            font-size: 1rem
        .arrow-down
            width: 14px
            height: 14px
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
                    border-top: 1px solid var(--text-color)
                    border-bottom: 1px solid var(--text-color)
                    padding: 10px 0
                &_done
                    text-decoration: line-through
                    font-weight: 300
            .empty
                color: var(--text-color)
                font-size: 14px
                    
        &:first-child
            border-top: 1px solid var(--main-dark)
</style>