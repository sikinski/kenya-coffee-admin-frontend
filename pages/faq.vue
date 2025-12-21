<template>
    <div class="faq-page page-padding">
        <div class="content">
            <div class="header-section">
                <div class="h1-wrapper">
                    <ui-go-back />
                    <h1 class="h1">FAQ</h1>
                </div>
                <div class="header-actions">
                    <button class="add-btn" @click="showForm = true" v-if="!showForm">
                        <span class="btn-text">Добавить вопрос</span>
                        <span class="plus-icon"></span>
                    </button>
                </div>
            </div>

            <!-- Форма создания/редактирования -->
            <div class="faq-form-wrapper" v-if="showForm">
                <form class="faq-form" @submit.prevent="saveFaq">
                    <div class="form-header">
                        <h3 class="form-title">{{ editingFaq ? 'Редактировать вопрос' : 'Новый вопрос' }}</h3>
                        <button type="button" class="close-btn" @click="closeForm">
                            <img src="@/assets/images/icons/close.svg" alt="" class="close-icon">
                        </button>
                    </div>

                    <div class="form-fields">
                        <div class="form-field">
                            <label class="field-label">Вопрос</label>
                            <input 
                                type="text" 
                                class="input" 
                                v-model="faqForm.question"
                                placeholder="Введите вопрос"
                                required
                            />
                        </div>

                        <div class="form-field">
                            <label class="field-label">Ответ</label>
                            <ui-html-editor 
                                v-model="faqForm.answer"
                                placeholder="Введите ответ"
                            />
                        </div>

                        <div class="form-field form-field-checkbox">
                            <ui-custom-checkbox v-model="faqForm.active" label="Активен" />
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="save-btn" :disabled="saving">
                            {{ saving ? 'Сохранение...' : 'Сохранить' }}
                        </button>
                        <button type="button" class="cancel-btn" @click="closeForm">Отмена</button>
                    </div>

                    <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
                </form>
            </div>

            <!-- Список FAQ -->
            <div class="faq-list" v-if="faqs.length">
                <div 
                    class="faq-item" 
                    v-for="(faq, index) in faqs" 
                    :key="faq.id"
                    :draggable="true"
                    @dragstart="onDragStart($event, index)"
                    @dragover.prevent="onDragOver($event, index)"
                    @drop="onDrop($event, index)"
                    @dragend="onDragEnd"
                    :class="{ 'dragging': draggedIndex === index, 'dragover': draggedOverIndex === index }"
                >
                    <div class="drag-handle">
                        <span class="drag-icon"></span>
                    </div>
                    <div class="faq-content">
                        <div class="faq-question">{{ faq.question }}</div>
                        <div class="faq-answer" v-html="faq.answer"></div>
                        <div class="faq-meta">
                            <span class="faq-status" :class="{ 'faq-status-active': faq.active, 'faq-status-inactive': !faq.active }">
                                {{ faq.active ? 'Активен' : 'Неактивен' }}
                            </span>
                            <span class="faq-order">Порядок: {{ faq.order }}</span>
                        </div>
                    </div>
                    <div class="faq-actions">
                        <button class="edit-btn" @click="editFaq(faq)" title="Редактировать">
                            <img src="@/assets/images/icons/pencil.svg" alt="" class="action-icon">
                        </button>
                        <button class="delete-btn" @click="deleteFaq(faq.id)" title="Удалить">
                            <img src="@/assets/images/icons/close-round.svg" alt="" class="action-icon">
                        </button>
                    </div>
                </div>
            </div>

            <div class="empty" v-else-if="!showForm">
                Вопросов пока нет
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'

const { $api } = useNuxtApp()

const faqs = ref([])
const showForm = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const editingFaq = ref(null)

// Drag and drop
const draggedIndex = ref(null)
const draggedOverIndex = ref(null)

const faqForm = ref({
    question: '',
    answer: '',
    active: true
})

// Загрузка FAQ
const loadFaqs = async () => {
    try {
        const response = await $api.get('/faq')
        faqs.value = Array.isArray(response.data) ? response.data : []
    } catch (error) {
        console.error('Ошибка загрузки FAQ:', error)
        faqs.value = []
    }
}

// Сохранение FAQ
const saveFaq = async () => {
    saving.value = true
    errorMessage.value = ''

    try {
        const data = {
            question: faqForm.value.question,
            answer: faqForm.value.answer,
            active: faqForm.value.active
        }

        if (editingFaq.value) {
            await $api.put(`/faq/${editingFaq.value.id}`, data)
        } else {
            // При создании добавляем order в конец
            data.order = faqs.value.length
            await $api.post('/faq', data)
        }

        await loadFaqs()
        closeForm()
    } catch (error) {
        console.error('Ошибка сохранения FAQ:', error)
        errorMessage.value = error.response?.data?.error || error.message || 'Ошибка сохранения'
    } finally {
        saving.value = false
    }
}

