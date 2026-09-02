import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSetting, setSetting } from '../db/index.js'

// Notifikasi diatur per waktu sholat, bukan satu toggle global
const DEFAULT_NOTIFICATIONS = { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }

function normalizeNotifications(value) {
  if (typeof value === 'boolean') {
    // Migrasi dari versi lama yang cuma punya satu toggle untuk semua waktu sholat
    return Object.fromEntries(Object.keys(DEFAULT_NOTIFICATIONS).map((k) => [k, value]))
  }
  return { ...DEFAULT_NOTIFICATIONS, ...(value ?? {}) }
}

export const useSettingsStore = defineStore('settings', () => {
  const location = ref(null) // { lat, lng, cityName }
  const calculationMethod = ref('MoonsightingCommittee')
  const madhab = ref('Shafi')
  const notificationsEnabled = ref({ ...DEFAULT_NOTIFICATIONS }) // { fajr, dhuhr, asr, maghrib, isha }

  async function loadFromDB() {
    location.value = await getSetting('location')
    const prefs = await getSetting('preferences')
    if (prefs) {
      calculationMethod.value = prefs.calculationMethod ?? 'MoonsightingCommittee'
      madhab.value = prefs.madhab ?? 'Shafi'
      notificationsEnabled.value = normalizeNotifications(prefs.notificationsEnabled)
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
      // Salin ke objek biasa — notificationsEnabled.value adalah reactive proxy
      // Vue dan tidak bisa di-structured-clone oleh IndexedDB (DataCloneError)
      notificationsEnabled: { ...notificationsEnabled.value },
    })
  }

  async function setNotificationEnabled(key, isEnabled) {
    notificationsEnabled.value = { ...notificationsEnabled.value, [key]: isEnabled }
    await savePreferences()
  }

  return {
    location,
    calculationMethod,
    madhab,
    notificationsEnabled,
    loadFromDB,
    saveLocation,
    savePreferences,
    setNotificationEnabled,
  }
})
