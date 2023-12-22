<template>
    <div class="tw-flex">
        <div class="tw-m-auto">
            <MemberForm @submit="handleSunmit" v-model:member="member" />
        </div>
    </div>
</template>

<script setup>
import MemberForm from '@/components/MemberForm.vue'
import MemberService from '@/services/MemberService'
import { useToast } from 'primevue/usetoast'
import { onBeforeMount, ref } from 'vue'

const member = ref()
const toast = useToast()

onBeforeMount(() => {
    loadData()
})

const handleSunmit = (member, payload) => {
    let body = {
        ...payload,
        status: null,
        permissions: null
    }
    MemberService.updateProfile(body)
        .then(({ success, message, data }) => {
            if (!success) {
                toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })
                return
            }
            console.log(data)
            toast.add({ severity: 'success', summary: 'Success', detail: 'Edit member successfully', life: 3000 })
        })
        .catch((err) => {
            console.log(err)
        })
    loadData()
}

const loadData = () => {
    MemberService.getMemberInfo().then(({ success, message, data }) => {
        if (!success) {
            toast.add({ severity: 'error', summary: 'Error', detail: message })
            return
        }
        console.log(data)
        member.value = data
    })
}
</script>
