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

function switchTab(id) {
  activeTab.value = id
  // Panggil requestCompass dari tab click (= user gesture) agar iOS tidak minta manual tiap buka
  if (id === 'kiblat') requestCompass()
}

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

// Path SVG tiap ikon tab — dipakai bersama oleh sidebar desktop & bottom nav mobile/tablet
const TAB_ICON_PATHS = {
  jadwal: ['M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'],
  kiblat: [
    'M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z',
  ],
  pengaturan: [
    'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  ],
}
</script>

<template>
  <div class="flex flex-col lg:flex-row min-h-dvh w-full bg-slate-50">
    <!-- ======= SIDEBAR (Desktop, lg+) ======= -->
    <aside class="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-emerald-800 text-white">
      <div class="px-6 pt-8 pb-6">
        <p class="text-3xl leading-none">🕌</p>
        <h1 class="text-base font-bold mt-3 leading-snug">Jadwal Salat &amp; Kiblat</h1>
        <p class="text-emerald-300 text-xs mt-1.5 capitalize">{{ today }}</p>
      </div>

      <nav class="flex-1 px-3 space-y-1">
        <button
          v-for="tab in TABS"
          :key="tab.id"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          :class="
            activeTab === tab.id
              ? 'bg-white text-emerald-700'
              : 'text-emerald-100 hover:bg-emerald-700/60'
          "
          @click="switchTab(tab.id)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              v-for="(d, i) in TAB_ICON_PATHS[tab.id]"
              :key="i"
              stroke-linecap="round"
              stroke-linejoin="round"
              :d="d"
            />
          </svg>
          {{ tab.label }}
        </button>
      </nav>

      <div class="px-6 py-6 border-t border-emerald-700/60">
        <LocationDisplay />
      </div>
    </aside>

    <!-- ======= MAIN ======= -->
    <div
      class="relative flex flex-col flex-1 min-w-0 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0"
    >
      <!-- Alert masuk waktu sholat — muncul di atas semua tab -->
      <PrayerAlert
        :prayer="activePrayerAlert"
        class="md:max-w-3xl md:w-full md:mx-auto lg:max-w-5xl"
        @dismiss="dismissAlert"
      />

      <!-- ======= KONTEN TAB (dengan animasi transisi) ======= -->
      <Transition name="tab" mode="out-in">
        <!-- JADWAL -->
        <div
          v-if="activeTab === 'jadwal'"
          key="jadwal"
          class="flex flex-col flex-1 md:max-w-3xl md:w-full md:mx-auto md:py-6 lg:max-w-5xl lg:py-8 lg:px-4"
        >
          <header
            class="bg-emerald-700 text-white px-5 pt-12 pb-10 md:rounded-3xl md:pt-8 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-10 lg:py-10"
          >
            <div class="lg:flex-1 lg:min-w-0">
              <p class="text-emerald-200 text-xs capitalize mb-4 lg:hidden">{{ today }}</p>
              <LocationDisplay />
            </div>
            <div class="mt-6 bg-emerald-600/50 rounded-2xl px-4 py-5 lg:mt-0 lg:w-72 lg:shrink-0">
              <CountdownTimer :next-prayer-name="nextPrayer" :next-prayer-time="nextPrayerTime" />
            </div>
          </header>
          <PrayerTimes :prayers="prayers" :current-prayer="currentPrayer" />
        </div>

        <!-- KIBLAT -->
        <div
          v-else-if="activeTab === 'kiblat'"
          key="kiblat"
          class="flex flex-col flex-1 md:max-w-3xl md:w-full md:mx-auto md:py-6 lg:max-w-5xl lg:py-8 lg:px-4"
        >
          <QiblaCompass
            :qibla-angle="qiblaAngle"
            :needle-rotation="needleRotation"
            :compass-granted="compassGranted"
            @request-compass="requestCompass"
          />
        </div>

        <!-- PENGATURAN -->
        <div
          v-else
          key="pengaturan"
          class="flex flex-col flex-1 md:max-w-3xl md:w-full md:mx-auto md:py-6 lg:max-w-5xl lg:py-8 lg:px-4"
        >
          <SettingsSheet />
        </div>
      </Transition>

      <!-- Install prompt -->
      <InstallPrompt class="absolute top-2 inset-x-0 z-20 md:max-w-sm md:mx-auto" />

      <!-- ======= BOTTOM TAB BAR (Mobile & Tablet) — fixed menempel di bawah layar ======= -->
      <nav
        class="lg:hidden fixed inset-x-0 bottom-0 z-30 bg-white border-t border-slate-200 pb-safe"
      >
        <div class="flex md:max-w-3xl md:mx-auto">
          <button
            v-for="tab in TABS"
            :key="tab.id"
            class="flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors"
            :class="activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'"
            @click="switchTab(tab.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                v-for="(d, i) in TAB_ICON_PATHS[tab.id]"
                :key="i"
                stroke-linecap="round"
                stroke-linejoin="round"
                :d="d"
              />
            </svg>
            {{ tab.label }}
          </button>
        </div>
      </nav>
    </div>
  </div>
</template>
