<template>
    <div class="contacts-page page-padding">
        <div class="content">
            <div class="header-section">
                <div class="h1-wrapper">
                    <ui-go-back />
                    <h1 class="h1">Контакты</h1>
                </div>
            </div>

            <div class="contacts-form-wrapper">
                <form class="contacts-form" @submit.prevent="saveContacts">
                    <div class="form-grid">
                        <!-- Телефон -->
                        <div class="form-field">
                            <label class="field-label">Телефон</label>
                            <input type="tel" class="input" v-model="contactsForm.phone" @input="handlePhoneInput"
                                placeholder="+7 (999) 123-45-67" />
                        </div>

                        <!-- Адрес -->
                        <div class="form-field">
                            <label class="field-label">Адрес</label>
                            <input type="text" class="input" v-model="contactsForm.address"
                                placeholder="г. Москва, ул. Примерная, д. 1" />
                        </div>

                        <!-- Ссылка на карты -->
                        <div class="form-field">
                            <label class="field-label">Ссылка на карты (2ГИС/Яндекс)</label>
                            <input type="url" class="input" v-model="contactsForm.mapLink"
                                placeholder="https://2gis.ru/..." />
                        </div>

                        <!-- График работы -->
                        <div class="form-field form-field-full">
                            <label class="field-label">График работы</label>
                            <div class="working-hours-list">
                                <div class="working-hours-item" v-for="(item, index) in contactsForm.workingHours"
                                    :key="index">
                                    <input type="text" class="input input-prefix" v-model="item.prefix"
                                        placeholder="пн-пт" />
                                    <input type="text" class="input input-time" v-model="item.value"
                                        placeholder="10:00-12:00" />
                                    <button type="button" class="remove-btn" @click="removeWorkingHours(index)"
                                        title="Удалить">
                                        <img src="@/assets/images/icons/close-round.svg" alt="" class="remove-icon">
                                    </button>
                                </div>
                                <button type="button" class="add-hours-btn" @click="addWorkingHours">
                                    <span class="plus-icon"></span>
                                    <span class="btn-text">Добавить период</span>
                                </button>
                            </div>
                        </div>

                        <!-- ВКонтакте -->
                        <div class="form-field">
                            <label class="field-label">ВКонтакте</label>
                            <input type="url" class="input" v-model="contactsForm.vkLink"
                                placeholder="https://vk.com/..." />
                        </div>

                        <!-- Telegram -->
                        <div class="form-field">
                            <label class="field-label">Telegram</label>
                            <input type="url" class="input" v-model="contactsForm.telegramLink"
                                placeholder="https://t.me/..." />
                        </div>

                        <!-- WhatsApp -->
                        <div class="form-field">
                            <label class="field-label">WhatsApp</label>
                            <input type="url" class="input" v-model="contactsForm.whatsappLink"
                                placeholder="https://wa.me/..." />
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="save-btn" :disabled="saving">
                            {{ saving ? 'Сохранение...' : 'Сохранить' }}
                        </button>
                    </div>

                    <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
                    <p class="success-message" v-if="successMessage">{{ successMessage }}</p>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'

const { $api } = useNuxtApp()

const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const contactsForm = ref({
    phone: '',
    address: '',
    mapLink: '',
    workingHours: [],
    vkLink: '',
    telegramLink: '',
    whatsappLink: ''
})

