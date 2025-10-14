<template>
    <div v-if="visible" class="modal-overlay" @click.self="close">
        <div class="modal">
            <h3>Выберите диапазон дат</h3>
            <vue-date-picker v-model="dateRange" range locale="ru" format="dd.MM.yyyy" :enable-time-picker="false"
                @update:model-value="onDateSelect" />
            <button @click="close">Отмена</button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const props = defineProps({
    visible: Boolean
})
const emits = defineEmits(['close', 'datesSelected'])

const dateRange = ref([])

function close() {
    emits('close')
}

function onDateSelect(value) {
    if (value && value.length === 2) {
        emits('datesSelected', value)
        close()
    }
}
</script>

<style lang="sass" scoped>
.modal-overlay
    position: fixed
    top: 0
    left: 0
    width: 100%
    height: 100%
    background: rgba(0, 0, 0, 0.5)
    display: flex
    align-items: center
    justify-content: center
    z-index: 1000

.modal
    background: #fff
    border-radius: 10px
    padding: 20px
    width: 300px
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2)

    h3
        margin-bottom: 10px
        font-size: 18px
        text-align: center

    button
        margin-top: 15px
        width: 100%
        padding: 8px 12px
        background: #eee
        border: none
        border-radius: 5px
        cursor: pointer
        font-size: 14px

        &:hover
            background: #ddd
</style>
