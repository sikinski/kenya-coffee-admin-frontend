<template>
    <div class="notes-page page-padding">
        <div class="content">
            <div class="h1-wrapper">
                <ui-go-back />
                <h1 class="h1">Заметки.</h1>
            </div>

            <button class="add-new" @click="showForm = true" v-if="!showForm">Добавить новую</button>

            <p class="error" id="error-text">{{ serverError }}</p>

            <form class="form" v-if="showForm">
                <div class="input-wrapper text-wrapper">
                    <div class="editor">
                        <client-only>
                            <quill-editor class="input" v-model:content="form.text" contentType="html"
                                :options="editorOptions" placeholder="Напишите что-то" />
                        </client-only>
                    </div>
                </div>

                <button class="save-btn" @click.prevent="addNewNote">Сохранить</button>
            </form>

            <div class="items" v-if="notes?.length">
                <div class="item" v-for="note in notes" :key="note.id">
                    <img @click="deleteNote(note.id)" src="@/assets/images/icons/close.svg" alt="" class="close-icon">

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
</template>

<script setup>
import { onMounted } from 'vue'

const { $api } = useNuxtApp()
const showForm = ref(false)
const serverError = ref('')
const notes = ref([])

const form = ref({
    text: ''
})

const getNotes = async () => {
    notes.value = await $api.get('/notes').then(res => res.data).catch(() => [])
}

const addNewNote = async () => {
    console.log(form.value.text);
    await $api.post(`/notes`, form.value).then(async () => {
        form.value.text = ''
        showForm.value = false
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
        await getNotes()
    }).catch(err => {
        serverError.value = err.response.data.error || err.response.data.message || ''
        const errorBlock = document.getElementById('error-text')
        if (errorBlock) {
            errorBlock.scrollIntoView()
        }
    })
}

onMounted(async () => {
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
    .form
        gap: 10px
        margin-top: 20px
        .input-wrapper
            background-color: #fff
            border: 1px solid var(--creme-color)
            .ql-toolbar
                border-bottom: 1px solid var(--creme-color)
        .ql-editor
            font-size: 16px
            font-family: sans-serif
            &::before
                font-size: inherit
                font-family: sans-serif
        .save-btn
            background-color: var(--text-color)
            color: var(--main-bg)
            font-size: 14px
            padding: 8px
            border: none
            border-radius: 4px
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
                font-family: sans-serif
                & > *
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
        .items
            margin-top: 40px
            gap: 14px
            .item
                padding: 26px
                font-size: 18px
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
            grid-template-areas: 'h1 btn' 'er er' 'form form' 'items items'
            grid-template-columns: 1fr 25%
        .h1-wrapper
            grid-area: h1
        .add-new
            grid-area: btn
        .error
            grid-area: er
        .form
            grid-area: form
        .add-new
            margin-top: 20px
            padding: 10px 14px
            font-size: 16px
            font-weight: 600
            align-self: center
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
        .add-new
            padding: 16px
            font-size: 18px
        .items
            .item
                font-size: 18px
</style>
