<template>
    <div class="html-editor">
        <client-only>
            <quill-editor class="editor-input" :content="modelValue" contentType="html" :options="editorOptions"
                :placeholder="placeholder" @update:content="handleUpdate" />
        </client-only>
    </div>
</template>

<script setup>
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: 'Введите текст'
    }
})

const emit = defineEmits(['update:modelValue'])

// Настройки редактора Quill с полным toolbar
const editorOptions = {
    theme: 'snow',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            ['clean']
        ]
    },
    placeholder: props.placeholder
}

const handleUpdate = (content) => {
    emit('update:modelValue', content)
}
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *

.html-editor
    width: 100%
    min-height: 200px
    display: flex
    flex-direction: column
    .ql-container
        border: 1px solid var(--border-color)
        border-radius: 8px
        font-size: 14px
        font-family: inherit
        min-height: 200px
        flex: 1
        &:hover
            border-color: var(--accent-red)
        &.ql-snow
            border-color: var(--border-color)
    .ql-toolbar
        border: 1px solid var(--border-color)
        border-radius: 8px 8px 0 0
        background-color: #fff
        padding: 12px
        &.ql-snow
            border-color: var(--border-color)
            border-bottom: none
        .ql-stroke
            stroke: var(--text-color)
        .ql-fill
            fill: var(--text-color)
        .ql-picker-label
            color: var(--text-color)
        button:hover,
        button.ql-active
            color: var(--accent-red)
            .ql-stroke
                stroke: var(--accent-red)
            .ql-fill
                fill: var(--accent-red)
    .ql-editor
        min-height: 200px
        padding: 12px 14px
        color: var(--text-color)
        &.ql-blank::before
            color: var(--text-light)
            font-style: normal
        &:focus
            outline: none
    .editor-input
        flex: 1
        display: flex
        flex-direction: column
        .ql-editor
            height: 100%
            flex: 1
    .ql-container.ql-snow
        border-top: none
        border-radius: 0 0 8px 8px
        &:focus-within
            border-color: var(--accent-red)
            box-shadow: 0 0 0 3px rgba(232, 69, 32, 0.1)
</style>
