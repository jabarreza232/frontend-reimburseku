import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
// ============================
    // 1. STATE (Data Entitas)
    // ============================
    const token = ref(localStorage.getItem('token') || null)
    
    // Parse JSON dari localStorage agar data bertahan saat refresh
    const user = ref(JSON.parse(localStorage.getItem('user')) || null)
    const accountPayout = ref(JSON.parse(localStorage.getItem('account_payout')) || null)
    const role = ref(JSON.parse(localStorage.getItem('role')) || null)

    // ============================
    // 2. ACTIONS (Fungsi Modifikasi)
    // ============================
    
    // Fungsi tunggal untuk menyimpan semua data saat Login
    function setAuthData(data) {
        // Set State
        token.value = data.token
        user.value = data.user
        accountPayout.value = data.account_payout
        role.value = data.role

        // Simpan ke localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('account_payout', JSON.stringify(data.account_payout))
        localStorage.setItem('role', JSON.stringify(data.role))
    }

    function updateUserData(payload) {
        // Update State
        user.value = {
            ...user.value,
            ...payload.data
        }

        // Update localStorage
        localStorage.setItem('user', JSON.stringify(user.value))
    }

    function updateAccountPayoutData(payload) {
        // Update State
        accountPayout.value = {
            ...accountPayout.value,
            ...payload.account_payout
        }

        // Update localStorage
        localStorage.setItem('account_payout', JSON.stringify(accountPayout.value))
    }
    // Fungsi untuk menghapus semua data saat Logout
    function clearAuth() {
        token.value = null
        user.value = null
        accountPayout.value = null
        role.value = null

        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('account_payout')
        localStorage.removeItem('role')
    }

    // Fungsi untuk update data user saja (misal: edit profil)
    function setUser(userData) {
        user.value = userData
        localStorage.setItem('user', JSON.stringify(userData))
    }

    return { 
        token, user, accountPayout, role, 
        setAuthData, clearAuth, updateUserData, updateAccountPayoutData
    }
})