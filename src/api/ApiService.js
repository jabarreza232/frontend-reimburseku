import apiClient from './apiClient'

export default {
    login(credentials) {
        return apiClient.post('/login', credentials)
    },
    getProfile() {
        return apiClient.get('/user')
    },

    // STAFF
    updateProfile(data) {
        return apiClient.post('/update-profile', data)
    },
    getMyReimbursements(page = 1) {
        // Meneruskan parameter page ke backend
        return apiClient.get(`/reimburse/my-reimbursements?page=${page}`)
    },
    getMyReimbursementsByMonth(page = 1, month) {
        // month formatnya harus 'YYYY-MM' (contoh: '2025-09')
        return apiClient.get(`/reimburse/my-reimbursements/month?page=${page}&month=${month}`)
    },

    getReimbursementDetail(id) {
        return apiClient.get(`/reimburse/detail/${id}`)
    },
    saveReimbursement(data) {
        return apiClient.post('/reimburse/save', data, {
            headers: {
                // Trik ampuh: Atur ke multipart/form-data
                'Content-Type': 'multipart/form-data',
                // ATAU jika masih error, gunakan ini untuk memaksa browser membuat boundary otomatis:
                // 'Content-Type': undefined 
            }
        })
    },

    getLogApprovalReimbursement(id) {
        return apiClient.get(`/approval-reimbursement/log/${id}`)
    },

    // FINANCE
    getBalanceStats() {
        return apiClient.get('/deposit/get/balance-stats')
    },
    getReimbursements() {
        return apiClient.get('/reimburse')
    },
    // FINANCE / ADMIN
    getApprovalReimbursements() {
        return apiClient.get('/approval-reimbursement')
    },
    actionApproveOrReject(id, data) {
        return apiClient.post(`/approval-reimbursement/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },
    updateReimbursementPayment(id, data) {
        return apiClient.post(`/reimburse/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },
    getDeposits() {
        return apiClient.get('/deposit')
    },
    saveDeposit(data) {
        return apiClient.post('/deposit/save', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },
    getEmployees() {
        return apiClient.get('/employee')
    },

    // ADMIN - Notifications / Messages
    getReimbursementMessages() {
        return apiClient.get('/reimbursement-message')
    },
    saveReimbursementMessage(data) {
        return apiClient.post('/reimbursement-message/save', data)
    },

    // ADMIN - Employee
    saveEmployee(data) {
        return apiClient.post('/employee/save', data)
    },
    updateEmployee(id, data) {
        return apiClient.post(`/employee/${id}`, data)
    },
    deleteEmployee(id) {
        return apiClient.delete(`/employee/delete/${id}`)
    },

    // ADMIN - Category
    getCategories() {
        return apiClient.get('/category')
    },
    saveCategory(data) {
        return apiClient.post('/category/save', data)
    },
    updateCategory(id, data) {
        return apiClient.post(`/category/${id}`, data)
    },
    deleteCategory(id) {
        return apiClient.delete(`/category/delete/${id}`)
    },

    // ADMIN - Provider
    getProviders() {
        return apiClient.get('/provider')
    },
    saveProvider(data) {
        return apiClient.post('/provider/save', data)
    },
    updateProvider(id, data) {
        return apiClient.post(`/provider/${id}`, data)
    },
    deleteProvider(id) {
        return apiClient.delete(`/provider/delete/${id}`)
    },

    // ADMIN - Role
    getRoles() {
        return apiClient.get('/role')
    },
    saveRole(data) {
        return apiClient.post('/role/save', data)
    },
    updateRole(id, data) {
        return apiClient.post(`/role/${id}`, data)
    },
    deleteRole(id) {
        return apiClient.delete(`/role/delete/${id}`)
    },

    // ADMIN - Deposit
    updateDeposit(id, data) {
        return apiClient.post(`/deposit/${id}`, data)
    },
    deleteDeposit(id) {
        return apiClient.delete(`/deposit/delete/${id}`)
    },
    getDepositDrafts() {
        return apiClient.get('/deposit/draft/get')
    },
    recoveryDeposit(id) {
        return apiClient.post(`/deposit/recovery/${id}`)
    }
}