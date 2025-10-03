<template>
    <div class="analysis page-padding">
        <div class="content">
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
                <div class="receipt" v-for="reciept in data.receipts.items" :key="reciept.id">
                    <span class="date">{{ getShortDateTime(reciept.processedAt) }}</span>
                    {{ toChelyabinskTime(reciept.processedAt) }}

                    <p class="cashier">{{ reciept.cashier_name }} <img src="@/assets/images/icons/nice-icon.svg" alt=""
                            class="icon"></p>
                    <p class="coffee-address">{{ reciept.settlementAddress }}</p>

                    <div class="products">
                        <div class="product" v-for="product in reciept.positions" :key="product.id">
                            <span class="count">x{{ product.quantity }}</span>
                            <p class="name">{{ product.text }}</p>
                            <p class="price"><span class="discount"
                                    v-if="product.discountMoney || product.discountPercent">Скидка {{
                                        product.discountMoney + 'руб.' || product.discountPercent + '%'
                                    }}</span>{{ product.price }} руб.</p>

                        </div>
                    </div>
                    <div class="final-sum">
                        <!-- <p class="count">{{ reciept.positions.length }} шт.</p> -->
                        <p class="sum">{{ reciept.amount }} руб.</p>
                    </div>
                </div>
            </div>



        </div>

    </div>
</template>

<script setup>
import { onMounted } from 'vue';
const { $api } = useNuxtApp()
function toChelyabinskTime(dateString) {
    // создаём объект даты из ISO-строки
    const date = new Date(dateString);

    // смещаем на +5 часов к UTC
    const chelyabinskOffset = 5 * 60; // в минутах
    const utcOffset = date.getTimezoneOffset(); // в минутах (например -180 для +3)
    const diff = chelyabinskOffset + utcOffset;

    const localDate = new Date(date.getTime() + diff * 60000);

    return localDate.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
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
        data.value.receipts.items = res.data.receipts || []
        data.value.receipts.pagination = res.data.pagination
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
})
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
.analysis
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
                &_active
                    opacity: 1
            .icon
                width: 28px
                height: 30px
            .activation-date
                color: var(--border-color)
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
        .receipt
            background-color: var(--block-bg)
            padding: 12px 20px
            display: grid
            grid-template-areas: 'date cashier' 'address address'  'products products' 'sum sum'
            grid-template-columns: 1fr auto
            grid-gap: 10px 
            font-size: 14px
            box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px
            border-radius: 8px
            .date
                color: var(--border-color)
                font-weight: 600
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
            .final-sum
                grid-area: sum
                text-align: right
                margin: 10px 0
                margin-bottom: 5px
                .sum
                    font-family: sans-serif
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
                    border-top: 1px solid var(--creme-color)
                    display: grid
                    grid-template-columns: auto 1fr 50px
                    grid-gap: 14px
                    .name
                        font-weight: 600

</style>