<template>
    <div class="analysis page-padding">
        <div class="page-content content">
            <!-- Header with title and period filters -->
            <div class="header-section">
                <div class="header-top">
                    <ui-go-back />
                    <h1 class="h1">Аналитика</h1>
                </div>
                <div class="period-filters">
                    <button class="filter-btn" @click="commonFilters.dates.custom = 'week'"
                        :class="commonFilters.dates.custom === 'week' ? 'filter-btn_active' : ''">7 дней</button>
                    <button class="filter-btn" @click="commonFilters.dates.custom = 'month'"
                        :class="commonFilters.dates.custom === 'month' ? 'filter-btn_active' : ''">30 дней</button>
                    <button class="filter-btn" @click="commonFilters.dates.custom = 'quarter'"
                        :class="commonFilters.dates.custom === 'quarter' ? 'filter-btn_active' : ''">90 дней</button>
                    <button class="filter-btn"
                        :class="commonFilters.dates.from && commonFilters.dates.to ? 'filter-btn_active' : ''"
                        @click="showDatesModal = true">
                        {{ commonFilters.dates.from && commonFilters.dates.to ?
                            `${commonFilters.dates.from} - ${commonFilters.dates.to}` :
                            'Выбрать даты'
                        }}
                    </button>
                </div>
            </div>

            <!-- Devices/Stores Section -->
            <div class="devices-section" v-if="data.devices.items.length">
                <div class="section-title">Устройства</div>
                <div class="devices-grid">
                    <div class="device-card" v-for="device in data.devices.items" @click="toggleDeviceInFilters(device)"
                        :class="{ 'device-card_active': receiptFilters.devices.includes(device.serialNumber) }">
                        <img src="@/assets/images/icons/shop-location.svg" alt="" class="device-icon">
                        <span class="device-text">{{ device.shop.address?.data?.street || device.shop.name }}</span>
                    </div>
                </div>
            </div>

            <!-- Metrics Cards -->
            <div class="metrics-section" v-if="data.stats">
                <div class="section-header">
                    <div class="section-title">Метрики</div>
                    <span class="refresh-icon" @click="refreshStats"></span>
                </div>
                <div class="metrics-grid">
                    <div class="metric-card metric-card_highlight">
                        <div class="metric-value">{{ simplePrice(data.stats.dayRevenue) }} <span
                                class="metric-currency">₽</span></div>
                        <div class="metric-label">Выручка за сегодня</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{{ simplePrice(data.stats.revenue) }} <span
                                class="metric-currency">₽</span></div>
                        <div class="metric-label">За {{ getWordPeriod(receiptFilters.dates) }}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{{ data.stats.avgCheck }}<span class="metric-currency">₽</span></div>
                        <div class="metric-label">Средний чек</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{{ simplePrice(data.stats.receiptsCount) }}</div>
                        <div class="metric-label">Покупок</div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-section">
                <div class="section-title">Графики</div>
                <graphs :filters="receiptFilters" />
            </div>

            <!-- Receipts List -->
            <div class="receipts-section">
                <div class="section-header">
                    <div class="section-title">Чеки</div>
                    <span class="receipts-count">Всего {{ data.receipts.pagination.total }} (за {{
                        getWordPeriod(receiptFilters.dates) }})</span>
                </div>
                <div class="receipts-list">
                    <div class="receipt-card" v-for="receipt in data.receipts.items" :key="receipt.raw.id"
                        :class="{ 'receipt-card_new': receipt.is_new }">
                        <div class="receipt-header">
                            <span class="receipt-date">{{ getShortDateTime(receipt.processedAtRaw) }}</span>
                            <div class="receipt-sum">{{ receipt.raw.amount }} ₽</div>
                        </div>
                        <div class="receipt-info">
                            <div class="receipt-cashier">
                                <img src="@/assets/images/icons/nice-icon.svg" alt="" class="cashier-icon">
                                <span>{{ receipt.raw.cashier.name }}</span>
                            </div>
                            <div class="receipt-address">{{ receipt.raw.content.settlementAddress }}</div>
                        </div>
                        <div class="receipt-products">
                            <div class="product-item" v-for="product in receipt.raw.content.positions"
                                :key="product.id">
                                <span class="product-quantity">×{{ product.quantity }}</span>
                                <span class="product-name">{{ product.text }}</span>
                                <div class="product-price">
                                    <span class="product-discount"
                                        v-if="product.discountMoney || product.discountPercent">
                                        Скидка {{ product.discountMoney + 'руб.' || product.discountPercent + '%' }}
                                    </span>
                                    <span>{{ product.price }} ₽</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

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
    background-color: var(--main-bg)
    min-height: 100vh

    .page-content
        display: flex
        flex-direction: column
        gap: 20px

    // Header Section
    .header-section
        margin-bottom: 8px
        .header-top
            display: flex
            align-items: center
            gap: 12px
            margin-bottom: 16px
        .h1
            font-size: 24px
            font-weight: 700
            color: var(--text-color)
            margin: 0

    // Period Filters
    .period-filters
        display: flex
        flex-wrap: wrap
        gap: 8px
        .filter-btn
            padding: 8px 16px
            border-radius: 20px
            border: 1px solid var(--border-color)
            background-color: #fff
            color: var(--text-color)
            font-size: 13px
            font-weight: 500
            cursor: pointer
            transition: all 0.2s ease
            white-space: nowrap
            &:hover
                border-color: var(--accent-red)
                color: var(--accent-red)
            &_active
                background-color: var(--accent-red)
                border-color: var(--accent-red)
                color: #fff

    // Section Styles
    .section-title
        font-size: 18px
        font-weight: 700
        color: var(--text-color)
        margin-bottom: 12px

    .section-header
        display: flex
        justify-content: space-between
        align-items: center
        margin-bottom: 12px
        .refresh-icon
            mask: url(@/assets/images/icons/refresh.svg) no-repeat center
            background-color: var(--accent-red)
            display: block
            width: 18px
            height: 18px
            cursor: pointer
            transition: transform 0.3s ease
            &:hover
                transform: rotate(180deg)
        .receipts-count
            font-size: 13px
            color: var(--text-light)
            font-weight: 400

    // Devices Section
    .devices-section
        .devices-grid
            display: grid
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr))
            gap: 10px
        .device-card
            display: flex
            align-items: center
            gap: 8px
            padding: 12px 14px
            background-color: var(--second-bg)
            border-radius: 12px
            cursor: pointer
            transition: all 0.2s ease
            border: 2px solid transparent
            &:hover
                background-color: #f0f0f0
            &_active
                background-color: rgba(232, 69, 32, 0.1)
                border-color: var(--accent-red)
        .device-icon
            width: 20px
            height: 20px
            flex-shrink: 0
        .device-text
            font-size: 13px
            color: var(--text-color)
            font-weight: 500
            overflow: hidden
            text-overflow: ellipsis
            white-space: nowrap

    // Metrics Section
    .metrics-section
        .metrics-grid
            display: grid
            grid-template-columns: repeat(2, 1fr)
            gap: 12px
        .metric-card
            background: linear-gradient(135deg, #fff 0%, #fafafa 100%)
            border-radius: 16px
            padding: 16px
            border: 1px solid var(--border-color)
            transition: all 0.2s ease
            &:hover
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)
            &_highlight
                background: linear-gradient(135deg, rgba(232, 69, 32, 0.05) 0%, rgba(232, 69, 32, 0.02) 100%)
                border-color: rgba(232, 69, 32, 0.3)
        .metric-value
            font-size: 24px
            font-weight: 700
            color: var(--accent-red)
            margin-bottom: 6px
            line-height: 1.2
            .metric-currency
                font-size: 18px
                font-weight: 600
        .metric-label
            font-size: 12px
            color: var(--text-secondary)
            font-weight: 500

    // Charts Section
    .charts-section
        margin-top: 8px

    // Receipts Section
    .receipts-section
        .receipts-list
            display: flex
            flex-direction: column
            gap: 12px
            max-height: none
            overflow: visible
        .receipt-card
            background-color: #fff
            border-radius: 12px
            padding: 16px
            border: 1px solid var(--border-color)
            transition: all 0.2s ease
            &:hover
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06)
            &_new
                animation: new-element 3s ease-out
                border-color: var(--green-color)
        .receipt-header
            display: flex
            justify-content: space-between
            align-items: center
            margin-bottom: 12px
            padding-bottom: 12px
            border-bottom: 1px solid var(--border-color)
        .receipt-date
            font-size: 12px
            color: var(--text-light)
            font-weight: 500
        .receipt-sum
            font-size: 18px
            font-weight: 700
            color: var(--green-color)
        .receipt-info
            display: flex
            flex-direction: column
            gap: 6px
            margin-bottom: 12px
        .receipt-cashier
            display: flex
            align-items: center
            gap: 6px
            font-size: 13px
            color: var(--text-color)
            font-weight: 500
        .cashier-icon
            width: 14px
            height: 14px
        .receipt-address
            font-size: 12px
            color: var(--text-secondary)
        .receipt-products
            display: flex
            flex-direction: column
            gap: 8px
            padding-top: 12px
            border-top: 1px solid var(--border-color)
        .product-item
            display: grid
            grid-template-columns: auto 1fr auto
            gap: 12px
            align-items: center
            font-size: 13px
        .product-quantity
            color: var(--text-light)
            font-weight: 500
        .product-name
            color: var(--text-color)
            font-weight: 500
        .product-price
            text-align: right
            color: var(--text-color)
            font-weight: 600
        .product-discount
            display: block
            font-size: 11px
            color: var(--accent-red)
            font-weight: 500
            margin-bottom: 2px
