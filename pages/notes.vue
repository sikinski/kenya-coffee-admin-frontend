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
            border-radius: 4px
            .text
                padding-right: 34px
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
</style>
