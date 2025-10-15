<template>
    <div class="analysis page-padding">
        <div class="page-content content">
            <div class="h1-wrapper">
                <ui-go-back />
                <h1 class="h1">Аналитика.</h1>

                <div class="period-filters">
                    <button class="btn" @click="commonFilters.dates.custom = 'week'"
                        :class="commonFilters.dates.custom === 'week' ? 'el-active' : 'el-unactive'">7 дней</button>
                    <button class="btn" @click="commonFilters.dates.custom = 'month'"
                        :class="commonFilters.dates.custom === 'month' ? 'el-active' : 'el-unactive'">30 дней</button>
                    <button class="btn" @click="commonFilters.dates.custom = 'quarter'"
                        :class="commonFilters.dates.custom === 'quarter' ? 'el-active' : 'el-unactive'">90 дней</button>
                    <button class="btn el-unactive"
                        :class="commonFilters.dates.from && commonFilters.dates.to ? 'el-active' : 'el-unactive'"
                        @click="showDatesModal = true">
                        {{ commonFilters.dates.from && commonFilters.dates.to ?
                            `${commonFilters.dates.from} - ${commonFilters.dates.to}` :
                            'Выбрать даты'
                        }}
                    </button>
                </div>
            </div>

            <div class="wrapper terminal-wrapper">
                <p class="title">Устройства.</p>

                <div class="devices">
                    <div class="device" v-for="device in data.devices.items" @click="toggleDeviceInFilters(device)"
                        :class="{ 'device_active': receiptFilters.devices.includes(device.serialNumber) }">
                        <img src="@/assets/images/icons/shop-location.svg" alt="" class="icon">
                        <p class="text">{{ device.shop.address?.data?.street || device.shop.name }}</p>
                    </div>
                </div>
            </div>

            <div class="wrapper numbers-wrapper" v-if="data.stats">
                <p class="title">Числа. <span class="icon refresh-icon" @click="refreshStats"></span></p>

                <div class="numbers">
                    <div class="num-wrapper">
                        <p class="num">{{ simplePrice(data.stats.dayRevenue) }}</p>
                        <p class="text">выручка за сегодня (static)</p>
                    </div>
                    <div class="num-wrapper">
                        <p class="num num-prefix">{{ simplePrice(data.stats.revenue) }} <span class="prefix">р.</span>
                        </p>
                        <p class="text">пришло за {{ getWordPeriod(receiptFilters.dates) }}</p>
                    </div>
                    <div class="num-wrapper">
                        <p class="num num-prefix">{{ data.stats.avgCheck }}<span class="prefix">р.</span></p>
                        <p class="text">средний чек</p>
                    </div>
                    <div class="num-wrapper">
                        <p class="num">{{ simplePrice(data.stats.receiptsCount) }}</p>
                        <p class="text">покупок</p>
                    </div>

                </div>
            </div>

            <div class="wrapper charts-wrapper">
                <p class="title">Графики.</p>
                <graphs />
            </div>

            <div class="receipts">
                <span class="count">Всего {{ data.receipts.pagination.total }} чека (за {{
                    getWordPeriod(receiptFilters.dates) }})</span>
                <div class="receipt" v-for="receipt in data.receipts.items" :key="receipt.raw.id"
                    :class="{ 'receipt_is_new': receipt.is_new }">
                    <span class="date">{{ getShortDateTime(receipt.processedAtRaw) }}</span>


                    <p class="cashier">{{ receipt.raw.cashier.name }} <img src="@/assets/images/icons/nice-icon.svg"
                            alt="" class="icon"></p>
                    <p class="coffee-address">{{ receipt.raw.content.settlementAddress }}</p>

                    <div class="products">
                        <div class="product" v-for="product in receipt.raw.content.positions" :key="product.id">
                            <span class="count">x{{ product.quantity }}</span>
                            <p class="name">{{ product.text }}</p>
                            <p class="price"><span class="discount"
                                    v-if="product.discountMoney || product.discountPercent">Скидка {{
                                        product.discountMoney + 'руб.' || product.discountPercent + '%'
                                    }}</span>{{ product.price }} руб.</p>

                        </div>
                    </div>
                    <div class="final-sum">
                        <p class="sum">{{ receipt.raw.amount }} руб.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- // MODALS -->

        <ui-datepicker-modal :visible="showDatesModal" @close="showDatesModal = false" @datesSelected="handleDates" />
    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import dayjs from 'dayjs'
import throttle from 'lodash/throttle';
const { $api } = useNuxtApp()

