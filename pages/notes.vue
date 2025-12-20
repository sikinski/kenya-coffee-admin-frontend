<template>
    <div class="notes-page page-padding">
        <div class="content">
            <div class="header-section">
                <div class="h1-wrapper">
                    <ui-go-back />
                    <h1 class="h1">Заметки</h1>
                </div>
                <button class="add-new-btn" @click="showNoteForm = true" v-if="!showNoteForm">
                    <span class="btn-text">Добавить новую</span>
                    <span class="plus-icon"></span>
                </button>
            </div>

            <div class="page-content">
                <template v-if="showNoteForm">
                    <form class="form note-form">
                        <img @click.prevent="showNoteForm = false" src="@/assets/images/icons/close.svg" alt=""
                            class="close-icon">
                        <div class="input-wrapper text-wrapper">
                            <div class="editor">
                                <ui-html-editor v-model="noteForm.text" />
                            </div>
                        </div>

                        <div class="note-topics">
                            <span class="topic" v-for="topic in noteTopics" :key="topic.id"
                                :style="{ background: topic.color }"
                                :class="{ 'topic_active': noteForm.topicId === topic.id }"
                                @click="noteForm.topicId === topic.id ? noteForm.topicId = null : noteForm.topicId = topic.id">
                                {{ topic.name }}
                            </span>
                        </div>

                        <button class="save-btn" @click.prevent="addNewNote">Сохранить</button>
                    </form>
                </template>

                <div class="note-topics" v-if="!showNoteForm">
                    <span class="topic" v-for="topic in noteTopics" :key="topic.id" :style="{ background: topic.color }"
                        :class="{ 'topic_active': filters.topics.includes(topic.id) }"
                        @click="toggleFilterTopics(topic)">
                        {{ topic.name }}
                        <span class="delete-icon" @click.prevent.stop="deleteTopic(topic)"></span>
                    </span>

                    <button class="add-more center" @click="showNoteTopicForm = true">
                        <span class="add-icon"></span>
                    </button>

                    <p class="topic-error" v-if="topicError">{{ topicError }}</p>

                    <form class="form topic-form" v-if="showNoteTopicForm">
                        <img @click.prevent="showNoteTopicForm = false" src="@/assets/images/icons/close.svg" alt=""
                            class="close-icon">
                        <div class="input-wrapper">
                            <input type="text" class="input" name="topic_name" v-model="topicForm.name"
                                placeholder="Название темы" />
                        </div>

                        <div class="color-section">
                            <p class="title">Выберите цвет (опционально)</p>

                            <div class="colors">
                                <button class="color" v-for="color in palette" :style="{ background: color }"
                                    :class="{ 'active': topicForm.color === color }"
                                    @click.prevent="topicForm.color = color"></button>
                            </div>
                        </div>

                        <button class="save-btn" @click.prevent="addNewTopic">Добавить</button>
                    </form>
                </div>

                <p class="error" id="error-text" v-if="serverError">{{ serverError }}</p>

                <div class="notes-list" v-if="notes?.length">
                    <div class="note-card" v-for="note in notes" :key="note.id">
                        <button @click="deleteNote(note.id)" class="delete-note-btn" title="Удалить">
                            <img src="@/assets/images/icons/close.svg" alt="" class="close-icon">
                        </button>

                        <span class="note-topic" v-if="getTopicById(note.topicId)"
                            :style="{ background: getTopicById(note.topicId).color }">#{{
                                getTopicById(note.topicId).name
                            }}</span>
                        <div class="note-text" v-html="note.text"></div>

                        <div class="note-footer">
                            <div class="note-dates">
                                <span class="date">{{ getShortDateTime(note.created_at) }}</span>
                                <span class="updated-date" v-if="note.created_at !== note.updated_at">
                                    ( обновлено {{ getShortDateTime(note.updated_at) }} )
                                </span>
                            </div>

                            <span class="note-author">{{ note.author_name }}</span>
                        </div>
                    </div>
                </div>

                <div class="empty" v-else>
                    Здесь пусто
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'

const { $api } = useNuxtApp()
const showNoteForm = ref(false)
const showNoteTopicForm = ref(false)

