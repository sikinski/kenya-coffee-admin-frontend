<template>
    <div class="notes-page page-padding">
        <div class="content">
            <div class="h1-wrapper">
                <ui-go-back />
                <h1 class="h1">Заметки.</h1>
            </div>

            <button class="add-new" @click="showNoteForm = true" v-if="!showNoteForm">Добавить новую</button>

            <div class="page-content">
                <template v-if="showNoteForm">
                    <form class="form note-form">
                        <img @click.prevent="showNoteForm = false" src="@/assets/images/icons/close.svg" alt=""
                            class="close-icon">
                        <div class="input-wrapper text-wrapper">
                            <div class="editor">
                                <client-only>
                                    <quill-editor class="input" v-model:content="noteForm.text" contentType="html"
                                        :options="editorOptions" placeholder="Напишите что-то" />
                                </client-only>
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

                    <form class="form" v-if="showNoteTopicForm">
                        <img @click.prevent="showNoteTopicForm = false" src="@/assets/images/icons/close.svg" alt=""
                            class="close-icon">
                        <div class="input-wrapper">
                            <input type="text" class="input" name="name" v-model="topicForm.name" />
                            <label for="name" class="label-name">
                                <span class="content-name" :class="{ 'valid-input': topicForm.name }">Название темы
                                    *</span>
                            </label>
                        </div>

                        <div class="wrapper">
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

                <div class="items" v-if="notes?.length">
                    <div class="item" v-for="note in notes" :key="note.id">
                        <img @click="deleteNote(note.id)" src="@/assets/images/icons/close.svg" alt=""
                            class="close-icon">

                        <span class="topic" v-if="getTopicById(note.topicId)"
                            :style="{ background: getTopicById(note.topicId).color }">#{{
                                getTopicById(note.topicId).name
                            }}</span>
                        <div class="text" v-html="note.text"></div>

                        <div class="footer">
                            <p class="dates">
                                <span class="date">{{ getShortDateTime(note.created_at) }}</span>
                                <span class="updated-date" v-if="note.created_at !== note.updated_at">
                                    ( обновлено {{ getShortDateTime(note.updated_at) }} )
                                </span>
                            </p>

                            <span class="author">{{ note.author_name }}</span>
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

const palette = ['#e5c3c6', '#e1e9b7', '#f96161', '#bcd2d0', '#d0b783', '#b5a7c5', '#d4af37', '#a1afde', '#fbb07b', '#a8e3c2']

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
//
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const editorOptions = {
    theme: 'snow',
    modules: {
        toolbar: [['bold', 'italic', 'underline'], [{ 'list': 'bullet' }, { 'list': 'ordered' }]]
    },
}

useHead({
    title: 'Заметки — Кения',
})
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
@use '@/assets/styles/forms'
.notes-page
    .add-new
        margin: 20px 0
        background-color: var(--text-color)
        color: var(--main-bg)
        padding: 8px 12px
        font-weight: 500
        border: none
        border-radius: 4px
    .note-form
        margin-bottom: 40px
        .note-topics
            margin-bottom: 0
    .form
        position: relative
        gap: 10px
        margin-top: 20px
        .input-wrapper
            background-color: #fff
            border: 1px solid var(--creme-color)
            .ql-toolbar
                border-bottom: 1px solid var(--creme-color)
        .ql-editor
            font-size: 14px
            font-family: sans-serif
            &::before
                font-size: inherit
                font-family: sans-serif
        .close-icon
            position: absolute
            right: -5px
            top: -10px
            width: 16px
            z-index: 2
            opacity: .8
        .save-btn
            background-color: var(--text-color)
            color: var(--main-bg)
            font-size: 14px
            padding: 8px
            border: none
            border-radius: 4px
    .note-topics
        display: flex
        flex-wrap: wrap
        gap: 7px
        margin-bottom: 30px
        .topic
            display: flex
            align-items: center
            gap: 20px
            background-color: var(--creme-color)
            padding: 5px 10px
            border-radius: 4px
            font-weight: 500
            font-family: sans-serif
            opacity: .6
            cursor: pointer
            border: 1px solid rgba(0,0,0,0)
            font-size: 14px
            &_active
                opacity: 1
                border-color: var(--border-color)
            .delete-icon
                width: 14px
                height: 14px
                background-color: var(--text-color)
                mask: url(@/assets/images/icons/close-round.svg) no-repeat center
                display: block
                mask-size: contain
        .add-more
            width: 40px
            min-height: 25px
            border: none
            background-color: var(--text-color)
            background-color: var(--text-color)
            border-radius: 4px
            .add-icon
                mask-size: contain
                mask: url(@/assets/images/icons/plus-round.svg) no-repeat center
                background-color: var(--main-bg)
                display: block
                width: 50%
                height: 60%
        .topic-error
            width: 100%
        .form
            position: relative
            width: 100%
            margin-top: 0
            margin-top: 10px
            padding: 25px 10px
            background-color: #fff
            border: 1px solid var(--creme-color)
            border-radius: 4px
            margin-bottom: 40px
            .colors
                margin-top: 10px
                display: grid
                grid-template-columns: repeat(5, 1fr)
                grid-gap: 5px
                .color
                    height: 35px
                    border: none
                    border-radius: 2px
                    opacity: .7
                    border: 2px solid rgba(0,0,0,0)
                .active
                    opacity: 1
                    border-color: var(--border-color)
            .input-wrapper
                font-size: 12px
                .content-name
                    font-size: 12px
            .title
                font-size: 12px
            
    .items
        margin-top: 10px
        display: flex
        flex-direction: column
        gap: 8px
        .item
            position: relative
            background-color: var(--block-bg)
            padding: 14px 12px
            box-shadow: 0 2px 6px rgba(0,0,0,0.08)
            font-size: 1rem
            font-weight: 500
            border-radius: 4px
            .text
                padding-right: 34px
                margin-top: 10px
                font-family: sans-serif
                & > *
                    font-family: sans-serif
            .topic
                padding: 3px 10px
                font-size: 14px
                border-radius: 4px
                font-family: sans-serif

            .close-icon
                cursor: pointer
                width: 14px
                opacity: .6
                position: absolute
                right: 12px
                top: 14px
            ol, ul
                margin-left: 20px
                padding: 0
                li
                    list-style-type: unset
                
            .date, .updated-date, .author
                color: var(--text-color)
                opacity: .6
                font-weight: 500
                font-size: 14px
            .footer
                display: flex
                justify-content: space-between
                align-items: center
                margin-top: 15px

