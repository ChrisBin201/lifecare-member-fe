<template>
    <div>
        <div class="card">
            <!-- <Toolbar class="mb-4">
                <template #start>
                    <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
                </template>

                <template #end>
                    <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                </template>
            </Toolbar> -->
<!-- /*Create common table file*/ -->
            <DataTable
                ref="dt"
                :value="members"
                sort-field="memberNo"
                :sort-order="1"
                lazy
                paginator
                :total-records="totalRecords"
                :rows="filterParams.size"
                :first="filterParams.page * filterParams.size"
                :rows-per-page-options="[5, 10, 25]"
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                current-page-report-template="Showing {first} to {last} of {totalRecords} members"
                :loading="loading"
                data-key="memberNo"
                @filter="onFilter"
                @sort="onSort"
                @page="onPage"
            >
                <template #header>
                    <form @submit="handleSearch" class="flex flex-column gap-5 px-5 justify-content-between">
                        <h4 class="m-0">Manage Members</h4>
                        <div class="flex gap-4 justify-content-between">
                            <div class="flex flex-column gap-2">
                                <span class="p-input-icon-left">
                                    <i class="pi pi-search" />
                                    <InputText v-model="filterParams.id" type="text" name="id" @input="onChangeSearch" placeholder="Search id" />
                                </span>
                                <small class="p-error tw-h-5 tw-w-56" id="text-error">{{ errors.id || '&nbsp;' }}</small>
                            </div>
                            <div class="flex flex-column gap-2">
                                <span class="p-input-icon-left">
                                    <i class="pi pi-search" />
                                    <InputText v-model="filterParams.name" type="text" name="name" @input="onChangeSearch" placeholder="Search name" />
                                </span>
                                <small class="p-error tw-h-5 tw-w-56" id="text-error">{{ errors.name || '&nbsp;' }}</small>
                            </div>
                            <div class="flex flex-column gap-2">
                                <span class="p-input-icon-left">
                                    <i class="pi pi-search" />
                                    <InputText v-model="filterParams.phone" type="text" name="phone" @input="onChangeSearch" placeholder="Search phone" />
                                </span>
                                <small class="p-error tw-h-5 tw-w-56" id="text-error">{{ errors.phone || '&nbsp;' }}</small>
                            </div>
                            <div>
                                <Calendar id="fromDate" v-model="fromDate" @update:model-value="onChangeDate" placeholder="From date" date-format="dd/mm/yy" show-icon selection-mode="single" :manual-input="false" />
                            </div>
                            <div>
                                <Calendar id="toDate" v-model="toDate" :min-date="fromDate" @update:model-value="onChangeDate" placeholder="To date" date-format="dd/mm/yy" show-icon selection-mode="single" :manual-input="false" />
                            </div>
                        </div>
                        <div class="align-self-end flex gap-4">
                            <Button label="Export" severity="info" icon="pi pi-upload " @click="exportExcel" />
                            <Button type="submit" label="Search" icon="pi pi-search " />
                        </div>
                    </form>
                </template>

                <!-- <Column selection-mode="multiple" style="width: 3rem" :exportable="false"></Column> -->
                <Column field="memberNo" header="Member No" sortable style="min-width: 12rem"></Column>
                <Column field="id" header="ID" sortable style="min-width: 16rem"></Column>
                <Column field="name" header="Name" sortable style="min-width: 16rem"></Column>
                <Column field="phone" header="Phone" sortable style="min-width: 16rem"></Column>
                <Column field="email" header="Email" sortable style="min-width: 12rem"></Column>
                <Column field="createdDate" header="Join date" fie sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        {{ milisToDateString(slotProps.data.createdDate) }}
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button
                            v-if="slotProps.data.role !== 'ADMIN' 
                            && (store.state.userInfo.permissions.some((p) => p.code === 'UPDATE') 
                                || (isAdmin && slotProps.data.memberNo !== store.state.userInfo.memberNo))"
                            icon="pi pi-pencil"
                            outlined
                            rounded
                            class="mr-2"
                            @click="editMember(slotProps.data)"
                        />
                        <Button
                            v-if="slotProps.data.role !== 'ADMIN' 
                            && (store.state.userInfo.permissions.some((p) => p.code === 'DELETE') 
                                || (isAdmin && slotProps.data.memberNo !== store.state.userInfo.memberNo))"
                            icon="pi pi-trash"
                            outlined
                            rounded
                            severity="danger"
                            @click="confirmDelMember(slotProps.data)"
                        />
                        <!-- <span>{{ store.state.userInfo }}</span> -->
                    </template>
                </Column>
            </DataTable>
            <!-- /*Create common table file*/ -->
            <Dialog v-model:visible="visible" modal :style="{ width: '80rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
                <MemberForm @submit="handleSubmitMember" :member="selectedMember" />
            </Dialog>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import MemberService from '@/services/MemberService'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import store from '@/store'
import Dialog from 'primevue/dialog'
import MemberForm from '@/components/MemberForm.vue'
import { useConfirm } from 'primevue/useconfirm'
import { useForm } from 'vee-validate'
import * as yup from 'yup'

