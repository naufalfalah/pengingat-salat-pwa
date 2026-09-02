<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '../stores/settings.js'
import { requestNotificationPermission } from '../composables/useNotification.js'

defineProps({
  prayers: { type: Array, default: () => [] },
  currentPrayer: { type: String, default: null },
})

const settings = useSettingsStore()
const isNotificationSupported = 'Notification' in window
const deniedKey = ref(null)

function isNotifEnabled(key) {
  return !!settings.notificationsEnabled[key]
}

async function toggleNotif(key) {
  const next = !isNotifEnabled(key)
  deniedKey.value = null

  if (next) {
    const granted = await requestNotificationPermission()
    if (!granted) {
      deniedKey.value = key
      return
    }
  }

  await settings.setNotificationEnabled(key, next)
}

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

function formatTime(date) {
  if (!date) return '--:--'
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: tz,
  }).format(date)
}

const ICONS = {
  fajr: '🌙',
  dhuhr: '☀️',
  asr: '🌤',
  maghrib: '🌅',
  isha: '🌃',
}
</script>

<template>
  <div class="bg-white rounded-t-3xl -mt-4 pt-2 pb-4 shadow-sm md:rounded-3xl md:mt-6">
    <div class="px-5 py-3 border-b border-slate-100 md:border-0 md:px-6 md:pt-5 md:pb-1">
      <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">Jadwal Hari Ini</h2>
    </div>

    <ul class="md:grid md:grid-cols-3 md:gap-3 md:px-6 md:pb-2 lg:grid-cols-5">
      <li
        v-for="prayer in prayers"
        :key="prayer.key"
        class="flex flex-col px-5 py-4 border-b border-slate-50 last:border-0 transition-colors md:border md:border-slate-100 md:rounded-2xl md:px-4 md:py-5 md:last:border"
        :class="prayer.key === currentPrayer ? 'bg-emerald-50 md:border-emerald-200' : ''"
      >
        <div class="flex items-center md:flex-col md:items-center md:text-center md:gap-1.5">
          <span class="text-2xl w-9 shrink-0 md:w-auto">{{ ICONS[prayer.key] }}</span>

          <div class="flex-1 ml-3 md:flex-none md:ml-0">
            <p
              class="font-semibold text-base md:text-sm"
              :class="prayer.key === currentPrayer ? 'text-emerald-700' : 'text-slate-800'"
            >
              {{ prayer.name }}
            </p>
            <p
              v-if="prayer.key === currentPrayer"
              class="text-xs text-emerald-500 font-medium mt-0.5"
            >
              Sedang berlangsung
            </p>
          </div>

          <div class="flex items-center gap-2 md:mt-1">
            <span
              class="text-lg font-bold tabular-nums md:text-base"
              :class="prayer.key === currentPrayer ? 'text-emerald-600' : 'text-slate-700'"
            >
              {{ formatTime(prayer.time) }}
            </span>
            <span
              v-if="prayer.key === currentPrayer"
              class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
            ></span>
          </div>
        </div>

        <!-- Toggle notifikasi per waktu sholat -->
        <button
          :disabled="!isNotificationSupported"
          class="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :class="
            isNotifEnabled(prayer.key)
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          "
          @click="toggleNotif(prayer.key)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-3.5 h-3.5"
            :fill="isNotifEnabled(prayer.key) ? 'currentColor' : 'none'"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
          {{
            !isNotificationSupported
              ? 'Tidak didukung'
              : isNotifEnabled(prayer.key)
                ? 'Notifikasi aktif'
                : 'Aktifkan notifikasi'
          }}
        </button>
        <p v-if="deniedKey === prayer.key" class="text-red-500 text-[11px] text-center mt-1.5">
          Izin notifikasi ditolak browser
        </p>
      </li>
    </ul>

    <p v-if="!prayers.length" class="text-center text-slate-400 text-sm py-10">
      Deteksi lokasi untuk melihat jadwal sholat
    </p>
  </div>
</template>