const serverError = ref('')
const topicError = ref('')
const noteTopics = ref([])
const notes = ref([])

const palette = [
    '#b8c9b0', // мягкий зелёный — Рецепты
    '#e07a5f', // тёплый терракотовый — Важное
    '#a6bddb', // серо-голубой — Для новичков
    '#9fa69b', // оливково-серый — Видео
    '#c9b482', // песочный — Поставки
    '#8bb49e', // мятно-зелёный — Экология, Позитив
    '#d9a27f', // карамельный — Новости
    '#b3a4d0',  // пыльно-лавандовый — Советы или Прочее
    '#e84520'
]



const noteForm = ref({
    text: '',
    topicId: null
})
const topicForm = ref({
    name: '',
    color: palette[0]
})

const filters = ref({
    topics: [] // Array of ids
})


const getNoteTopics = async () => {
    noteTopics.value = await $api.get('/note-topics').then(res => res.data || []).catch(() => [])
}
const getNotes = async () => {
    let filterString = ''
    if (filters.value.topics?.length) {
        filterString += `topics=${filters.value.topics.join(',')}`
    }
    console.log(filterString);

    notes.value = await $api.get(`/notes?${filterString}`).then(res => res.data).catch(() => [])
}
const getTopicById = (id) => {
    return noteTopics.value.find(topic => topic.id === id) || null
}

const addNewTopic = async () => {
    topicError.value = ''
    await $api.post(`/note-topics`, topicForm.value).then(async () => {
        showNoteTopicForm.value = false
        await getNoteTopics()
    }).catch(() => {
        topicError.value = 'Ошибка'
    })
}

const addNewNote = async () => {
    console.log(noteForm.value.text);
    await $api.post(`/notes`, noteForm.value).then(async () => {
        noteForm.value.text = ''
        showNoteForm.value = false
        await getNotes()
        // getNotes
    }).catch(err => {
        console.log(err);

        serverError.value = err.response.data.error || err.response.data.message || ''
    })
}

const deleteNote = async (note_id) => {
    serverError.value = ''
    await $api.delete(`/notes/${note_id}`).then(async () => {
        filters.value.topics = []
        await getNotes()
    }).catch(err => {
        serverError.value = err.response.data.error || err.response.data.message || ''
        const errorBlock = document.getElementById('error-text')
        if (errorBlock) {
            errorBlock.scrollIntoView()
        }
    })
}

const deleteTopic = async (topic) => {
    topicError.value = ''
    await $api.delete(`/note-topics/${topic.id}`).then(async () => {
        await getNoteTopics()
        filters.value.topics = []
    }).catch(err => {
        topicError.value = err.response.data.error
    })

}

const toggleFilterTopics = (topic) => {
    if (filters.value.topics.includes(topic.id)) {
        filters.value.topics = filters.value.topics.filter(t => t !== topic.id)
    } else {
        filters.value.topics.push(topic.id)
    }
}

watch(filters, async () => {
    await getNotes()
}, { deep: true })

onMounted(async () => {
    await getNoteTopics()
    await getNotes()
})