// Загрузка контактов
const loadContacts = async () => {
    try {
        const response = await $api.get('/contacts').then(res => res.data || {}).catch(() => ({}))
        if (response) {
            // Обработка workingHours - может быть массивом или строкой (для обратной совместимости)
            let workingHours = []
            if (response.workingHours || response.working_hours) {
                const wh = response.workingHours || response.working_hours
                if (Array.isArray(wh)) {
                    workingHours = wh
                } else if (typeof wh === 'string' && wh.trim()) {
                    // Если пришла строка, создаем один объект
                    workingHours = [{ prefix: '', value: wh }]
                }
            }

            // Форматируем телефон при загрузке
            const phone = response.phone || ''
            const formattedPhone = phone ? formatPhoneNumber(phone) : ''

            contactsForm.value = {
                phone: formattedPhone,
                address: response.address || '',
                mapLink: response.mapLink || response.map_link || '',
                workingHours: workingHours,
                vkLink: response.vkLink || response.vk_link || '',
                telegramLink: response.telegramLink || response.telegram_link || '',
                whatsappLink: response.whatsappLink || response.whatsapp_link || ''
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки контактов:', error)
        // Если контакты не найдены, это нормально - просто оставляем форму пустой
    }
}

// Добавление нового периода работы
const addWorkingHours = () => {
    contactsForm.value.workingHours.push({
        prefix: '',
        value: ''
    })
}

// Удаление периода работы
const removeWorkingHours = (index) => {
    contactsForm.value.workingHours.splice(index, 1)
}

// Обработка ввода телефона с форматированием
const handlePhoneInput = (event) => {
    const formatted = formatPhoneNumber(event.target.value)
    contactsForm.value.phone = formatted
}

// Сохранение контактов
const saveContacts = async () => {
    saving.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        // Фильтруем пустые элементы из workingHours
        const workingHours = contactsForm.value.workingHours
            .filter(item => item.prefix || item.value)
            .map(item => ({
                prefix: item.prefix || '',
                value: item.value || ''
            }))

        const data = {
            phone: contactsForm.value.phone || null,
            address: contactsForm.value.address || null,
            mapLink: contactsForm.value.mapLink || null,
            workingHours: workingHours.length > 0 ? workingHours : null,
            vkLink: contactsForm.value.vkLink || null,
            telegramLink: contactsForm.value.telegramLink || null,
            whatsappLink: contactsForm.value.whatsappLink || null
        }

        await $api.put('/contacts', data)

        successMessage.value = 'Контакты успешно сохранены!'
        setTimeout(() => {
            successMessage.value = ''
        }, 3000)
    } catch (error) {
        console.error('Ошибка сохранения контактов:', error)
        errorMessage.value = error.response?.data?.error || error.message || 'Ошибка сохранения контактов'
    } finally {
        saving.value = false
    }
}

onMounted(async () => {
    await loadContacts()
})

useHead({
    title: 'Контакты — Кения',
})
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *

.contacts-page
    background-color: var(--main-bg)
    min-height: 100vh

    .contacts-form-wrapper
        margin-top: 24px

    .contacts-form
        background-color: #fff
        border: 1px solid var(--border-color)
        border-radius: 12px
        padding: 20px
        display: flex
        flex-direction: column
        gap: 20px

        .form-grid
            display: grid
            grid-template-columns: 1fr
            gap: 16px

        .form-field
            display: flex
            flex-direction: column
            gap: 8px

            &.form-field-full
                grid-column: 1 / -1

            .field-label
                font-size: 13px
                font-weight: 600
                color: var(--text-color)
                text-transform: uppercase
                letter-spacing: 0.5px

            .input
                width: 100%
                padding: 12px 14px
                border: 1px solid var(--border-color)
                border-radius: 8px
                font-size: 14px
                background-color: #fff
                color: var(--text-color)
                transition: all 0.2s ease

                &:focus
                    outline: none
                    border-color: var(--accent-red)
                    box-shadow: 0 0 0 3px rgba(232, 69, 32, 0.1)

                &::placeholder
                    color: var(--text-secondary)
                    opacity: 0.7

        .working-hours-list
            display: flex
            flex-direction: column
            gap: 12px

            .working-hours-item
                display: grid
                grid-template-columns: 1fr 1fr auto
                gap: 10px
                align-items: center

                .input-prefix
                    min-width: 0

                .input-time
                    min-width: 0

                .remove-btn
                    background: none
                    border: none
                    cursor: pointer
                    padding: 6px
                    border-radius: 6px
                    display: flex
                    align-items: center
                    justify-content: center
                    transition: all 0.2s ease
                    flex-shrink: 0

                    &:hover
                        background-color: rgba(232, 69, 32, 0.1)

                    .remove-icon
                        width: 18px
                        height: 18px
                        opacity: 0.7
                        transition: opacity 0.2s ease

                    &:hover .remove-icon
                        opacity: 1

            .add-hours-btn
                display: flex
                align-items: center
                gap: 8px
                padding: 10px 16px
                background-color: var(--second-bg)
                border: 1px solid var(--border-color)
                border-radius: 8px
                font-size: 13px
                font-weight: 600
                color: var(--text-color)
                cursor: pointer
                transition: all 0.2s ease

                &:hover
                    border-color: var(--accent-red)
                    background-color: rgba(232, 69, 32, 0.05)

                .plus-icon
                    mask: url(@/assets/images/icons/plus.svg) no-repeat center
                    mask-size: contain
                    background-color: var(--accent-red)
                    width: 14px
                    height: 14px
                    flex-shrink: 0

                .btn-text
                    color: var(--text-color)

        .form-actions
            margin-top: 8px
            padding-top: 16px
            border-top: 1px solid var(--border-color)

            .save-btn
                width: 100%
                padding: 12px 24px
                background-color: var(--accent-red)
                color: #fff
                border: none
                border-radius: 8px
                font-size: 14px
                font-weight: 600
                cursor: pointer
                transition: all 0.2s ease

                &:hover:not(:disabled)
                    background-color: var(--accent-orange)
                    transform: translateY(-1px)
                    box-shadow: 0 4px 12px rgba(232, 69, 32, 0.3)

                &:disabled
                    opacity: 0.6
                    cursor: not-allowed

        .error-message
            color: var(--error-color)
            font-size: 13px
            font-weight: 500
            margin-top: 8px

        .success-message
            color: var(--green-color)
            font-size: 13px
            font-weight: 500
            margin-top: 8px

@media only screen and (min-width: $bp-tablet)
    .contacts-page
        .contacts-form
            padding: 24px
            gap: 24px

            .form-grid
                grid-template-columns: repeat(2, 1fr)
                gap: 20px

            .form-field
                .field-label
                    font-size: 14px

                .input
                    padding: 14px 16px
                    font-size: 15px

            .working-hours-list
                gap: 14px

                .working-hours-item
                    gap: 12px

                    .remove-btn
                        .remove-icon
                            width: 20px
                            height: 20px

                .add-hours-btn
                    padding: 12px 18px
                    font-size: 14px

                    .plus-icon
                        width: 16px
                        height: 16px

            .form-actions
                .save-btn
                    padding: 14px 28px
                    font-size: 15px

            .error-message, .success-message
                font-size: 14px

@media only screen and (min-width: $bp-tablet-landscape-up)
    .contacts-page
        .contacts-form
            .form-grid
                grid-template-columns: repeat(2, 1fr)

@media only screen and (min-width: $bp-pc)
    .contacts-page
        .contacts-form
            padding: 32px
            gap: 28px

            .form-grid
                grid-template-columns: repeat(2, 1fr)
                gap: 24px

            .form-field
                .field-label
                    font-size: 15px

                .input
                    padding: 16px 18px
                    font-size: 16px

            .working-hours-list
                gap: 16px

                .working-hours-item
                    gap: 14px

                .add-hours-btn
                    padding: 14px 20px
                    font-size: 15px

            .form-actions
                margin-top: 12px
                padding-top: 20px

                .save-btn
                    padding: 16px 32px
                    font-size: 16px

            .error-message, .success-message
                font-size: 15px

@media only screen and (min-width: $bp-large)
    .contacts-page
        .contacts-form
            padding: 40px
            gap: 32px

            .form-grid
                gap: 28px

            .form-field
                .field-label
                    font-size: 16px

                .input
                    padding: 18px 20px
                    font-size: 17px

            .working-hours-list
                gap: 18px

                .working-hours-item
                    gap: 16px

                .add-hours-btn
                    padding: 16px 24px
                    font-size: 16px

                    .plus-icon
                        width: 18px
                        height: 18px

            .form-actions
                .save-btn
                    padding: 18px 36px
                    font-size: 17px

            .error-message, .success-message
                font-size: 16px
</style>
