<template>
    <div class="flex h-screen">
        <div class="m-auto surface-card p-4 shadow-2 border-round w-full lg:w-6">
            <div class="text-center mb-5">
                <!-- <img src="/images/blocks/logos/hyper.svg" alt="Image" height="50" class="mb-3" /> -->
                <div class="text-900 text-3xl font-medium mb-3">Welcome Back</div>
                <span class="text-600 font-medium line-height-3">Don't have an account?</span>
                <a class="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Create today!</a>
            </div>
            <form @submit="onSubmit">
                <InputForm id="id" label="ID" />
                <InputForm id="password" label="Password" type="password" />
                <div class="flex align-items-center justify-content-between mb-6">
                    <div class="flex align-items-center">
                        <Checkbox id="rememberme1" :binary="true" v-model="checked" class="mr-2"></Checkbox>
                        <label for="rememberme1">Remember me</label>
                    </div>
                    <!-- <a class="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer">Forgot password?</a> -->
                </div>
                <Button label="Sign In" type="submit" icon="pi pi-user" class="w-full"></Button>
            </form>
        </div>
    </div>
</template>
<script setup>
import InputForm from '@/components/InputForm.vue'
import MemberService from '@/services/MemberService'
import store from '@/store'
import jsCookie from 'js-cookie'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import { useForm } from 'vee-validate'
import { useRoute, useRouter } from 'vue-router'
import * as yup from 'yup'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { handleSubmit } = useForm({
    validationSchema: yup.object({
        id: yup.string()
            .matches('^[0-9]+$', 'ID must be only numbers')
            .min(4, 'ID must be at least 4 characters')
            .required('ID is required'),
        password: yup.string().required('Password is required')
    })
})

const onSubmit = handleSubmit((payload) => {
    console.log(payload)

    MemberService.login(payload)
        .then(({ success, data, message}) => {
            console.log(data)
            if (success) {
                jsCookie.set('access_token', data.accessToken)
                let redirect = route.query.redirect || '/member'
                router.push(redirect)
                return
            }
            throw new Error(message)
        })
        .then(() => {
            store.dispatch('fetchUserInfo')
        })
        .catch((err) => {
            console.log(err)
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: err.message,
                life: 3000
            })
        })
})
</script>