useHead({
    title: 'Заметки — Кения',
})
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
@use '@/assets/styles/forms'
.notes-page
    background-color: var(--main-bg)
    min-height: 100vh

    .header-section
        .add-new-btn
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

    .note-form
        margin-bottom: 32px
        .note-topics
            margin-bottom: 0
    .form
        position: relative
        gap: 15px
        margin-top: 24px
        padding: 14px
        background-color: #fff
        border: 1px solid var(--border-color)
        border-radius: 16px
        .input-wrapper
            background-color: #fff
            border: 1px solid var(--border-color)
            border-radius: 8px
            .ql-toolbar
                border-bottom: 1px solid var(--border-color)
        .ql-editor
            font-size: 14px
            font-family: sans-serif
            &::before
                font-size: inherit
                font-family: sans-serif
        .close-icon
            position: absolute
            right: 12px
            top: 12px
            width: 18px
            z-index: 2
            cursor: pointer
            opacity: 0.7
            transition: opacity 0.2s ease
            &:hover
                opacity: 1
        .save-btn
            background-color: var(--accent-red)
            color: #fff
            font-size: 14px
            font-weight: 600
            padding: 12px 24px
            border: none
            border-radius: 8px
            cursor: pointer
            transition: all 0.2s ease
            width: 100%
            &:hover
                background-color: var(--accent-orange)
                transform: translateY(-1px)
    .note-topics
        display: flex
        flex-wrap: wrap
        gap: 10px
        margin-bottom: 24px
        align-items: flex-start
        margin-top: 20px
        .topic
            display: flex
            align-items: center
            gap: 12px
            padding: 8px 14px
            border-radius: 20px
            font-weight: 500
            font-family: sans-serif
            opacity: 0.7
            cursor: pointer
            border: 2px solid transparent
            font-size: 13px
            transition: all 0.2s ease
            color: #fff
            &:hover
                opacity: 1
            &_active
                opacity: 1
                border-color: rgba(255, 255, 255, 0.5)
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15)
            .delete-icon
                width: 14px
                height: 14px
                background-color: #fff
                mask: url(@/assets/images/icons/close-round.svg) no-repeat center
                display: block
                mask-size: contain
                opacity: 0.8
                transition: opacity 0.2s ease
                &:hover
                    opacity: 1
        .add-more
            width: 40px
            height: 40px
            flex-shrink: 0
            border: none
            background-color: var(--accent-red)
            border-radius: 20px
            cursor: pointer
            transition: all 0.2s ease
            display: flex
            align-items: center
            justify-content: center
            align-self: flex-start
            &:hover
                background-color: var(--accent-orange)
                transform: scale(1.05)
            .add-icon
                mask-size: contain
                mask: url(@/assets/images/icons/plus-round.svg) no-repeat center
                background-color: #fff
                display: block
                width: 20px
                height: 20px
        .topic-error
            width: 100%
            color: var(--accent-red)
            font-size: 12px
            margin-top: 8px
        .topic-form
            position: relative
            width: 100%
            margin-top: 12px
            padding: 18px
            background-color: #fff
            border: 1px solid var(--border-color)
            border-radius: 12px
            margin-bottom: 16px
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
            .color-section
                margin-top: 14px
            .colors
                margin-top: 10px
                display: grid
                grid-template-columns: repeat(5, 1fr)
                grid-gap: 8px
                .color
                    height: 32px
                    border: none
                    border-radius: 6px
                    opacity: 0.7
                    border: 2px solid transparent
                    cursor: pointer
                    transition: all 0.2s ease
                    &:hover
                        opacity: 1
                        transform: scale(1.05)
                .active
                    opacity: 1
                    border-color: var(--text-color)
            .input-wrapper
                font-size: 14px
                margin-bottom: 0
                .input
                    padding: 12px 14px
                    font-size: 14px
                    border: 1px solid var(--border-color)
                    border-radius: 8px
                    width: 100%
                    &:focus
                        outline: none
                        border-color: var(--accent-red)
            .title
                font-size: 13px
                font-weight: 600
                margin-bottom: 10px
                color: var(--text-secondary)
            .save-btn
                padding: 12px 24px
                font-size: 14px
                font-weight: 600
                margin-top: 14px
                width: 100%
            
    .notes-list
        margin-top: 16px
        display: flex
        flex-direction: column
        gap: 16px
        .note-card
            position: relative
            background-color: var(--second-bg)
            padding: 20px
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06)
            border: 1px solid var(--border-color)
            border-radius: 12px
            transition: all 0.2s ease
            &:hover
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)
                border-color: var(--accent-red)
            .note-text
                padding-right: 40px
                margin-top: 12px
                font-family: sans-serif
                font-size: 14px
                line-height: 1.6
                & > *
                    font-family: sans-serif
            .note-topic
                padding: 6px 12px
                font-size: 12px
                border-radius: 20px
                font-family: sans-serif
                font-weight: 600
                color: #fff
                display: inline-block
                margin-bottom: 8px

            .delete-note-btn
                position: absolute
                right: 16px
                top: 16px
                background: none
                border: none
                cursor: pointer
                padding: 6px
                opacity: 0.6
                transition: all 0.2s ease
                border-radius: 6px
                display: flex
                align-items: center
                justify-content: center
                &:hover
                    opacity: 1
                    background-color: rgba(232, 69, 32, 0.1)
                .close-icon
                    width: 16px
                    height: 16px
            ol, ul
                margin-left: 20px
                padding: 0
                li
                    list-style-type: unset
                
            .date, .updated-date, .note-author
                color: var(--text-secondary)
                font-weight: 500
                font-size: 12px
            .note-footer
                display: flex
                justify-content: space-between
                align-items: center
                margin-top: 16px
                padding-top: 12px
                border-top: 1px solid var(--border-color)
            .note-dates
                display: flex
                flex-direction: column
                gap: 4px

