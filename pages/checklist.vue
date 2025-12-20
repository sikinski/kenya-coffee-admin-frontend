<template>
    <div class="checklist-page page-padding">
        <div class="content">
            <div class="header-section">
                <div class="h1-wrapper">
                    <ui-go-back />
                    <h1 class="h1">Чеклист</h1>
                </div>
            </div>

            <div class="page-layout">
                <!-- Основной контент с ежедневными задачами -->
                <div class="daily-tasks-main">
                    <div class="date-selector">
                        <label class="date-label">Выберите дату</label>
                        <client-only>
                            <vue-date-picker v-model="selectedDate" locale="ru" format="dd.MM.yyyy"
                                :enable-time-picker="false" :auto-apply="true" :start-date="selectedDate"
                                :month-picker="false" @update:model-value="onDateChange" class="custom-datepicker" />
                        </client-only>
                    </div>

                    <div class="tasks-container" v-if="dailyTasks?.length">
                        <div v-for="task in dailyTasks" :key="task.id" class="task-card">
                            <ui-custom-checkbox :label="task.task.text" v-model="task.done" :id="`daily-${task.id}`"
                                @update:modelValue="updateDailyTask(task.id, { done: $event })" />
                        </div>
                    </div>

                    <div class="empty" v-else>
                        <p>Задач на этот день нет</p>
                        <p class="empty-hint">Используйте кнопку редактирования справа, чтобы добавить задачи в шаблон
                        </p>
                    </div>
                </div>

                <!-- Overlay для мобильных -->
                <div class="edit-overlay" v-if="showEditPanel" @click="showEditPanel = false"></div>

                <!-- Кнопка редактирования (всегда видна на мобильных) -->
                <button class="edit-toggle-btn" @click="showEditPanel = !showEditPanel"
                    :title="showEditPanel ? 'Закрыть редактирование' : 'Редактировать список задач'">
                    <span class="edit-icon" :class="{ 'edit-icon-open': showEditPanel }"></span>
                </button>

                <!-- Боковая панель для редактирования шаблона -->
                <div class="edit-panel" :class="{ 'edit-panel-open': showEditPanel }">

                    <div class="edit-panel-content" v-if="showEditPanel">
                        <div class="edit-panel-header">
                            <h3 class="edit-panel-title">Редактирование списка задач</h3>
                            <button class="close-panel-btn" @click="showEditPanel = false" title="Закрыть">
                                <img src="@/assets/images/icons/close.svg" alt="Закрыть" class="close-icon">
                            </button>
                        </div>
                        <p class="edit-panel-hint">Изменения в шаблоне не затронут уже сохраненные записи за прошлые дни
                        </p>

                        <button class="add-task-btn filled-btn" @click="showTaskForm = true" v-if="!showTaskForm">
                            <span class="btn-text">Добавить задачу</span>
                            <span class="plus-icon"></span>
                        </button>

                        <form v-if="showTaskForm" class="task-form" @submit.prevent="createTask">
                            <img @click.prevent="showTaskForm = false" src="@/assets/images/icons/close.svg" alt=""
                                class="close-icon">
                            <div class="input-wrapper">
                                <input type="text" class="input" name="task_name" v-model="newTask.text" required
                                    placeholder="Текст задачи" />
                            </div>
                            <button type="submit" class="save-btn">Добавить</button>
                        </form>

                        <div class="template-tasks-container" v-if="templateTasks?.length">
                            <div v-for="(task, index) in templateTasks" :key="task.id" class="template-task-card"
                                :draggable="true" @dragstart="onDragStart($event, index)"
                                @dragover.prevent="onDragOver($event, index)" @drop="onDrop($event, index)"
                                @dragend="onDragEnd" :class="{ 'dragging': draggedIndex === index }">
                                <div class="drag-handle">
                                    <span class="drag-icon"></span>
                                </div>
                                <span class="task-text">{{ task.text }}</span>
                                <button class="delete-btn" @click="deleteTask(task.id)" title="Удалить из шаблона">
                                    <span class="delete-icon"></span>
                                </button>
                            </div>
                        </div>

                        <div class="empty" v-else-if="!showTaskForm">
                            <p>Шаблон задач пуст</p>
                            <p class="empty-hint">Добавьте задачи, чтобы они появлялись в ежедневном списке</p>
                        </div>

                        <button class="sync-btn" @click="syncTasks">Синхронизировать</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const { $api } = useNuxtApp()

// Ежедневные задачи (для выбранной даты)
const dailyTasks = ref([])
const selectedDate = ref(new Date()) // Сегодняшняя дата