const stopPaginate = ref(false)
const throttledCheckPosition = throttle(checkPosition, 250);
const scrollContainer = ref(null)
const showDatesModal = ref(false)

// =============== MAIN DATA ===============
const data = ref({
    devices: {
        items: [],
        error: ''
    },

    receipts: {
        items: [],
        pagination: {},
        error: ''
    },

    stats: null,
})

// =============== FILTERS ===============
const receiptsPage = ref(1)
const receiptsPageSize = 20

const commonFilters = ref({
    dates: { from: '', to: '', custom: 'month' } // custom may be week, month, quarter
})

const receiptFilters = ref({
    devices: [],
    dates: computed(() => commonFilters.value.dates)
})

const handleDates = (dates) => {
    console.log(dates);
    const TZ = 'Asia/Yekaterinburg'
    commonFilters.value.dates = {
        from: dayjs(dates[0]).tz(TZ).format('DD.MM.YYYY'),
        to: dayjs(dates[1]).tz(TZ).format('DD.MM.YYYY')
    }
    console.log(commonFilters.value);
}

watch(commonFilters, () => {

}, { deep: true })


// =============== FUNCTIONS ===============
const getDevices = async () => {
    await $api.get(`/aqsi/get-devices`).then(res => {
        data.value.devices.items = res.data.rows || []
    }).catch(e => {
        data.value.devices.error = e.response || e
    })
    console.log(data.value.devices.items);

    data.value.devices.items.forEach(async (device) => {
        device.shop = await $api.get(`/aqsi/shops/${device.shop.id}`).then(res => res.data)
    })
}
const getReceipts = async () => {
    await $api.get(`/aqsi/get-receipts?page=${receiptsPage.value}&page_size=${receiptsPageSize}&${toQueryString(receiptFilters.value)}`).then(res => {

        if (res.data.receipts?.length) {
            if (receiptsPage.value !== 1 && data.value.receipts.items?.length) {
                data.value.receipts.items.push(...res.data.receipts)
            } else {
                data.value.receipts.items = res.data.receipts
            }
        }

        data.value.receipts.pagination = res.data?.pagination || null
    }).catch(e => {
        data.value.receipts.error = e
    })
}
const getStats = async () => {
    data.value.stats = await $api.get(`/aqsi/get-stats?${toQueryString(receiptFilters.value)}`).then(res => res.data).catch(() => null)
}

const refreshStats = async () => {
    await $api.post(`/aqsi/reset-stats`)
    await getStats()
}

const simplePrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price)
}

const toggleDeviceInFilters = (device) => {
    if (receiptFilters.value.devices.includes(device.serialNumber)) {
        receiptFilters.value.devices = receiptFilters.value.devices.filter(serialNumber => serialNumber !== device.serialNumber)
    } else {
        receiptFilters.value.devices.push(device.serialNumber)
    }
}

const getWordPeriod = (dates) => {
    if (dates.custom === 'week') {
        return 'неделю'
    }
    if (dates.custom === 'month') {
        return 'месяц'
    }
    if (dates.custom === 'quarter') {
        return 'квартал'
    }
    return 'период ' + dates.from + '—' + dates.to
}

watch(receiptFilters, async () => {
    receiptsPage.value = 1
    document.querySelector('.receipts').scrollTo(0, 0)

    let dates = commonFilters.value.dates
    if (dates.custom) {
        dates.from = ''
        dates.to = ''
    }
    // receiptFilters.value.dates = dates


    await getStats()
    await getReceipts()
}, { deep: true })

const initWs = () => {
    const url = useRuntimeConfig().public.ws_address

    const ws = new WebSocket(`${url}/receipts`)
    console.log(ws);


    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        console.log(msg);

        if (msg.type === 'new_receipts') {
            console.log('=========== НОВЫЕ ЧЕКИ ===========');

            let newReceipts = msg.payload.map(receipt => ({
                ...receipt,
                is_new: true
            }));

            data.value.receipts.items.unshift(...newReceipts)

        }
    }
}

onMounted(async () => {
    await getDevices()
    await getReceipts()
    await getStats()

    scrollContainer.value = document.querySelector('.receipts')
    console.log(scrollContainer.value);

    if (scrollContainer.value) {
        scrollContainer.value.addEventListener('scroll', throttledCheckPosition);
    }

    initWs()
})

onUnmounted(() => {
    if (scrollContainer.value) {
        scrollContainer.value.removeEventListener('scroll', throttledCheckPosition);
    }
})


