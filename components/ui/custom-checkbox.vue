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
$CHECKMARK-size-mobile: 22px
$CHECKMARK-size-tablet: 30px
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
        min-height: $CHECKMARK-size-mobile
        min-width: $CHECKMARK-size-mobile
        max-height: $CHECKMARK-size-mobile
        max-width: $CHECKMARK-size-mobile
        border-radius: 6px
        background-color: #fff
        border: 2px solid var(--border-color)
        transition: all 0.2s ease
        img
            width: 60%
        &_checked
            background-color: var(--accent-red)
            border-color: var(--accent-red)

    .checkbox:hover input~.checkmark 
        border-color: var(--accent-red)
        background-color: rgba(232, 69, 32, 0.05)
@media only screen and (min-width: $bp-tablet)
    .checkbox
        padding: 14px
        gap: 20px
        .label-text
            font-size: 20px
        .checkmark
            min-height: $CHECKMARK-size-tablet
            min-width: $CHECKMARK-size-tablet
            max-height: $CHECKMARK-size-tablet
            max-width: $CHECKMARK-size-tablet
@media only screen and (min-width: $bp-tablet-landscape-up)
    .checkbox
        padding: 10px 0
        .label-text
            font-size: 1rem
        .checkmark
            min-height: $CHECKMARK-size-mobile
            min-width: $CHECKMARK-size-mobile
            max-height: $CHECKMARK-size-mobile
            max-width: $CHECKMARK-size-mobile
@media only screen and (min-width: $bp-pc)
    .checkbox
        align-items: center
        .label-text
            font-size: 18px
        .checkmark
            min-height: $CHECKMARK-size-tablet
            min-width: $CHECKMARK-size-tablet
            max-height: $CHECKMARK-size-tablet
            max-width: $CHECKMARK-size-tablet
        &:hover
            .checkmark
                border-color: var(--accent-red)
                background-color: rgba(232, 69, 32, 0.05)
</style>