// Редактирование FAQ
const editFaq = (faq) => {
    editingFaq.value = faq
    faqForm.value = {
        question: faq.question || '',
        answer: faq.answer || '',
        active: faq.active !== undefined ? faq.active : true
    }
    showForm.value = true
}

// Удаление FAQ
const deleteFaq = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить этот вопрос?')) return

    try {
        await $api.delete(`/faq/${id}`)
        await loadFaqs()
    } catch (error) {
        console.error('Ошибка удаления FAQ:', error)
        alert('Ошибка удаления: ' + (error.response?.data?.error || error.message))
    }
}

// Закрытие формы
const closeForm = () => {
    showForm.value = false
    editingFaq.value = null
    faqForm.value = {
        question: '',
        answer: '',
        active: true
    }
    errorMessage.value = ''
}

// Drag and drop handlers
const onDragStart = (event, index) => {
    draggedIndex.value = index
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', event.target.outerHTML)
}

const onDragOver = (event, index) => {
    event.preventDefault()
    draggedOverIndex.value = index
}

const onDrop = async (event, dropIndex) => {
    event.preventDefault()

    if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
        draggedIndex.value = null
        draggedOverIndex.value = null
        return
    }

    const draggedFaq = faqs.value[draggedIndex.value]
    const newFaqs = [...faqs.value]
    newFaqs.splice(draggedIndex.value, 1)
    newFaqs.splice(dropIndex, 0, draggedFaq)

    // Обновляем порядок в локальном состоянии
    faqs.value = newFaqs

    // Отправляем новый порядок на сервер
    const newOrder = newFaqs.map((faq, index) => ({ id: faq.id, order: index }))
    
    try {
        await $api.put('/faq/order', { faqs: newOrder })
    } catch (error) {
        console.error('Ошибка обновления порядка FAQ:', error)
        // В случае ошибки перезагружаем список
        await loadFaqs()
    }

    draggedIndex.value = null
    draggedOverIndex.value = null
}

const onDragEnd = () => {
    draggedIndex.value = null
    draggedOverIndex.value = null
}

onMounted(async () => {
    await loadFaqs()
})

useHead({
    title: 'FAQ — Кения',
})
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *

