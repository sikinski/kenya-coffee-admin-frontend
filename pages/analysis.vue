<template>
    <div class="analysis page-padding">
        <div class="page-content content">
            <div class="h1-wrapper">
                <ui-go-back />
                <h1 class="h1">Аналитика.</h1>
            </div>

            <div class="wrapper terminal-wrapper">
                <p class="title">Устройства</p>

                <div class="devices">
                    <div class="device" v-for="device in data.devices.items" @click="toggleDeviceInFilters(device)"
                        :class="{ 'device_active': receiptFilters.devices.includes(device.id) }">
                        <img src="@/assets/images/icons/terminal.svg" alt="" class="icon">
                        <span class="id">{{ device.id }}</span>
                        <p class="text">Добавить адрес</p>

                        <p class="activation-date">{{ getShortDate(device.activationDate) }}</p>
                    </div>
                </div>
            </div>

            <div class="grid-4">
                <div class="wrapper">
                    <p class="title">График 1</p>


                </div>

                <div class="wrapper">
                    <p class="title">хз</p>

                </div>

                <div class="wrapper">
                    <p class="title">Числа</p>


                </div>

                <div class="wrapper">
                    <p class="title">Диаграма 1</p>


                </div>
            </div>

            <div class="receipts">
                <div class="receipt" v-for="reciept in data.receipts.items" :key="reciept.raw.id">
                    <span class="date">{{ getShortDateTime(reciept.processedAt) }}</span>


                    <p class="cashier">{{ reciept.raw.cashier.name }} <img src="@/assets/images/icons/nice-icon.svg"
                            alt="" class="icon"></p>
                    <p class="coffee-address">{{ reciept.raw.content.settlementAddress }}</p>

                    <div class="products">
                        <div class="product" v-for="product in reciept.raw.content.positions" :key="product.id">
                            <span class="count">x{{ product.quantity }}</span>
                            <p class="name">{{ product.text }}</p>
                            <p class="price"><span class="discount"
                                    v-if="product.discountMoney || product.discountPercent">Скидка {{
                                        product.discountMoney + 'руб.' || product.discountPercent + '%'
                                    }}</span>{{ product.price }} руб.</p>

                        </div>
                    </div>
                    <div class="final-sum">
                        <p class="sum">{{ reciept.raw.amount }} руб.</p>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import throttle from 'lodash/throttle';
const { $api } = useNuxtApp()

const stopPaginate = ref(false)
const throttledCheckPosition = throttle(checkPosition, 250);
const scrollContainer = ref(null)



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
    }
})

// =============== FILTERS ===============
const receiptFilters = ref({
    page: 1,
    page_size: 20,
    devices: []
    // Позже добавлю остальные по необходимости.
})


// =============== FUNCTIONS ===============
const getDevices = async () => {
    await $api.get(`/aqsi/get-devices`).then(res => {
        data.value.devices.items = res.data.rows || []
    }).catch(e => {
        data.value.devices.error = e.response || e
    })
}
const getReceipts = async () => {
    await $api.get(`/aqsi/get-receipts${toQueryString(receiptFilters.value)}`).then(res => {

        if (res.data.receipts?.length) {
            if (receiptFilters.value.page !== 1 && data.value.receipts.items?.length) {
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

const toggleDeviceInFilters = (device) => {
    let devicesArray = receiptFilters.value.devices
    console.log(devicesArray);
    console.log(devicesArray.includes(device.id))

    if (devicesArray.includes(device.id)) {
        receiptFilters.value.devices = devicesArray.filter(id => id !== device.id)
    } else {
        devicesArray.push(device.id)
    }
}

onMounted(async () => {
    await getDevices()
    await getReceipts()

    scrollContainer.value = document.querySelector('.receipts')
    console.log(scrollContainer.value);

    if (scrollContainer.value) {
        scrollContainer.value.addEventListener('scroll', throttledCheckPosition);
    }
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
        receiptFilters.value.page += 1;
        await getReceipts();
    }
}

useHead({
    title: 'Аналитика — Keния',
})
// 
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
.analysis
    overflow-y: auto
    padding-bottom: 0 !important
    .wrapper
        margin: 22px 0
        .title
            font-size: 14px
            font-weight: 600
            padding-bottom: 10px
            border-bottom: 1px solid var(--border-color)
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
                background-color: var(--creme-color)
                opacity: .6
                border-radius: 4px
                transition: .3s ease
                cursor: pointer
                &_active
                    opacity: 1
            .icon
                width: 28px
                height: 30px
            .activation-date
                // color: var(--border-color)
                width: 100%
                text-align: right
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
        .receipt
            background-color: var(--block-bg)
            padding: 12px 20px
            display: grid
            grid-template-areas: 'date sum' 'products products' 'address address' 'cashier cashier'
            grid-template-columns: 1fr auto
            grid-gap: 10px 
            font-size: 14px
            box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px
            border-radius: 8px
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
                    color: #228B22
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
@media only screen and (min-width: $bp-tablet)
    .analysis
        .wrapper
            margin: 40px 0
            .title
                font-size: 18px
            .devices
                grid-template-columns: repeat(3, 1fr)
                .device
                    grid-gap: 8px 12px
                    padding: 16px
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
        .wrapper
            margin: 20px 0
            .title
                font-size: 16px
            .devices
                grid-template-columns: repeat(4, 1fr)
                .device
                    grid-gap: 8px 10px
                    padding: 14px
                    font-size: 16px
        .receipts
            gap: 10px
            width: 70%
            // margin: 0 auto
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