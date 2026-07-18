import { defineStore } from 'pinia'
import ApiService from '@/api/ApiService'

export const useMasterDataStore = defineStore('masterData', {
  state: () => ({
    providers: [],
    categories: [],
    sourceFundings: [],
    isProvidersLoaded: false,
    isCategoriesLoaded: false,
    isSourceFundingsLoaded: false,
    isLoadingProviders: false,
    isLoadingCategories: false,
    isLoadingSourceFundings: false,
  }),
  actions: {
    async fetchProviders(force = false) {
      if (this.isProvidersLoaded && !force) return this.providers
      
      this.isLoadingProviders = true
      try {
        const res = await ApiService.getProviders()
        this.providers = res.data?.data || res.data || []
        this.isProvidersLoaded = true
        return this.providers
      } catch (error) {
        console.error('Failed to fetch providers', error)
        return []
      } finally {
        this.isLoadingProviders = false
      }
    },
    
    async fetchCategories(force = false) {
      if (this.isCategoriesLoaded && !force) return this.categories
      
      this.isLoadingCategories = true
      try {
        const res = await ApiService.getCategories()
        let apiData = res.data?.data || res.data
        if (apiData && typeof apiData === 'object' && !Array.isArray(apiData) && Array.isArray(apiData.data)) {
          apiData = apiData.data
        }
        if (!Array.isArray(apiData)) apiData = []
        
        this.categories = apiData
        this.isCategoriesLoaded = true
        return this.categories
      } catch (error) {
        console.error('Failed to fetch categories', error)
        return []
      } finally {
        this.isLoadingCategories = false
      }
    },

    async fetchSourceFundings(force = false) {
      if (this.isSourceFundingsLoaded && !force) return this.sourceFundings
      
      this.isLoadingSourceFundings = true
      try {
        const res = await ApiService.getSourceFunding()
        this.sourceFundings = res.data?.data || res.data || []
        this.isSourceFundingsLoaded = true
        return this.sourceFundings
      } catch (error) {
        console.error('Failed to fetch source fundings', error)
        return []
      } finally {
        this.isLoadingSourceFundings = false
      }
    }
  }
})
