import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    // ============================
    // 1. STATE (Data Entitas)
    // ============================
    const token = ref(localStorage.getItem('token') || null)

    // Helper untuk mencegah error "undefined is not valid JSON"
    const safeJSONParse = (key) => {
        try {
            const val = localStorage.getItem(key)
            return val && val !== 'undefined' ? JSON.parse(val) : null
        } catch (e) {
            return null
        }
    }

    // Parse JSON dari localStorage agar data bertahan saat refresh
    const user = ref(safeJSONParse('user'))
    const accountPayout = ref(safeJSONParse('account_payout'))
    const role = ref(safeJSONParse('role'))

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

        // Simpan ke localStorage (cek undefined/null sebelum stringify)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', data.user ? JSON.stringify(data.user) : null)
        localStorage.setItem('account_payout', data.account_payout ? JSON.stringify(data.account_payout) : null)
        localStorage.setItem('role', data.role ? JSON.stringify(data.role) : null)
    }

    function updateUserData(userData) {
        // Update State
        user.value = {
            ...user.value,
            ...userData
        }

        // Update localStorage
        localStorage.setItem('user', JSON.stringify(user.value))
    }

    function updateAccountPayoutData(payoutData) {
        // Update State
        accountPayout.value = {
            ...accountPayout.value,
            ...payoutData
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