.faq-page
    background-color: var(--main-bg)
    min-height: 100vh

    .header-section
        display: flex
        justify-content: space-between
        align-items: flex-start
        margin-bottom: 24px
        gap: 16px

        .header-actions
            display: flex
            gap: 12px

    .add-btn
        display: flex
        align-items: center
        gap: 8px
        background-color: var(--accent-red)
        color: #fff
        padding: 10px 20px
        font-weight: 600
        font-size: 14px
        border: none
        border-radius: 12px
        cursor: pointer
        transition: all 0.2s ease
        white-space: nowrap

        &:hover
            background-color: var(--accent-orange)
            transform: translateY(-1px)
            box-shadow: 0 4px 12px rgba(232, 69, 32, 0.3)

        .btn-text
            color: #fff

        .plus-icon
            mask: url(@/assets/images/icons/plus.svg) no-repeat center
            mask-size: contain
            background-color: #fff
            width: 16px
            height: 16px

    .faq-form-wrapper
        margin-bottom: 24px

    .faq-form
        background-color: #fff
        border: 1px solid var(--border-color)
        border-radius: 12px
        padding: 20px
        display: flex
        flex-direction: column
        gap: 20px

        .form-header
            display: flex
            justify-content: space-between
            align-items: center
            margin-bottom: 8px

            .form-title
                font-size: 18px
                font-weight: 700
                color: var(--text-color)
                margin: 0

            .close-btn
                background: none
                border: none
                cursor: pointer
                padding: 6px
                border-radius: 6px
                transition: all 0.2s ease
                display: flex
                align-items: center
                justify-content: center

                &:hover
                    background-color: var(--second-bg)

                .close-icon
                    width: 18px
                    height: 18px
                    opacity: 0.7
                    transition: opacity 0.2s ease

                &:hover .close-icon
                    opacity: 1

        .form-fields
            display: flex
            flex-direction: column
            gap: 16px

        .form-field
            display: flex
            flex-direction: column
            gap: 8px

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

            &.form-field-checkbox
                flex-direction: row
                align-items: center

        .form-actions
            display: flex
            gap: 12px
            padding-top: 16px
            border-top: 1px solid var(--border-color)

            .save-btn
                flex: 1
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

            .cancel-btn
                padding: 12px 24px
                background-color: var(--second-bg)
                color: var(--text-color)
                border: 1px solid var(--border-color)
                border-radius: 8px
                font-size: 14px
                font-weight: 600
                cursor: pointer
                transition: all 0.2s ease

                &:hover
                    border-color: var(--accent-red)
                    background-color: rgba(232, 69, 32, 0.05)

        .error-message
            color: var(--error-color)
            font-size: 13px
            font-weight: 500
            margin-top: -8px

    .faq-list
        display: flex
        flex-direction: column
        gap: 12px

    .faq-item
        display: grid
        grid-template-columns: auto 1fr auto
        gap: 16px
        align-items: flex-start
        padding: 16px
        background-color: #fff
        border: 1px solid var(--border-color)
        border-radius: 12px
        transition: all 0.2s ease
        cursor: move

        &:hover
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06)
            border-color: var(--accent-red)

        &.dragging
            opacity: 0.5

        &.dragover
            border-color: var(--accent-red)
            box-shadow: 0 0 0 2px rgba(232, 69, 32, 0.2)

        .drag-handle
            display: flex
            align-items: center
            justify-content: center
            padding: 4px
            cursor: grab
            opacity: 0.5
            transition: opacity 0.2s ease

            &:hover
                opacity: 1

            &:active
                cursor: grabbing

            .drag-icon
                display: block
                width: 20px
                height: 20px
                mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M9 5h2v2H9V5zm0 6h2v2H9v-2zm0 6h2v2H9v-2zm4-12h2v2h-2V5zm0 6h2v2h-2v-2zm0 6h2v2h-2v-2z' fill='%232c2a26'/%3E%3C/svg%3E") no-repeat center
                mask-size: contain
                background-color: var(--text-color)

        .faq-content
            flex: 1
            min-width: 0

            .faq-question
                font-size: 16px
                font-weight: 600
                color: var(--text-color)
                margin-bottom: 8px
                line-height: 1.4

            .faq-answer
                font-size: 14px
                color: var(--text-secondary)
                line-height: 1.6
                margin-bottom: 12px

                :deep(p)
                    margin: 0 0 8px 0

                :deep(p:last-child)
                    margin-bottom: 0

            .faq-meta
                display: flex
                gap: 16px
                align-items: center
                flex-wrap: wrap

                .faq-status
                    font-size: 12px
                    font-weight: 600
                    padding: 4px 10px
                    border-radius: 12px

                    &.faq-status-active
                        background-color: rgba(78, 159, 112, 0.1)
                        color: var(--green-color)

                    &.faq-status-inactive
                        background-color: var(--second-bg)
                        color: var(--text-secondary)

                .faq-order
                    font-size: 12px
                    color: var(--text-secondary)
                    font-weight: 500

        .faq-actions
            display: flex
            gap: 8px
            align-items: center

            .edit-btn, .delete-btn
                background: none
                border: none
                cursor: pointer
                padding: 6px
                border-radius: 6px
                transition: all 0.2s ease
                display: flex
                align-items: center
                justify-content: center

                &:hover
                    background-color: rgba(232, 69, 32, 0.1)

                .action-icon
                    width: 16px
                    height: 16px
                    opacity: 0.7
                    transition: opacity 0.2s ease

                &:hover .action-icon
                    opacity: 1

    .empty
        text-align: center
        color: var(--text-secondary)
        font-size: 14px
        padding: 40px 20px
        background-color: #fff
        border: 1px solid var(--border-color)
        border-radius: 12px

@media only screen and (min-width: $bp-tablet)
    .faq-page
        .header-section
            .add-btn
                padding: 12px 24px
                font-size: 15px

        .faq-form
            padding: 24px
            gap: 24px

            .form-header
                .form-title
                    font-size: 20px

            .form-fields
                gap: 20px

            .form-field
                .field-label
                    font-size: 14px

                .input
                    padding: 14px 16px
                    font-size: 15px

            .form-actions
                .save-btn, .cancel-btn
                    padding: 14px 28px
                    font-size: 15px

        .faq-item
            padding: 20px
            gap: 20px

            .faq-content
                .faq-question
                    font-size: 17px

                .faq-answer
                    font-size: 15px

@media only screen and (min-width: $bp-pc)
    .faq-page
        .faq-form
            padding: 32px
            gap: 28px

            .form-fields
                gap: 24px

            .form-field
                .field-label
                    font-size: 15px

                .input
                    padding: 16px 18px
                    font-size: 16px

            .form-actions
                padding-top: 20px

                .save-btn, .cancel-btn
                    padding: 16px 32px
                    font-size: 16px

        .faq-item
            padding: 24px
            gap: 24px

            .faq-content
                .faq-question
                    font-size: 18px

                .faq-answer
                    font-size: 16px

@media only screen and (min-width: $bp-large)
    .faq-page
        .faq-form
            padding: 40px
            gap: 32px

            .form-field
                .input
                    padding: 18px 20px
                    font-size: 17px

            .form-actions
                .save-btn, .cancel-btn
                    padding: 18px 36px
                    font-size: 17px
</style>
