<template>
    <label class="checkbox">
        <span class="checkmark center transition" :class="{ 'checkmark_checked': modelValue }">
            <img v-if="modelValue" src="@/assets/images/icons/checkmark.svg" alt="✔">
        </span>
        <p class="label-text">{{ label }}</p>
        <input type="checkbox" :id="id" :checked="modelValue"
            @change="$emit('update:modelValue', $event.target.checked)" />
    </label>
</template>

<script setup>
defineProps({
    modelValue: Boolean,  // Используем Boolean вместо String
    label: String,
    id: [String, Number],
});

defineEmits(["update:modelValue"]);
</script>

<style lang="sass" scoped>
@import '@/assets/styles/adaptive'
.checkbox 
    position: relative
    cursor: pointer
    -webkit-user-select: none
    -moz-user-select: none
    -ms-user-select: none
    user-select: none
    padding: 12px
    display: flex
    // align-items: center
    gap: 16px
    border-radius: 5px
    .label-text
        font-size: 1rem
        font-weight: 500
        color: var(--opacity-color)
        line-height: 100%
    input 
        position: absolute
        opacity: 0
        cursor: pointer
        height: 0
        width: 0
    .checkmark
        min-height: 22px
        min-width: 22px
        max-height: 22px
        max-width: 22px
        border-radius: 4px
        background-color: var(--block-bg)
        border: 1px solid var(--main-dark)
        img
            width: 60%
        &_checked
            background-color: var(--main-dark)

    .checkbox:hover input~.checkmark 
        background-color: #eee
</style>