@media only screen and (min-width: $bp-tablet)
    .notes-page
        .add-new
            margin-top: 40px
            padding: 12px 16px
            font-size: 18px
            font-weight: 600
        .form
            gap: 10px
            margin-top: 40px
            .input-wrapper
                font-size: 18px
            .ql-editor
                font-size: 18px
                &::before
                    font-size: inherit
            .save-btn
                font-size: 18px
                font-weight: 600
                padding: 12px
        .note-topics
            gap: 10px
            .topic
                padding: 8px 18px
                font-size: 1rem
            .form
                .colors
                    display: flex
                    width: 100%
                    .color
                        flex: 1
        .items
            margin-top: 40px
            gap: 14px
            .item
                padding: 26px
                font-size: 18px
                .text
                    margin-top: 15px
                .close-icon
                    top: 26px
                    right: 26px
                    width: 16px
                .date, .updated-date, .author
                    font-size: 1rem
@media only screen and (min-width: $bp-tablet-landscape-up)
    .notes-page
        .content
            display: grid
            grid-template-areas: 'h1 btn' 'page-cont page-cont'
            grid-template-columns: 1fr 25%
        .h1-wrapper
            grid-area: h1
        .add-new
            grid-area: btn
        .page-content
            grid-area: page-cont
        .add-new
            margin-top: 20px
            padding: 10px 14px
            font-size: 16px
            font-weight: 600
            align-self: center
        .note-topics
            .topic
                font-size: 14px
                padding: 5px 10px
        .form
            gap: 10px
            margin-top: 40px
            .input-wrapper
                font-size: 16px
                
            .ql-editor
                font-size: 16px
                &::before
                    font-size: inherit
            .save-btn
                font-size: 18px
                font-weight: 600
                padding: 12px
        .items
            margin-top: 20px
            gap: 10px
            grid-area: items
            .item
                padding: 22px
                font-size: 16px
                .close-icon
                    top: 22px
                    right: 22px
                    width: 16px
                .date, .updated-date, .author
                    font-size: 1rem
@media only screen and (min-width: $bp-pc)
    .notes-page
        .form
            .ql-editor
                font-size: 18px
                &::before
                    font-size: inherit
        .note-topics
            .topic
                font-size: 1rem
                padding: 12px 20px
                .delete-icon
                    width: 20px
                    height: 20px
            .form
                background-color: rgba(0,0,0,0)
                border: none
                padding: 0
                padding-right: 50%
                .input-wrapper
                    font-size: 1rem
                    .input
                        font-size: 1rem
                    .content-name
                        font-size: 1rem
                .close-icon
                    right: 50%
                    transform: translateX(50%)
        .add-new
            padding: 16px
            font-size: 18px
        .items
            .item
                font-size: 18px
</style>
