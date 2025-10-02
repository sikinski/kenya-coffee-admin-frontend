<template>
    <div class="analysis center content">
        Скоро здесь будут красивые графики ✨
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
const { $api } = useNuxtApp()

// =============== MAIN DATA ===============
const data = ref({
    devices: {
        items: [],
        error: ''
    },

    receipts: {
        items: [],
        error: ''
    }
})

// =============== FILTERS ===============
const receiptFilters = ref({
    page: 1,
    pageSize: 20,
    sorted: [{ id: 'createdAt', desc: false }],
    filtered: {
        operation: '', //  Операция Допустимые значения: "1", "2", "3", "4"; 1 - приход, 2 - возврат прихода, 3 - расход, 4 - возврат расхода
        search: '', // поиск по номеру чека или по номеру смены. Поисковая строка
        order: '', // Идентификатор заказа
        client: '', // Идентификатор  клиента
        shops: [], // Массив идентификаторов магазинов
        productName: '', // Название продукта
        beginAmount: '',
        endAmount: '',
        beginDate: '', // REQUIRED
        endDate: formatDateToISO(new Date())
    }
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
        data.value.receipts.items = res.data.rows || []
    }).catch(e => {
        data.value.receipts.error = e
    })
}

onMounted(async () => {
    await getDevices()

    // Ставим дату
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    // receiptFilters.value.filtered.beginDate = await formatDateToISO(monthAgo)
    receiptFilters.value.filtered.beginDate = monthAgo.toISOString()

    await getReceipts()
})
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
.analysis
    min-height: 50vh
    font-size: 18px
</style>