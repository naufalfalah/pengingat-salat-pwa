<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  nextPrayerName: { type: String, default: null },
  nextPrayerTime: { type: Date,   default: null },
})

const PRAYER_LABELS = {
  fajr:    'Subuh',
  dhuhr:   'Dzuhur',
  asr:     'Asar',
  maghrib: 'Maghrib',
  isha:    'Isya',
}

const now = ref(new Date())
let timer

onMounted(()  => { timer = setInterval(() => { now.value = new Date() }, 1_000) })
onUnmounted(() => clearInterval(timer))

const remaining = computed(() => {
  if (!props.nextPrayerTime) return null
  const diff = props.nextPrayerTime - now.value
  if (diff <= 0) return { h: 0, m: 0, s: 0 }
  return {
    h: Math.floor(diff / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1_000),
  }
})

function pad(n) { return String(n).padStart(2, '0') }
</script>

<template>
  <div v-if="remaining" class="text-center">
    <p class="text-emerald-200 text-xs uppercase tracking-wider font-medium">
      {{ nextPrayerName ? PRAYER_LABELS[nextPrayerName] ?? nextPrayerName : '—' }} dalam
    </p>
    <p class="text-white text-4xl font-bold tracking-tight tabular-nums mt-1">
      {{ pad(remaining.h) }}<span class="text-emerald-300 text-2xl">:</span>{{ pad(remaining.m) }}<span class="text-emerald-300 text-2xl">:</span>{{ pad(remaining.s) }}
    </p>
  </div>
  <div v-else class="text-center">
    <p class="text-emerald-200 text-xs uppercase tracking-wider">Waktu sholat berikutnya</p>
    <p class="text-white text-2xl font-bold mt-1">—</p>
  </div>
</template>