// Шаблон задач (для редактирования)
const templateTasks = ref([])
const showEditPanel = ref(false)
const showTaskForm = ref(false)
const newTask = ref({
    text: ''
})

// Drag and drop для шаблона
const draggedIndex = ref(null)
const draggedOverIndex = ref(null)

// Загрузка шаблона задач (обычные задачи)
const getTemplateTasks = async () => {
    try {
        const res = await $api.get('/tasks')
        // Обрабатываем разные форматы ответа
        if (Array.isArray(res.data)) {
            templateTasks.value = res.data
        } else if (res.data?.tasks) {
            templateTasks.value = res.data.tasks
        } else if (res.data?.data) {
            templateTasks.value = res.data.data
        } else {
            templateTasks.value = []
        }
    } catch (error) {
        console.error('Ошибка загрузки шаблона задач:', error)
        templateTasks.value = []
    }
}

// Создание задачи в шаблоне
const createTask = async () => {
    if (!newTask.value.text.trim()) return

    try {
        await $api.post('/tasks', { text: newTask.value.text })
        newTask.value.text = ''
        showTaskForm.value = false
        await getTemplateTasks()
    } catch (error) {
        console.error('Ошибка создания задачи:', error)
    }
}

// Удаление задачи из шаблона
const deleteTask = async (taskId) => {
    if (!confirm('Вы уверены, что хотите удалить эту задачу из шаблона? Это не затронет уже сохраненные записи за прошлые дни.')) return

    try {
        await $api.delete(`/tasks/${taskId}`)
        await getTemplateTasks()
    } catch (error) {
        console.error('Ошибка удаления задачи:', error)
    }
}

// Обновление порядка задач в шаблоне
const updateTasksOrder = async (newOrder) => {
    try {
        await $api.put('/tasks/order', { order: newOrder })
        await getTemplateTasks()
    } catch (error) {
        console.error('Ошибка обновления порядка задач:', error)
    }
}

const syncTasks = async () => {
    try {
        await $api.post('/daily-tasks/sync')
        await loadDailyTasks()
    } catch (error) {
        console.error('Ошибка синхронизации задач', error)
    }
}

// Drag and drop handlers для шаблона
const onDragStart = (event, index) => {
    draggedIndex.value = index
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', event.target.outerHTML)
}

const onDragOver = (event, index) => {
    event.preventDefault()
    draggedOverIndex.value = index
}

const onDrop = (event, dropIndex) => {
    event.preventDefault()

    if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
        return
    }

    const draggedTask = templateTasks.value[draggedIndex.value]
    const newTasks = [...templateTasks.value]
    newTasks.splice(draggedIndex.value, 1)
    newTasks.splice(dropIndex, 0, draggedTask)

    // Обновляем порядок в локальном состоянии
    templateTasks.value = newTasks

    // Отправляем новый порядок на сервер
    const newOrder = newTasks.map((task, index) => ({ id: task.id, order: index }))
    updateTasksOrder(newOrder)
}

const onDragEnd = () => {
    draggedIndex.value = null
    draggedOverIndex.value = null
}

// Форматирование даты для API (YYYY-MM-DD)
const formatDateForAPI = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// Обработчик изменения даты
const onDateChange = (date) => {
    if (date) {
        loadDailyTasks()
    }
}

// Загрузка ежедневных задач для выбранной даты
const loadDailyTasks = async () => {
    try {
        const dateString = formatDateForAPI(selectedDate.value)
        const res = await $api.get(`/daily-tasks?date=${dateString}`)
        // Обрабатываем разные форматы ответа
        if (Array.isArray(res.data)) {
            dailyTasks.value = res.data
        } else if (res.data?.tasks) {
            dailyTasks.value = res.data.tasks
        } else if (res.data?.data) {
            dailyTasks.value = res.data.data
        } else {
            dailyTasks.value = []
        }
    } catch (error) {
        console.error('Ошибка загрузки ежедневных задач:', error)
        dailyTasks.value = []
    }
}

// Обновление ежедневной задачи (отметка done)
const updateDailyTask = async (taskId, data) => {
    try {
        await $api.put(`/daily-tasks/${taskId}`, data)
        // Обновляем локальное состояние без перезагрузки
        const task = dailyTasks.value.find(t => t.id === taskId)
        if (task) {
            task.done = data.done
        }
    } catch (error) {
        console.error('Ошибка обновления ежедневной задачи:', error)
        // В случае ошибки перезагружаем список
        await loadDailyTasks()
    }
}