@media only screen and (min-width: $bp-tablet)
    .analysis
        .page-content
            gap: 24px
        .header-section
            .h1
                font-size: 28px
            .period-filters
                gap: 10px
                .filter-btn
                    font-size: 14px
                    padding: 10px 20px
        .section-title
            font-size: 20px
        .devices-section
            .devices-grid
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))
                gap: 12px
            .device-card
                padding: 14px 16px
            .device-text
                font-size: 14px
        .metrics-section
            .metrics-grid
                grid-template-columns: repeat(2, 1fr)
                gap: 16px
            .metric-card
                padding: 20px
            .metric-value
                font-size: 28px
                .metric-currency
                    font-size: 20px
            .metric-label
                font-size: 13px
        .receipts-section
            .receipt-card
                padding: 20px
            .receipt-sum
                font-size: 20px
            .receipt-cashier
                font-size: 14px
            .receipt-address
                font-size: 13px
            .product-item
                font-size: 14px

@media only screen and (min-width: $bp-tablet-landscape-up)
    .analysis
        .page-content
            gap: 28px
        .header-section
            .h1
                font-size: 32px
        .devices-section
            .devices-grid
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))
        .metrics-section
            .metrics-grid
                grid-template-columns: repeat(4, 1fr)
                gap: 16px
            .metric-value
                font-size: 32px
                .metric-currency
                    font-size: 24px
            .metric-label
                font-size: 14px
        .receipts-section
            .receipt-card
                padding: 24px

