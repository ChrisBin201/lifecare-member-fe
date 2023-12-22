<script setup>
import { onMounted } from 'vue'
import store from './store'
import Toast from 'primevue/toast'
import NavigationBar from './components/NavigationBar.vue';
import { useRoute } from 'vue-router';
import ConfirmDialog from 'primevue/confirmdialog';

console.log('Hello Vue 3 + Vite')
onMounted(() => {
    store.dispatch('fetchUserInfo')
})

const route = useRoute()

</script>

<template>
    <NavigationBar v-if="route.path !== '/login'" />
    <router-view />
    <Toast position="top-center" />
    <ConfirmDialog></ConfirmDialog>
</template>
