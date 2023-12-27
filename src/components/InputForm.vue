<template>
    <div class="mb-2">
        <label :for="id" class="block text-900 font-medium mb-2">{{ label }}</label>
        <InputText :id="id" v-model="value" :disabled="disabled" :type="type" :class="`${showError && errorMessage && 'p-invalid'} w-full mb-1`" aria-describedby="text-error" />
        <small class="p-error" id="text-error">{{ showError && errorMessage || '&nbsp;' }}</small>
    </div>
</template>

<script setup>
import InputText from 'primevue/inputtext'
import { useField } from 'vee-validate'

const props = defineProps({
    type: {
        type: String,
        default: 'text'
    },
    label: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    disabled: {
        type: Boolean,
        default: false
    },
    showError: {
        type: Boolean,
        default: true
    },
    icon: {
        type: String,
        default: null
    }
})

const { value, errorMessage } = useField(() => props.id)
</script>
