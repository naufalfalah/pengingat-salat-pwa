<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '../stores/settings.js'

const settings = useSettingsStore()
const detecting = ref(false)
const error     = ref('')

async function detectLocation() {
  if (!navigator.geolocation) {
    error.value = 'Browser tidak mendukung geolocation'
    return
  }
  detecting.value = true
  error.value     = ''
  try {
    const pos = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10_000, maximumAge: 0 }),
    )
    const { latitude: lat, longitude: lng } = pos.coords
    // Nama kota diisi koordinat sementara; Phase 3 akan tambahkan reverse geocoding
    await settings.saveLocation(lat, lng, `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`)
  } catch (e) {
    error.value = e.code === 1 ? 'Izin lokasi ditolak' : 'Gagal mendeteksi lokasi'
  } finally {
    detecting.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-between gap-3">
    <div class="flex-1 min-w-0">
      <p class="text-xs text-emerald-200 uppercase tracking-wider font-medium">Lokasi</p>
      <p class="text-white font-semibold text-base truncate mt-0.5">
        {{ settings.location?.cityName ?? 'Belum dideteksi' }}
      </p>
      <p v-if="error" class="text-red-300 text-xs mt-0.5">{{ error }}</p>
    </div>

    <button
      @click="detectLocation"
      :disabled="detecting"
      class="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors disabled:opacity-60 shrink-0"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-3.5 h-3.5"
        :class="detecting ? 'animate-spin' : ''"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2.5"
      >
        <path v-if="!detecting" stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path v-if="!detecting" stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        <path v-if="detecting" stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      {{ detecting ? 'Mendeteksi…' : 'Perbarui' }}
    </button>
  </div>
</template>
