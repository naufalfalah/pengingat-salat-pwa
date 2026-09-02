<script setup>
const props = defineProps({
  prayers: { type: Array, default: () => [] },
  currentPrayer: { type: String, default: null },
})

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

function formatTime(date) {
  if (!date) return '--:--'
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: tz,
  }).format(date)
}

// Ikon sederhana untuk setiap waktu sholat
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
        class="flex items-center px-5 py-4 border-b border-slate-50 last:border-0 transition-colors md:flex-col md:items-center md:text-center md:gap-1.5 md:border md:border-slate-100 md:rounded-2xl md:px-4 md:py-5 md:last:border"
        :class="prayer.key === currentPrayer ? 'bg-emerald-50 md:border-emerald-200' : ''"
      >
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
      </li>
    </ul>

    <p v-if="!prayers.length" class="text-center text-slate-400 text-sm py-10">
      Deteksi lokasi untuk melihat jadwal sholat
    </p>
  </div>
</template>