async function checkPosition() {
    if (!scrollContainer.value) return;

    const scrollTop = scrollContainer.value.scrollTop;
    const clientHeight = scrollContainer.value.clientHeight;
    const scrollHeight = scrollContainer.value.scrollHeight;
    const threshold = scrollHeight - clientHeight / 4;
    const position = scrollTop + clientHeight;

    if (position >= threshold && !stopPaginate.value) {
        receiptsPage.value += 1;
        await getReceipts();
    }
}

useHead({
    title: 'Аналитика — Keния',
})

</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
.analysis
    overflow-y: auto
    padding-bottom: 0 !important
    .h1-wrapper
        .period-filters
            grid-column: 1/3
            display: grid
            grid-template-columns: 1fr 1fr
            grid-gap: 4px 6px
            .btn
                font-size: 12px
                padding: 10px
                border-radius: 3px
                color: var(--text-color)
                font-weight: 400
                    
    .wrapper
        margin: 22px 0
        .title
            display: flex
            align-items: center
            gap: 14px
            font-size: 14px
            font-weight: 600
            padding-bottom: 10px
            border-bottom: 1px solid var(--border-color)
            .refresh-icon
                mask: url(@/assets/images/icons/refresh.svg) no-repeat center
                background-color: var(--creme-color)
                display: block
                width: 16px
                height: 16px
                cursor: pointer
        .devices
            display: grid
            grid-template-columns: 1fr 1fr
            margin-top: 20px
            gap: 10px
            .device
                display: flex
                flex-wrap: wrap
                gap: 4px 7px
                padding: 12px 8px 
                background-color: rgba(#ca9279, .5)
                border-radius: 4px
                transition: .3s ease
                cursor: pointer
                &_active
                    opacity: 1
                    background-color: rgba(#ca9279, 1)
            .icon
                width: 24px
                height: 27px
            .text
                font-size: 14px
    .grid-4
        display: grid
        grid-template-columns: 1fr 1fr
        grid-gap: 20px
    .receipts
        display: flex
        flex-direction: column
        gap: 7px
        max-height: 100vh
        overflow: auto
        padding-bottom: 60px
        padding: 16px 10px
        margin-top: 20px
        .count
            font-size: 14px
            font-weight: 500
            color: var(--border-color)
        .receipt
            background-color: rgba(#bfa89b, .2)
            padding: 12px 20px
            display: grid
            grid-template-areas: 'date sum' 'products products' 'address address' 'cashier cashier'
            grid-template-columns: 1fr auto
            grid-gap: 10px 
            font-size: 14px
            // box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px
            border-radius: 8px
            &_is_new
                animation: new-element 3s ease-out
                
            .date
                color: var(--border-color)
                font-weight: 600
                font-family: sans-serif
                grid-area: date
            .cashier
                display: grid
                grid-template-columns:  1fr 10px
                align-items: center
                gap: 7px
                font-size: 12px
                color: var(--border-color)
                grid-area: cashier
            .coffee-address
                grid-area: address
                color: var(--border-color)
            .final-sum
                grid-area: sum
                text-align: right
                margin: 10px 0
                // margin-bottom: 5px
                .sum
                    // font-family: sans-serif
                    font-size: 16px
                    font-weight: 600
                    color: var(--green-color)
            .products
                grid-area: products
                display: flex
                flex-direction: column
                .product
                    padding: 6px 0
                    font-size: 14px
                    border-top: 1px solid var(--border-color)
                    display: grid
                    grid-template-columns: auto 1fr 100px
                    grid-gap: 14px
                    font-family: sans-serif
                    .name
                        font-weight: 500
                    .price
                        text-align: right
                        font-size: 12px
                        font-weight: 500
                        font-family: sans-serif
    .numbers-wrapper
        .numbers
            display: grid
            grid-template-columns: 1fr 1fr
            grid-gap: 20px
            margin-top: 20px
            .num-wrapper
                display: flex
                flex-direction: column
                // align-items: center
                .num
                    font-family: "Mozilla Text"
                    font-size: 28px
                    font-weight: 800
                    color: var(--green-color)
                    // &-prefix
                    //     margin-left: 16px
                    .prefix
                        font-size: 20px
                        margin-left: 5px
                .text
                    font-size: 14px
@media only screen and (min-width: $bp-tablet)
    .analysis
        .h1-wrapper
            grid-template-columns:  1fr auto
            .period-filters
                grid-column: unset
                display: grid
                grid-template-columns: repeat(4, auto)
                grid-gap: 4px 6px
                .btn
                    font-size: 14px
                    max-width: 150px
                    padding: 10px
                    border-radius: 3px
                    color: var(--text-color)
                    font-weight: 500
        .wrapper
            margin: 40px 0
            .title
                font-size: 18px
            .devices
                grid-template-columns: repeat(3, 1fr)
                .device
                    grid-gap: 8px 12px
                    padding: 16px
        .numbers-wrapper
            .numbers
                grid-template-columns: 1fr 1fr 1fr
                grid-gap: 30px 20px
                margin-top: 20px
                .num-wrapper
                    .num
                        font-size: 34px
                        font-weight: 800
                        color: var(--green-color)
                        // &-prefix
                        //     margin-left: 16px
                        .prefix
                            font-size: 20px
                            margin-left: 5px
                    .text
                        font-size: 18px
        .receipts
            gap: 10px
            .receipt
                padding: 20px 30px
                font-size: 1rem
                grid-template-areas: 'date sum' 'products products' 'address cashier' 
                .cashier
                    font-size: 14px
                    grid-template-columns:  auto 1fr
                    img
                        width: 12px
                .final-sum
                    // margin-top: 20px
                    margin-top: 0
                    .sum
                        font-size: 24px
                .products
                    .product
                        padding: 10px 0
                        font-size: 18px
                        grid-template-columns: auto 1fr 100px
        
@media only screen and (min-width: $bp-tablet-landscape-up)
    .analysis
        .wrapper
            margin: 20px 0
            .title
                font-size: 16px
            .devices
                grid-template-columns: repeat(3, 1fr)
                .device
                    grid-gap: 8px 10px
                    padding: 14px
                    font-size: 14px
        .numbers-wrapper
            .numbers
                grid-template-columns: 1fr 1fr 
                grid-gap: 30px 20px
                margin-top: 20px
                .num-wrapper
                    .num
                        font-size: 28px
                        font-weight: 800
                        color: var(--green-color)
                        // &-prefix
                        //     margin-left: 16px
                        .prefix
                            font-size: 20px
                            margin-left: 5px
                    .text
                        font-size: 16px
        .receipts
            gap: 10px
            .receipt
                padding: 14px 30px
                font-size: 14px
                .date
                    font-size: 13px
                .cashier
                    font-size: 14px
                .final-sum
                    margin-top: 5px
                    .sum
                        font-size: 18px
                .products
                    .product
                        padding: 10px 0
                        font-size: 14px
                        grid-template-columns: auto 1fr 100px
@media only screen and (min-width: $bp-pc)
    .analysis
        .page-content
            display: grid
            grid-template-columns: 2fr 5fr
            grid-template-areas: 'h1 h1' 'devices numbers' 'charts charts' 'receipts receipts'
            grid-gap: 0px 70px
        .h1-wrapper
            grid-area: h1
        .terminal-wrapper
            grid-area: devices
        .numbers-wrapper
            grid-area: numbers
        .charts-wrapper
            grid-area: charts
        .receipts
            grid-area: receipts
        .wrapper
            margin: 20px 0
            .title
                font-size: 16px
            .devices
                display: flex
                flex-direction: column
                .device
                    grid-gap: 8px 10px
                    padding: 14px
                    font-size: 16px
        .numbers-wrapper
            .numbers
                grid-template-columns: 1fr 1fr 
                grid-gap: 20px 20px
                margin-top: 20px
                .num-wrapper
                    .num
                        font-size: 36px
                        font-weight: 800
                        color: var(--green-color)
                        // &-prefix
                        //     margin-left: 16px
                        .prefix
                            font-size: 20px
                            margin-left: 5px
                    .text
                        font-size: 16px
        .receipts
            gap: 10px
            width: 70%
            // margin: 0 auto
            margin-top: 60px
            .receipt
                padding: 26px 32px
                font-size: 16px
                grid-template-areas: 'date address cashier' 'products products sum'
                grid-template-columns: auto 1fr auto
                grid-gap: 20px
                .date
                    font-size: 14px
                .cashier
                    font-size: 16px
                .final-sum
                    margin: 0
                    margin-top: 5px
                    align-self: flex-end
                    justify-self: end
                    .sum
                        font-size: 24px
                .products
                    width: 90%
                    .product
                        padding: 10px 0
                        font-size: 16px
                        grid-template-columns: auto 1fr 100px   
                        .name
                            font-weight: 600
</style>