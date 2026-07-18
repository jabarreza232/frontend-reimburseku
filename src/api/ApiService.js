import apiClient from './apiClient'

export default {
    login(credentials) {
        return apiClient.post('/login', credentials)
    },
    register(data) {
        return apiClient.post('/register', data)
    },
  
    getProfile() {
        return apiClient.get('/user')
    },
    getMyReimbursementsMessages(page = 1) {
        // Meneruskan parameter page ke backend
        return apiClient.get(`/reimbursement-message/my-messages?page=${page}`)
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
    getSourceFunding(page = 1) {
        return apiClient.get(`/source-funding?page=${page}`)
    },

    getBalanceStats() {
        return apiClient.get('/deposit/get/balance-stats')
    },
    getReimbursements(page = 1) {
        return apiClient.get(`/reimburse?page=${page}`)
    },
    getChartWeekly(startDate, endDate) {
        return apiClient.get(`/reimburse/weekly?start_date=${startDate}&end_date=${endDate}`)
    },
    getChartMonthly(month, year) {
        return apiClient.get(`/reimburse/monthly?month=${month}&year=${year}`)
    },
    getReimbursementsByMonth(page = 1, period) {
        return apiClient.get(`/reimburse/filter/month`, {
            params: { page: page, period: period }
        })
    },

    // Untuk memanggil data filter rentang tanggal
    getReimbursementsByDateRange(page = 1, startDate, endDate) {
        return apiClient.get(`/reimburse/filter/range`, {
            params: {
                page: page,
                start_date: startDate,
                end_date: endDate
            }
        })
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
    saveProvider(data) {
        return axios.post('/api/provider/save', data)
    },
    // Pastikan ada method update jika diperlukan saat isEdit = true
    updateProviderDetail(id, data) {
        return axios.put(`/api/provider/${id}`, data)
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
    },
    getDepositDetail(id) {
        return apiClient.get(`/deposit/${id}`)
    },
    getLogCompanyDeposit(id) {
        return apiClient.get(`/deposit/log/${id}`)
    },

    // ENDPOINT TAMBAHAN UNTUK SINKRONISASI
    // Pesan Reimbursement
    getReimbursementMessageDetail(id) {
        return apiClient.get(`/reimbursement-message/${id}`)
    },
    updateReimbursementMessage(id, data) {
        return apiClient.post(`/reimbursement-message/${id}`, data)
    },
    deleteReimbursementMessage(id) {
        return apiClient.delete(`/reimbursement-message/delete/${id}`)
    },

    // Persetujuan Reimbursement
    getApprovalReimbursementDetail(id) {
        return apiClient.get(`/approval-reimbursement/${id}`)
    },
    deleteApprovalReimbursement(id) {
        return apiClient.delete(`/approval-reimbursement/delete/${id}`)
    },

    // Reimburse
    deleteReimbursement(id) {
        return apiClient.delete(`/reimburse/delete/${id}`)
    },

    // Detail Data Master
    getCategoryDetail(id) {
        return apiClient.get(`/category/${id}`)
    },
    getProviderDetail(id) {
        return apiClient.get(`/provider/${id}`)
    },
    getRoleDetail(id) {
        return apiClient.get(`/role/${id}`)
    },
    getEmployeeDetail(id) {
        return apiClient.get(`/employee/${id}`)
    }
}