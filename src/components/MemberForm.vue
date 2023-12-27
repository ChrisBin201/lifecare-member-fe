<template>
    <div class="flex">
        <div class="m-auto surface-card p-4 w-full">
            <div class="text-center mb-5">
                <div class="text-900 text-3xl font-medium mb-3">Member Info</div>
            </div>
            <form @submit="onSubmit">
                <InputForm :disabled="!isAdmin" id="id" label="ID" :show-error="submitCount > 0" />
                <InputForm id="name" label="Name" :show-error="submitCount > 0" />
                <div>
                    <label for="email" class="block text-900 font-medium mb-2">Email</label>
                    <div class="flex gap-2 align-items-center">
                        <InputForm id="email" :show-error="submitCount > 0" />
                        <span class="text-xl font-medium mb-4">@</span>
                        <InputText disabled v-model="emailDomain" class="mb-4 opacity-80" :class="{ 'p-invalid': submitCount > 0 && errorMessage && !emailDomain }" aria-describedby="text-error" />
                        <Dropdown v-model="emailName" :options="EMAIL_DOMAINS.map((e) => e.name)" @update:model-value="onChangeEmailDomain" placeholder="Select a Domain" class="w-full mb-4" />
                    </div>
                </div>
                <InputForm id="phone" label="Phone" :show-error="submitCount > 0" />
                <div class="mb-4">
                    <InputForm id="password" label="New password" type="password" :show-error="submitCount > 0" />
                    <div class="tw-w-[500px] tw-text-gray-500">English case/case/special/numeric, 2 combinations (10-20 characters), 3 combinations (8-20 characters), Serial number not allowed, Special characters are !@#$%^&*</div>
                </div>
                <InputForm id="passwordConfirm" label="Password Confirm" type="password" :show-error="submitCount > 0" />
                <div v-if="isAdmin" class="mb-5">
                    <label for="permission" class="block text-900 font-medium mb-2">Permission</label>
                    <MultiSelect v-model="selectedPermissions" display="chip" :options="permissions" optionLabel="name" placeholder="Select Permissions" :maxSelectedLabels="3" class="w-full md:w-20rem" />
                </div>
                <div v-if="isAdmin" class="mb-5 card flex flex-wrap justify-content-center gap-3">
                    <div v-for="item in MEMBER_STATUS" :key="item.value">
                        <div class="flex align-items-center">
                            <RadioButton v-model="memberStatus" :input-id="item.value" name="memberStatus" :value="item.value" />
                            <label :for="item.value" class="ml-2"> {{ item.name }} </label>
                        </div>
                    </div>
                </div>

                <Button label="Edit" type="submit" icon="pi pi-user" class="w-full"></Button>
            </form>
        </div>
    </div>
</template>
<script setup>
import InputForm from '@/components/InputForm.vue'
import PermissionService from '@/services/PermissionService'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { useFieldError, useForm } from 'vee-validate'
import { onMounted, ref, watch } from 'vue'
import * as yup from 'yup'
import MultiSelect from 'primevue/multiselect'
import RadioButton from 'primevue/radiobutton'
import store from '@/store'

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

const MEMBER_STATUS = [
    {
        name: 'ACTIVE',
        value: 'ACTIVE'
    },
    {
        name: 'BLOCK',
        value: 'INACTIVE'
    }
]

const props = defineProps({
    member: {
        type: Object,
        required: true
    },
    onSubmit: {
        type: Function,
        required: true
    }
})

onMounted(() => {
    PermissionService.findAll()
        .then(({ success, message, data }) => {
            if (!success) {
                console.log(message)
                return
            }
            console.log(data)
            permissions.value = data
        })
        .catch((err) => {
            console.log(err)
        })
    if (store.state.userInfo) isAdmin.value = store.state.userInfo.role === 'ADMIN'
})

const emailName = ref(EMAIL_DOMAINS.find((e) => e.value === props.member.email.split('@')[1]).name)
const emailDomain = ref(props.member.email.split('@')[1])
const permissions = ref()
const selectedPermissions = ref(props.member.permissions)
const memberStatus = ref(props.member.status)
const isAdmin = ref(false)

watch(
    () => store.state.userInfo,
    () => {
        console.log(store.state.userInfo)
        if (!store.state.userInfo) return
        isAdmin.value = store.state.userInfo.role === 'ADMIN'
    }
)

watch(
    () => selectedPermissions.value,
    (permissions) => {
        console.log(permissions)
        setFieldValue(
            'permissions',
            permissions.map((p) => p.id)
        )
    }
)

watch(
    () => memberStatus.value,
    (status) => {
        console.log(status)
        setFieldValue('status', status)
    }
)

const { handleSubmit, setFieldError, setFieldValue, submitCount } = useForm({
    validationSchema: yup.object({
        id: yup.string().required('ID is required').matches('^[0-9]+$', {
            message: 'ID must be only numbers',
            excludeEmptyString: true
        }).min(4, 'ID must be at least 4 characters'),
        name: yup.string().matches('^[a-zA-Z\\s]+$', 'Name must be only letters').required('Name is required'),
        email: yup.string().required('Email is required'),
        phone: yup.string().min(10, 'Phone must be at least 10 characters').matches('^[0-9]+$', 'Phone must be only numbers').required('Phone is required'),
        password: yup.string(),
        // .min(6),
        // .required('Password is required'),
        passwordConfirm: yup
            .string()
            // .required('Password confirm is required')
            // .min(6)
            .oneOf([yup.ref('password')], 'Passwords must match'),
        permissions: yup.array().min(0, 'Permissions is required'),
        status: yup.string().required('Status is required')
    }),
    initialValues: {
        id: props.member.id,
        name: props.member.name,
        email: props.member.email.split('@')[0],
        phone: props.member.phone,
        permissions: props.member.permissions? props.member.permissions.map((p) => p.id): [],
        status: props.member.status
    }
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
    props.onSubmit(props.member, payload)
})

const emailValid = (email) => {
    // let emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/
    let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
}

const passwordValidated = (password) => {
    // Check if the password length is within the specified range
    if (password.length < 8 || password.length > 20) {
        return false
    }

    // Check if the password contains only letters, numbers, and allowed special characters
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
