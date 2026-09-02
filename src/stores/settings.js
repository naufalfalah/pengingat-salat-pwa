import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSetting, setSetting } from '../db/index.js'

export const useSettingsStore = defineStore('settings', () => {
  const location = ref(null) // { lat, lng, cityName }
  const calculationMethod = ref('MoonsightingCommittee')
  const madhab = ref('Shafi')
  const notificationsEnabled = ref(false)

  async function loadFromDB() {
    location.value = await getSetting('location')
    const prefs = await getSetting('preferences')
    if (prefs) {
      calculationMethod.value = prefs.calculationMethod ?? 'MoonsightingCommittee'
      madhab.value = prefs.madhab ?? 'Shafi'
      notificationsEnabled.value = prefs.notificationsEnabled ?? false
    }
  }

  async function saveLocation(lat, lng, cityName) {
    const value = { lat, lng, cityName, savedAt: Date.now() }
    await setSetting('location', value)
    location.value = value
  }

  async function savePreferences() {
    await setSetting('preferences', {
      calculationMethod: calculationMethod.value,
      madhab: madhab.value,
      notificationsEnabled: notificationsEnabled.value,
    })
  }

  return {
    location,
    calculationMethod,
    madhab,
    notificationsEnabled,
    loadFromDB,
    saveLocation,
    savePreferences,
  }
})