@media only screen and (min-width: $bp-pc)
    .analysis
        .page-content
            display: grid
            grid-template-columns: 1fr
            grid-template-areas: 'header' 'devices' 'metrics' 'charts' 'receipts'
            gap: 32px
            max-width: 1400px
        .header-section
            grid-area: header
        .devices-section
            grid-area: devices
            .devices-grid
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))
        .metrics-section
            grid-area: metrics
            .metrics-grid
                grid-template-columns: repeat(4, 1fr)
                gap: 20px
            .metric-card
                padding: 24px
            .metric-value
                font-size: 36px
                .metric-currency
                    font-size: 28px
            .metric-label
                font-size: 15px
        .charts-section
            grid-area: charts
        .receipts-section
            grid-area: receipts
            .receipts-list
                display: grid
                grid-template-columns: 1fr
                gap: 16px
            .receipt-card
                padding: 24px 28px
            .receipt-sum
                font-size: 22px
            .product-item
                font-size: 15px
                gap: 16px

@media only screen and (min-width: $bp-large)
    .analysis
        .page-content
            max-width: 1800px
            gap: 40px
        .header-section
            .h1
                font-size: 36px
            .period-filters
                gap: 12px
                .filter-btn
                    font-size: 15px
                    padding: 12px 24px
        .section-title
            font-size: 22px
        .devices-section
            .devices-grid
                grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))
                gap: 16px
            .device-card
                padding: 18px 20px
            .device-text
                font-size: 15px
        .metrics-section
            .metrics-grid
                gap: 24px
            .metric-card
                padding: 32px
            .metric-value
                font-size: 42px
                .metric-currency
                    font-size: 32px
            .metric-label
                font-size: 16px
        .receipts-section
            .receipt-card
                padding: 28px 32px
            .receipt-sum
                font-size: 24px
            .product-item
                font-size: 16px
</style>