onMounted(async () => {
    await getTemplateTasks()
    await loadDailyTasks()
})

useHead({
    title: 'Чеклист — Keния',
})
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
@use '@/assets/styles/forms' as *
@use '@/assets/styles/datepicker' as *

.checklist-page

    .header-section

    .page-layout
        display: grid
        grid-template-columns: 1fr auto
        gap: 24px
        position: relative

    .daily-tasks-main
        min-width: 0

    .date-selector
        display: flex
        align-items: center
        gap: 12px
        margin-bottom: 24px
        position: relative
        z-index: 1
        .date-label
            font-size: 15px
            font-weight: 600
            color: var(--text-color)
        .custom-datepicker
            width: auto
            :deep(.dp__input_wrap)
                .dp__input
                    padding: 10px 16px
                    border: 1px solid var(--border-color)
                    border-radius: 12px
                    background-color: #fff
                    color: var(--text-color)
                    font-size: 14px
                    cursor: pointer
                    transition: all 0.2s ease
                    font-family: inherit
                    &:focus
                        outline: none
                        border-color: var(--accent-red)
                    &:hover
                        border-color: var(--accent-red)
            :deep(.dp__input_icon)
                color: var(--text-color)
                opacity: 0.7

    .tasks-container
        display: flex
        flex-direction: column
        gap: 12px

    .task-card
        padding: 5px
        background-color: #fff
        border: 1px solid var(--border-color)
        border-radius: 12px
        transition: all 0.2s ease
        &:hover
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06)
            border-color: var(--accent-red)

    .empty
        display: flex
        flex-direction: column
        justify-content: center
        align-items: center
        text-align: center
        color: var(--text-color)
        min-height: 40vh
        font-weight: 500
        font-size: 14px
        opacity: 0.7
        gap: 10px
        margin-top: 20px
        position: relative
        z-index: 0
        .empty-hint
            font-size: 12px
            opacity: 0.6
            font-weight: 400
            margin-top: 5px

    // Overlay для мобильных
    .edit-overlay
        display: none
        @media only screen and (max-width: $bp-tablet)
            display: block
            position: fixed
            top: 0
            left: 0
            right: 0
            bottom: 0
            background-color: rgba(0, 0, 0, 0.5)
            z-index: 15

    // Боковая панель редактирования
    .edit-panel
        position: relative
        width: 0
        transition: width 0.3s ease
        overflow: visible
        &.edit-panel-open
            width: 350px
            overflow: visible
        @media only screen and (max-width: $bp-tablet)
            position: fixed
            top: 0
            right: 0
            bottom: 0
            width: 100% !important
            max-width: 400px
            transform: translateX(100%)
            transition: transform 0.3s ease
            z-index: 15
            padding: 20px
            overflow-y: auto
            box-shadow: -2px 0 12px rgba(0, 0, 0, 0.2)
            background-color: var(--main-bg)
            &.edit-panel-open
                transform: translateX(0)

    .edit-toggle-btn
        position: fixed
        right: 20px
        bottom: 20px
        width: 56px
        height: 56px
        background-color: var(--accent-red)
        border: none
        border-radius: 50%
        cursor: pointer
        display: flex
        align-items: center
        justify-content: center
        transition: all 0.2s ease
        z-index: 10
        box-shadow: 0 4px 12px rgba(232, 69, 32, 0.3)
        &:hover
            background-color: var(--accent-orange)
            transform: translateY(-2px)
            box-shadow: 0 6px 16px rgba(232, 69, 32, 0.4)
        .edit-icon
            width: 24px
            height: 24px
            mask: url(@/assets/images/icons/pencil.svg) no-repeat center
            mask-size: contain
            background-color: #fff
            transition: transform 0.3s ease
            &.edit-icon-open
                transform: rotate(180deg)
        @media only screen and (min-width: $bp-tablet)
            width: 50px
            height: 50px
            .edit-icon
                width: 20px
                height: 20px

    .edit-panel-content
        background-color: #fff
        border: 1px solid var(--border-color)
        border-radius: 16px
        padding: 24px
        min-height: 400px
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08)
        width: 100%
        box-sizing: border-box

    .edit-panel-header
        display: flex
        justify-content: space-between
        align-items: center
        margin-bottom: 12px
        gap: 10px

    .edit-panel-title
        font-size: 18px
        font-weight: 700
        color: var(--text-color)
        margin: 0
        flex: 1

    .close-panel-btn
        background: none
        border: none
        cursor: pointer
        padding: 6px
        display: flex
        align-items: center
        justify-content: center
        opacity: 0.7
        transition: all 0.2s ease
        flex-shrink: 0
        border-radius: 8px
        &:hover
            opacity: 1
            background-color: var(--second-bg)
        .close-icon
            width: 18px
            height: 18px

    .edit-panel-hint
        font-size: 12px
        color: var(--text-secondary)
        margin-bottom: 20px
        line-height: 1.5

    .add-task-btn
        .plus-icon
            mask-image: url(@/assets/images/icons/plus.svg)
            background-color: #fff
            height: 18px
            width: 18px
            mask-size: contain
            mask-repeat: no-repeat
            mask-position: center

    .task-form
        position: relative
        gap: 15px
        margin-top: 20px
        padding: 20px
        background-color: var(--second-bg)
        border: 1px solid var(--border-color)
        border-radius: 12px
        .close-icon
            position: absolute
            right: 12px
            top: 12px
            width: 18px
            cursor: pointer
            opacity: 0.7
            transition: opacity 0.2s ease
            z-index: 2
            &:hover
                opacity: 1
        .input-wrapper
            background-color: #fff
            border-radius: 8px
            .input
                padding: 12px 16px
                border: 1px solid var(--border-color)
                border-radius: 8px
                font-size: 14px
                width: 100%
                &:focus
                    outline: none
                    border-color: var(--accent-red)
        .save-btn
            padding: 12px 24px
            background-color: var(--accent-red)
            color: #fff
            border: none
            border-radius: 8px
            font-size: 14px
            font-weight: 600
            cursor: pointer
            transition: all 0.2s ease
            width: 100%
            &:hover
                background-color: var(--accent-orange)
                transform: translateY(-1px)

    .template-tasks-container
        margin-top: 20px
        display: flex
        flex-direction: column
        gap: 10px

    .template-task-card
        position: relative
        display: grid
        grid-template-columns: auto 1fr auto
        align-items: center
        gap: 12px
        padding: 14px 16px
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
            background-color: var(--second-bg)

        .drag-handle
            display: flex
            align-items: center
            cursor: grab
            padding: 4px
            border-radius: 6px
            transition: background-color 0.2s ease
            &:active
                cursor: grabbing
            &:hover
                background-color: var(--second-bg)
            .drag-icon
                width: 18px
                height: 18px
                mask: url(@/assets/images/icons/burger.svg) no-repeat center
                mask-size: contain
                background-color: var(--text-secondary)
                opacity: 0.6

        .task-text
            font-size: 14px
            font-weight: 500
            color: var(--text-color)

        .delete-btn
            background: none
            border: none
            cursor: pointer
            padding: 6px
            display: flex
            align-items: center
            justify-content: center
            opacity: 0.6
            transition: all 0.2s ease
            border-radius: 6px
            &:hover
                opacity: 1
                background-color: rgba(232, 69, 32, 0.1)
            .delete-icon
                width: 16px
                height: 16px
                background-color: var(--accent-red)
                mask: url(@/assets/images/icons/close-round.svg) no-repeat center
                mask-size: contain
                display: block
    .sync-btn
        margin-top: 20px
        width: 100%
        border: none
        font-size: 14px
        font-weight: 600
        color: var(--accent-orange)

@media only screen and (min-width: $bp-tablet)
    .checklist-page
        .date-selector
            .date-label
                font-size: 18px
        .task-item
            padding: 18px
        .edit-panel-content
            padding: 25px
        .edit-panel-title
            font-size: 1.5rem

@media only screen and (max-width: $bp-tablet)
    .checklist-page
        .page-layout
            grid-template-columns: 1fr

@media only screen and (min-width: $bp-tablet-landscape-up)
    .checklist-page
        .page-layout
            gap: 30px
        .task-card
            padding: 5px 20px

@media only screen and (min-width: $bp-pc)
    .checklist-page
        .edit-panel
            &.edit-panel-open
                width: 400px
        .edit-panel-content
            padding: 30px

@media only screen and (min-width: $bp-large)
    .checklist-page
        .date-selector
            .date-label
                font-size: 20px
        .task-card
            padding: 20px 24px
        .edit-panel
            &.edit-panel-open
                width: 600px
        .edit-panel-content
            padding: 36px
            .edit-panel-title
                font-size: 22px
            .template-task-card
                padding: 16px 20px
                .task-text
                    font-size: 17px
        .edit-toggle-btn
            width: 70px
            height: 70px
    
</style>
