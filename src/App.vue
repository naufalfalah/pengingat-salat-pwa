<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from './stores/settings.js'
import { usePrayerTimes } from './composables/usePrayerTimes.js'
import { useQibla } from './composables/useQibla.js'
import { useNotification } from './composables/useNotification.js'

import LocationDisplay from './components/LocationDisplay.vue'
import CountdownTimer from './components/CountdownTimer.vue'
import PrayerTimes from './components/PrayerTimes.vue'
import QiblaCompass from './components/QiblaCompass.vue'
import SettingsSheet from './components/SettingsSheet.vue'
import InstallPrompt from './components/InstallPrompt.vue'
import PrayerAlert from './components/PrayerAlert.vue'

const settings = useSettingsStore()
const activeTab = ref('jadwal')

// Fallback ke Jakarta jika lokasi belum dideteksi
const lat = computed(() => settings.location?.lat ?? -6.2088)
const lng = computed(() => settings.location?.lng ?? 106.8456)

const { prayers, nextPrayer, nextPrayerTime, currentPrayer } = usePrayerTimes(
  lat,
  lng,
  computed(() => settings.calculationMethod),
  computed(() => settings.madhab)
)

const { qiblaAngle, needleRotation, compassGranted, requestCompass, stopListening } = useQibla(
  lat,
  lng
)

const { activePrayerAlert, dismissAlert } = useNotification(
  prayers,
  computed(() => settings.notificationsEnabled)
)

onMounted(() => settings.loadFromDB())
onUnmounted(() => stopListening())

// Format tanggal header
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
const today = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: tz,
}).format(new Date())

const TABS = [
  { id: 'jadwal', label: 'Jadwal' },
  { id: 'kiblat', label: 'Kiblat' },
  { id: 'pengaturan', label: 'Pengaturan' },
]
</script>

<template>
  <div class="flex flex-col min-h-dvh bg-slate-50 max-w-md mx-auto">
    <!-- In-app alert saat masuk waktu sholat (muncul di semua tab) -->
    <PrayerAlert :prayer="activePrayerAlert" @dismiss="dismissAlert" />

    <!-- ======= JADWAL TAB ======= -->
    <div v-show="activeTab === 'jadwal'" class="flex flex-col flex-1">
      <header class="bg-emerald-700 text-white px-5 pt-12 pb-10">
        <p class="text-emerald-200 text-xs capitalize mb-4">{{ today }}</p>
        <LocationDisplay />
        <div class="mt-7 bg-emerald-600/50 rounded-2xl px-4 py-5">
          <CountdownTimer :next-prayer-name="nextPrayer" :next-prayer-time="nextPrayerTime" />
        </div>
      </header>
      <PrayerTimes :prayers="prayers" :current-prayer="currentPrayer" />
    </div>

    <!-- ======= KIBLAT TAB ======= -->
    <div v-show="activeTab === 'kiblat'" class="flex flex-col flex-1">
      <QiblaCompass
        :qibla-angle="qiblaAngle"
        :needle-rotation="needleRotation"
        :compass-granted="compassGranted"
        @request-compass="requestCompass"
      />
    </div>

    <!-- ======= PENGATURAN TAB ======= -->
    <div v-show="activeTab === 'pengaturan'" class="flex flex-col flex-1">
      <SettingsSheet />
    </div>

    <!-- Install prompt -->
    <InstallPrompt class="fixed top-2 inset-x-0 z-20 max-w-md mx-auto" />

    <!-- ======= BOTTOM TAB BAR ======= -->
    <nav class="shrink-0 bg-white border-t border-slate-200">
      <div class="flex">
        <button
          v-for="tab in TABS"
          :key="tab.id"
          class="flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors"
          :class="activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'"
          @click="activeTab = tab.id"
        >
          <!-- Jadwal icon -->
          <svg
            v-if="tab.id === 'jadwal'"
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <!-- Kiblat icon -->
          <svg
            v-if="tab.id === 'kiblat'"
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z"
            />
          </svg>
          <!-- Pengaturan icon -->
          <svg
            v-if="tab.id === 'pengaturan'"
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {{ tab.label }}
        </button>
      </div>
    </nav>
  </div>
</template>
