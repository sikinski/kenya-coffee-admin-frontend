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
                        <p class="text">₽</p>
                    </div>

                    <div class="line">
                        <p class="text">Безналичные</p>

                        <input type="text" class="input" placeholder="Ввод"
                            @input="e => { e.target.value = numberInput(e); todayReport.non_cash = e.target.value }"
                            v-model="todayReport.non_cash">
                        <p class="text">₽</p>
                    </div>

                    <div class="line">
                        <p class="text">Итого</p>

                        <input type="text" class="input" placeholder="Ввод" v-model="totalSum" disabled>
                        <p class="text">₽</p>
                    </div>

                    <div class="line">
                        <p class="text">Кол-во покупок (опционально)</p>

                        <input type="text" class="input" placeholder="Ввод"
                            @input="e => { e.target.value = numberInput(e); todayReport.number_purchases = e.target.value }"
                            v-model="todayReport.number_purchases">
                        <p class="text">₽</p>
                    </div>

                    <div class="line">
                        <p class="text">Касса</p>

                        <input type="text" class="input" placeholder="Ввод"
                            @input="e => { e.target.value = numberInput(e); todayReport.cash_register = e.target.value }"
                            v-model="todayReport.cash_register">
                        <p class="text">₽</p>
                    </div>
                </div>

                <div class="border-line"></div>
            </div>

            <div class="day-wrapper" v-for="(day, index) in last30Days" :key="index"
                :class="{ 'day-wrapper_opened': day.showInners }"
                @click="{ day.showInners = !day.showInners; getReport(day) }">
                <p class="title">{{ getShortDate(day.date) }}</p>
                <img src="@/assets/images/icons/arrow-down.svg" class="icon arrow-down transition" />

                <div class="inner" v-if="day.showInners" v-motion-fade @click.stop>
                    <template v-if="day.report">
                        <div class="wrapper">
                            <p class="label">Наличные</p>
                            <p class="value">{{ day.report.cash || '—' }}</p>
                        </div>
                        <div class="wrapper">
                            <p class="label">Безналичные</p>
                            <p class="value">{{ day.report.non_cash || '—' }}</p>
                        </div>
                        <div class="wrapper">
                            <p class="label">Итого</p>
                            <p class="value">{{ day.report.total || '—' }}</p>
                        </div>
                        <div class="wrapper">
                            <p class="label">Кол-во покупок</p>
                            <p class="value">{{ day.report.number_purchases || '—' }}</p>
                        </div>
                        <div class="wrapper">
                            <p class="label">Касса</p>
                            <p class="value">{{ day.report.cash_register || '—' }}</p>
                        </div>
                    </template>

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

    day.report = await $api.get(`/report?date=${date}`).then(res => res.data ||
    {
        cash: null,
        non_cash: null,
        total: null,
        number_purchases: null,
        cash_register: null
    }).catch(() => null)
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

useHead({
    title: 'Отчетность — Кения',
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
            font-weight: 600
    .today-table
        display: flex
        flex-direction: column
        // gap: 10px
        margin: 40px 0
        .line
            display: grid
            grid-template-columns: 1fr 170px 20px
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
                font-size: 17px
                border-radius: 4px
                font-weight: 600
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
        display: grid
        grid-template-columns: 1fr auto
        padding: 20px 0
        border-bottom: 1px solid var(--main-dark)
        &_opened
            .arrow-down
                transform: rotate(180deg)
        .title
            font-size: 1rem
        .arrow-down
            width: 14px
            align-self: center
            height: 14px
        .inner
            grid-column: 1/3
            margin: 10px 0
            margin-top: 35px
            display: flex
            flex-direction: column
            gap: 10px
            .wrapper
                display: grid
                grid-template-columns: 1fr auto
                font-size: 15px
                .label
                    color: var(--text-color)
                    opacity: .8
                .value
                    margin: 0 20px
                    font-weight: 600
                    font-family: serif

            .empty
                color: var(--text-color)
                    
        &:first-child
            border-top: 1px solid var(--main-dark)

@media only screen and (min-width: $bp-tablet)
    .reporting-page
        .container
            margin-top: 20px
            .title
                font-size: 18px
                padding: 14px 0
        .today-table
            // max-width: 80vw
            // margin: 50px auto
            margin-left: 40px
            margin-right: 40px
            .line
                grid-template-columns: 1fr 300px 20px
                .text
                    font-size: 18px
                .input
                    height: 50px
                    font-size: 20px
        .day-wrapper
            padding: 30px 40px
            .inner
                .wrapper
                    font-size: 1rem
                    .value
                        margin-right: 0
@media only screen and (min-width: $bp-tablet-landscape-up)
    .reporting-page
        .container
            margin-top: 20px
            .title
                font-size: 19px
        .today-table
            margin: 30px 0
            .line
                gap: 20px
                padding: 10px 0
                .text
                    font-size: 1rem
                .input
                    height: 40px
        .border-line
            height: 15px
        .day-wrapper
            padding: 20px 0
            .title
                font-size: 19px

@media only screen and (min-width: $bp-pc)
    .reporting-page
        padding: 40px 0
        .container
            margin-top: 20px
            .title
                font-size: 18px
                padding: 14px 0
                
        .today-table
            max-width: 800px
            // margin: 50px auto
            .line
                grid-template-columns: 1fr 300px 20px
                .text
                    font-size: 18px
                .input
                    height: 50px
                    font-size: 20px
        .day-wrapper
            padding: 30px 0
            .inner
                width: 50%
                .wrapper
                    font-size: 19px
                    .value
                        margin-right: 0
            .arrow-down
                width: 18px 
                height: 18px
</style>