onMounted(() => {
    console.log(fromDate.value.getTime())
    console.log(toDate.value.getTime())
    loading.value = true
    filterParams.value = {
        page: 0,
        size: 5,
        fromDate: fromDate.value.getTime(),
        toDate: toDate.value.getTime()
    }
    loadData()
    if (store.state.userInfo) isAdmin.value = store.state.userInfo.role === 'ADMIN'
})

watch(
    () => store.state.userInfo,
    () => {
        console.log(store.state.userInfo)
        if (!store.state.userInfo) return
        isAdmin.value = store.state.userInfo.role === 'ADMIN'
    }
)

let now = new Date()
let lastYear = new Date()
lastYear.setFullYear(now.getFullYear() - 1)
const dt = ref()
const members = ref()
const loading = ref(false)
const totalRecords = ref(0)
const fromDate = ref(lastYear)
const toDate = ref(now)
const isAdmin = ref(false)
const visible = ref(false)
const selectedMember = ref()
const filterParams = ref({})

const toast = useToast()
const confirm = useConfirm()
const { handleSubmit, setFieldValue, errors, meta } = useForm({
    validationSchema: yup.object({
        id: yup.string().matches('^\\d{3,}$', {
            message: 'ID must be only numbers and at least 3 characters',
            excludeEmptyString: true
        }),
        name: yup.string().matches('^[a-zA-Z]{2,}(?: [a-zA-Z]+)*$', {
            message: 'Name must be only letters and at least 2 characters',
            excludeEmptyString: true
        }),
        phone: yup
            .string()
            .matches('^[0-9]+$', {
                message: 'Phone must be only numbers',
                excludeEmptyString: true
            })
            .optional()
    })
})

const loadData = () => {
    MemberService.search({ ...filterParams.value }).then(({ success, message, data }) => {
        if (!success) {
            console.log(message)
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: message,
                life: 3000
            })
            return
        }
        members.value = data.list
        loading.value = false
        totalRecords.value = data.total
        console.log(data)
    })
}

const confirmDelMember = (member) => {
    confirm.require({
        message: 'Do you want to delete this member?',
        header: 'Delete Confirmation',
        icon: 'pi pi-info-circle',
        rejectClass: 'p-button-text p-button-text',
        acceptClass: 'p-button-danger p-button-text',
        accept: () => {
            MemberService.deleteMember(member.memberNo).then(({ success, message }) => {
                if (!success) {
                    console.log(message)
                    toast.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: message,
                        life: 3000
                    })
                    return
                }
                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Delete member successfully',
                    life: 3000
                })
                loadData()
            })
        }
    })
}

const handleSubmitMember = (member, payload) => {
    MemberService.updateMemberInfo(member.memberNo, payload)
        .then(({ success, message, data }) => {
            if (!success) {
                toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })
                return
            }
            console.log(data)
            toast.add({ severity: 'success', summary: 'Success', detail: 'Edit member successfully', life: 3000 })
            visible.value = false
            loadData()
        })
        .catch((err) => {
            console.log(err)
        })
}

const handleSearch = handleSubmit(() => {
    filterParams.value.page = 0
    filterParams.value = {
        ...filterParams.value,
        // ...values,
        fromDate: fromDate.value.getTime(),
        toDate: toDate.value.getTime()
    }
    loadData()
})

const editMember = (member) => {
    selectedMember.value = member
    visible.value = true
}

const milisToDateString = (milis) => {
    const date = new Date(milis)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const onChangeDate = () => {
    if (fromDate.value && toDate.value) {
        if (fromDate.value.getTime() > toDate.value.getTime()) {
            toast.add({
                severity: 'warn',
                summary: 'Error',
                detail: 'From date must be before to date',
                life: 3000
            })
            return
        }
        filterParams.value.fromDate = fromDate.value.getTime()
        filterParams.value.toDate = toDate.value.getTime()
        // loadData()
    }
}

const onChangeSearch = (event) => {
    // if (event.target.name === 'name' && event.target.value.length < 2 && event.target.value !== '') return
    filterParams.value.page = 0
    filterParams.value[event.target.name] = event.target.value === '' ? null : event.target.value
    setFieldValue(event.target.name, event.target.value)
    // loadData()
}

const onPage = (event) => {
    filterParams.value.page = event.page
    filterParams.value.size = event.rows
    console.log(filterParams.value)
    loadData()
}

const onFilter = (event) => {
    filterParams.value.page = 0
    filterParams.value = event.filters
    console.log(filterParams.value)
    loadData()
}

const onSort = (event) => {
    filterParams.value.page = 0
    if (event.sortField) filterParams.value.sort = event.sortField
    if (event.sortOrder) filterParams.value.direction = event.sortOrder === 1 ? 'asc' : 'desc'
    console.log(event)
    console.log(filterParams.value)
    loadData()
}

const exportExcel = () => {
    if (!meta.value.valid) {
        toast.add({
            severity: 'warn',
            summary: 'Error',
            detail: '`Please fix all errors before export`',
            life: 3000
        })
        return
    }
    MemberService.exportExcel({ ...filterParams.value }).then(({ success, message, data }) => {
        if (!success) {
            console.log(message)
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: message,
                life: 3000
            })
            return
        }
        let { blob, fileName } = data
        const downloadLink = document.createElement('a')
        const blobUrl = URL.createObjectURL(blob)
        downloadLink.href = blobUrl
        downloadLink.download = fileName
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        URL.revokeObjectURL(blobUrl)
    })
}
</script>
