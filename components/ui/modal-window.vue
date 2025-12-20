<template>
    <teleport to="Body">
        <div class="modal-overlay" @click.self="handleClose">
            <div class="window">
                <div class="modal-header" v-if="$slots.title">
                    <slot name="title"></slot>
                    <button type="button" class="close-btn" @click="handleClose">
                        <img src="@/assets/images/icons/close.svg" alt="" class="close-icon">
                    </button>
                </div>
                <div class="body">
                    <slot name="body"></slot>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script setup>
const emit = defineEmits(['close'])

const handleClose = () => {
    emit('close')
}
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
@keyframes fadeIn
    from
        opacity: 0
    to
        opacity: 1

@keyframes slideUp
    from
        opacity: 0
        transform: translateY(20px)
    to
        opacity: 1
        transform: translateY(0)
.modal-overlay
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    background-color: rgba(0, 0, 0, 0.5)
    display: flex
    align-items: center
    justify-content: center
    z-index: 20
    padding: 20px
    animation: fadeIn 0.2s ease
    .window
        background-color: #fff
        border-radius: 12px
        width: 100%
        max-width: 900px
        max-height: 90vh
        display: flex
        flex-direction: column
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2)
        animation: slideUp 0.3s ease
        padding: 0
        overflow: hidden
        
        .modal-header
            display: flex
            justify-content: space-between
            align-items: center
            padding: 24px 24px 16px 24px
            border-bottom: 1px solid var(--border-color)
            border-radius: 12px
            .title
                font-size: 20px
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
        .body
            padding: 24px
            overflow-y: auto
            flex: 1

@media only screen and (max-width: $bp-tablet)
    .modal-overlay
        padding: 10px
        .window
            max-width: 100%
            max-height: 95vh
            border-radius: 12px 12px 0 0
            .modal-header
                padding: 16px
            .body
                padding: 16px
</style>