@media only screen and (min-width: $bp-tablet)
    .notes-page
        .header-section
            .add-new-btn
                padding: 12px 24px
                font-size: 15px
        .form
            gap: 20px
            margin-top: 32px
            padding: 28px
            .input-wrapper
                font-size: 16px
            .ql-editor
                font-size: 16px
                &::before
                    font-size: inherit
            .save-btn
                font-size: 15px
                padding: 14px 28px
        .note-topics
            gap: 12px
            .topic
                padding: 10px 16px
                font-size: 14px
            .topic-form
                width: 50%
                padding: 18px
                .colors
                    grid-gap: 8px
                    .color
                        height: 34px
        .notes-list
            margin-top: 24px
            gap: 20px
            .note-card
                padding: 24px
                .note-text
                    font-size: 15px
                .note-topic
                    font-size: 13px
                .delete-note-btn
                    .close-icon
                        width: 18px
                        height: 18px
                .date, .updated-date, .note-author
                    font-size: 13px

@media only screen and (min-width: $bp-tablet-landscape-up)
    .notes-page
        .content
            display: grid
            grid-template-areas: 'header header' 'page-cont page-cont'
            grid-template-columns: 1fr
        .header-section
            grid-area: header
            display: grid
            grid-template-columns: 1fr auto
            align-items: center
            gap: 20px
            .header-top
                margin-bottom: 0
            .add-new-btn
                align-self: center
        .page-content
            grid-area: page-cont
        .note-topics
            .topic
                font-size: 13px
                padding: 8px 14px
        .notes-list
            .note-card
                .note-text
                    font-size: 14px
        .form
            .ql-editor
                font-size: 14px
                &::before
                    font-size: inherit
            .save-btn
                font-size: 14px

@media only screen and (min-width: $bp-pc)
    .notes-page
        .header-section
            .add-new-btn
                padding: 14px 28px
                font-size: 16px
        .form
            .ql-editor
                font-size: 16px
                &::before
                    font-size: inherit
        .note-topics
            .topic
                font-size: 14px
                padding: 10px 18px
                .delete-icon
                    width: 16px
                    height: 16px
            .topic-form
                padding: 20px
                .input-wrapper
                    font-size: 14px
                    .input
                        font-size: 14px
                .colors
                    grid-gap: 8px
                    .color
                        height: 36px
        .notes-list
            .note-card
                padding: 28px
                .note-text
                    font-size: 16px
                .date, .updated-date, .note-author
                    font-size: 13px

@media only screen and (min-width: $bp-large)
    .notes-page
        .header-section
            .add-new-btn
                padding: 16px 32px
                font-size: 17px
        .form
            padding: 32px
            .ql-editor
                font-size: 18px
                &::before
                    font-size: inherit
            .save-btn
                font-size: 17px
                padding: 14px 32px
        .note-topics
            gap: 12px
            .topic
                font-size: 17px
                padding: 12px 20px
            .add-more
                width: 50px
                height: 50px
            .topic-form
                padding: 24px
                .input-wrapper
                    .input
                        font-size: 15px
                        padding: 14px 16px
                .colors
                    .color
                        height: 38px
                .save-btn
                    font-size: 15px
        .notes-list
            gap: 20px
            .note-card
                padding: 32px
                .note-text
                    font-size: 17px
                .note-topic
                    font-size: 14px
                .date, .updated-date, .note-author
                    font-size: 15px
</style>
