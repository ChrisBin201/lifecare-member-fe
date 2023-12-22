<template>
    <div class="card">
        <Menubar class="px-4" :model="items">
            <template #item="{ item, props, hasSubmenu, root }">
                <a v-ripple class="flex align-items-center" @click="item.action" v-bind="props.action">
                    <span :class="item.icon" />
                    <span class="ml-2">{{ item.label }}</span>
                    <!-- <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge" />
                    <span v-if="item.shortcut" class="ml-auto border-1 surface-border border-round surface-100 text-xs p-1">{{ item.shortcut }}</span> -->
                    <i v-if="hasSubmenu" :class="['pi pi-angle-down text-primary', { 'pi-angle-down ml-2': root, 'pi-angle-right ml-auto': !root }]"></i>
                </a>
            </template>
            <template #end>
                <div class="flex align-items-center gap-2">
                    <Button icon="pi pi-user"  rounded aria-label="User" @click="toggle" />
                    <OverlayPanel ref="op">
                        <div class="flex flex-column gap-3 tw-text-lg">
                            <div class="flex justify-content-between gap-5">
                                <span>Id:</span>
                                <span>{{ store.state.userInfo.id }}</span>
                            </div>
                            <div class="flex justify-content-between gap-5">
                                <span>Name:</span>
                                <span>{{ store.state.userInfo.name }}</span>
                            </div>
                            <div class="flex justify-content-between gap-5">
                                <span>Phone:</span>
                                <span>{{ store.state.userInfo.phone }}</span>
                            </div>
                            <div class="flex justify-content-between gap-5">
                                <span>Email:</span>
                                <span>{{ store.state.userInfo.email }}</span>
                            </div>
                            <div class="flex justify-content-between gap-5">
                                <span>Role:</span>
                                <span>{{ store.state.userInfo.role }}</span>
                            </div>
                            <div class="flex justify-content-between gap-5">
                                <span>Status:</span>
                                <span>{{ store.state.userInfo.status }}</span>
                            </div>
                            <div class="tw-cursor-pointer tw-text-red-500 hover:tw-bg-gray-100 tw-rounded" @click="logout" >
                                <span class="pi pi-sign-out" ></span>
                                <span class="ml-2" >Sign out</span>
                            </div>
                        </div>
                    </OverlayPanel>
                </div>
            </template>
        </Menubar>
    </div>
</template>

<script setup>
import store from '@/store'
import jsCookie from 'js-cookie'
import Button from 'primevue/button'
import Menubar from 'primevue/menubar'
import OverlayPanel from 'primevue/overlaypanel'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const op = ref()

const toggle = (event) => {
    op.value.toggle(event)
}

const logout = () => {
    jsCookie.remove('access_token')
    window.location.reload()
}

const items = ref([
    {
        label: 'Members',
        icon: 'pi pi-users',
        action: () => router.push('/member')
    },
    {
        label: 'Edit Profile',
        icon: 'pi pi-user-edit',
        action: () => router.push('/profile')
    },
    {
        label: 'Register',
        icon: 'pi pi-user-plus',
        action: () => router.push('/register')
    }
])
</script>
