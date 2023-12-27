<template>
    <div class="flex h-screen">
        <div class="m-auto surface-card p-4 shadow-2 border-round w-full lg:w-6">
            <div class="text-center mb-5">
                <!-- <img src="/images/blocks/logos/hyper.svg" alt="Image" height="50" class="mb-3" /> -->
                <div class="text-900 text-3xl font-medium mb-3">Welcome to LG CNS</div>
                <!-- <span class="text-600 font-medium line-height-3">Don't have an account?</span>
                <a class="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Create today!</a> -->
            </div>
            <form @submit="onSubmit">
                <InputForm :show-error="submitCount > 0" id="id" label="ID" />
                <InputForm :show-error="submitCount > 0" id="name" label="Name" />
                <div>
                    <label for="email" class="block text-900 font-medium mb-2">Email</label>
                    <div class="flex gap-2 align-items-center">
                        <InputForm :show-error="submitCount > 0" id="email" />
                        <span class="text-xl font-medium mb-4">@</span>
                        <InputText disabled v-model="emailDomain" class="mb-4 opacity-80" :class="{ 'p-invalid': submitCount > 0 && errorMessage && !emailDomain }" aria-describedby="text-error" />
                        <Dropdown v-model="emailName" :options="EMAIL_DOMAINS.map((e) => e.name)" @update:model-value="onChangeEmailDomain" placeholder="Select a Domain" class="w-full mb-4" />
                    </div>
                </div>
                <InputForm id="phone" :show-error="submitCount > 0" label="Phone" />
                <div class="mb-4">
                    <InputForm id="password" :show-error="submitCount > 0" label="New password" type="password" />
                    <div class="tw-w-[500px] tw-text-gray-500">English case/case/special/numeric, 2 combinations (10-20 characters), 3 combinations (8-20 characters), Serial number not allowed, Special characters are !@#$%^&*</div>
                </div>
                <InputForm id="passwordConfirm" :show-error="submitCount > 0" label="Password Confirm" type="password" />
                <!-- <div class="flex align-items-center justify-content-between mb-6">
                    <div class="flex align-items-center">
                        <Checkbox id="rememberme1" :binary="true" v-model="checked" class="mr-2"></Checkbox>
                        <label for="rememberme1">Remember me</label>
                    </div>
                    <a class="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer">Forgot password?</a>
                </div> -->
                <Button label="Sign Up" type="submit" icon="pi pi-user" class="w-full"></Button>
            </form>
        </div>
    </div>
</template>
<script setup>
import InputForm from '@/components/InputForm.vue'
import router from '@/router'
import MemberService from '@/services/MemberService'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { useFieldError, useForm } from 'vee-validate'
import { ref } from 'vue'
import * as yup from 'yup'
import { useToast } from 'primevue/usetoast'

const EMAIL_DOMAINS = [
    {
        name: 'GMAIL',
        value: 'gmail.com'
    },
    {
        name: 'NAVER',
        value: 'naver.com'
    },
    {
        name: 'DAUM',
        value: 'daum.net'
    },
    {
        name: 'NATE',
        value: 'nate.com'
    },
    {
        name: 'HOTMAIL',
        value: 'hotmail.com'
    }
]

const emailName = ref()
const emailDomain = ref()

const toast = useToast()
const { handleSubmit, setFieldError, submitCount } = useForm({
    validationSchema: yup.object({
        id: yup.string().required('ID is required').matches('^[0-9]+$', {
            message: 'ID must be only numbers',
            excludeEmptyString: true
        }).min(4, 'ID must be at least 4 characters'),
        name: yup.string().matches('^[a-zA-Z\\s]+$', 'Name must be only letters').required('Name is required'),
        email: yup.string().required('Email is required'),
        phone: yup.string().min(10, 'Phone must be at least 10 characters').matches('^[0-9]+$', 'Phone must be only numbers').required('Phone is required'),
        password: yup
            .string()
            // .min(6),
            .required('Password is required'),
        passwordConfirm: yup
            .string()
            .required('Password confirm is required')
            // .min(6)
            .oneOf([yup.ref('password')], 'Passwords must match')
            /*create common file to store message or regex or validation*/
    })
})

const errorMessage = useFieldError('email')

const onChangeEmailDomain = (name) => {
    console.log(name)
    let domainValue = EMAIL_DOMAINS.find((e) => e.name === name).value
    emailDomain.value = domainValue
}

const onSubmit = handleSubmit((values) => {
    console.log(values)
    console.log(emailDomain.value)
    let email = `${values.email}@${emailDomain.value}`
    if (!emailValid(email) || !EMAIL_DOMAINS.some((domain) => domain.value === emailDomain.value)) {
        setFieldError('email', 'Email is not valid')
        return
    }
    if (values.password && !passwordValidated(values.password)) {
        setFieldError('password', 'Password is not valid')
        return
    }

    let payload = {
        ...values,
        email: email
    }
    console.log(payload)
    MemberService.register(payload)
        .then((data) => {
            console.log(data)
            if (data.success) {
                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Register successfully',
                    life: 3000
                })
                router.push('/member')
            } else throw new Error(data.message)
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

const emailValid = (email) => {
    // let emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/
    /*create common file to store message or regex or validation*/
    let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
}

const passwordValidated = (password) => {
    // Check if the password length is within the specified range
    if (password.length < 8 || password.length > 20) {
        return false
    }

    // Check if the password contains only letters, numbers, and allowed special characters
    /*create common file to store message or regex or validation*/
    const pattern = /^[a-zA-Z0-9!@#$%^&*]+$/
    if (!pattern.test(password)) {
        return false
    }

    // Check if consecutive numbers are not more than 3 characters
    if (containsConsecutiveNumbers(password, 3)) {
        return false
    }

    // Check if the password meets the specific length requirements based on combinations
    const combinationCount = countCharacterCombinations(password)
    if ((combinationCount === 2 && (password.length < 10 || password.length > 20)) || (combinationCount === 3 && (password.length < 8 || password.length > 20))) {
        return false
    }

    return true
}

function containsConsecutiveNumbers(password, maxConsecutive) {
    const consecutiveNumbers = '01234567890'
    for (let i = 0; i < password.length - maxConsecutive + 1; i++) {
        const subString = password.substring(i, i + maxConsecutive)
        if (consecutiveNumbers.includes(subString)) {
            return true
        }
    }
    return false
}

function countCharacterCombinations(password) {
    let combinationCount = 0
    if (/[a-z]/.test(password) || /[A-Z]/.test(password)) {
        combinationCount++
    }
    if (/\d/.test(password)) {
        combinationCount++
    }
    if (/[!@#$%^&*]/.test(password)) {
        combinationCount++
    }
    return combinationCount
}
</script>
