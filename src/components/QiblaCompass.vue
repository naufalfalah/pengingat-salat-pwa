<script setup>
import { computed } from 'vue'

const props = defineProps({
  qiblaAngle: { type: Number, default: null },
  needleRotation: { type: Number, default: 0 },
  compassGranted: { type: Boolean, default: false },
})

const emit = defineEmits(['requestCompass'])

// Titik tick marks di keliling kompas (36 titik, setiap 10°)
const ticks = Array.from({ length: 36 }, (_, i) => {
  const angle = i * 10
  const rad = (angle - 90) * (Math.PI / 180)
  const isMajor = i % 9 === 0 // setiap 90°
  const isMid = i % 3 === 0 // setiap 30°
  const outer = 108
  const inner = isMajor ? 88 : isMid ? 94 : 98
  return {
    x1: 120 + outer * Math.cos(rad),
    y1: 120 + outer * Math.sin(rad),
    x2: 120 + inner * Math.cos(rad),
    y2: 120 + inner * Math.sin(rad),
    strokeWidth: isMajor ? 2.5 : 1,
  }
})

const qiblaDisplay = computed(() =>
  props.qiblaAngle !== null ? `${Math.round(props.qiblaAngle)}°` : '—'
)
</script>

<template>
  <div class="flex flex-col min-h-full bg-slate-50">
    <!-- Header -->
    <div class="bg-emerald-700 text-white px-5 pt-12 pb-8 text-center">
      <h1 class="text-lg font-bold tracking-wide">Arah Kiblat</h1>
      <p class="text-emerald-200 text-sm mt-1">
        {{ qiblaAngle !== null ? `${qiblaDisplay} dari Utara` : 'Deteksi lokasi terlebih dahulu' }}
      </p>
    </div>

    <!-- Compass -->
    <div class="flex flex-col items-center justify-center flex-1 px-6 py-8 gap-6">
      <div
        class="bg-white rounded-full shadow-lg p-4 w-[min(72vw,272px)] aspect-square flex items-center justify-center"
      >
        <svg viewBox="0 0 240 240" class="select-none w-full h-full">
          <!-- Lingkaran luar -->
          <circle cx="120" cy="120" r="112" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5" />

          <!-- Tick marks -->
          <line
            v-for="(t, i) in ticks"
            :key="i"
            :x1="t.x1"
            :y1="t.y1"
            :x2="t.x2"
            :y2="t.y2"
            stroke="#94a3b8"
            :stroke-width="t.strokeWidth"
            stroke-linecap="round"
          />

          <!-- Label arah (U/T/S/B) -->
          <text x="120" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">
            U
          </text>
          <text
            x="218"
            y="125"
            text-anchor="middle"
            font-size="12"
            font-weight="600"
            fill="#64748b"
          >
            T
          </text>
          <text
            x="120"
            y="228"
            text-anchor="middle"
            font-size="12"
            font-weight="600"
            fill="#64748b"
          >
            S
          </text>
          <text x="22" y="125" text-anchor="middle" font-size="12" font-weight="600" fill="#64748b">
            B
          </text>

          <!-- Jarum kiblat (berputar sesuai needleRotation) -->
          <g :transform="`rotate(${needleRotation}, 120, 120)`">
            <!-- Sisi atas: menunjuk ke arah kiblat -->
            <polygon points="120,28 113,75 127,75" fill="#059669" />
            <!-- Batang atas -->
            <rect x="118" y="72" width="4" height="48" rx="2" fill="#059669" />
            <!-- Batang bawah -->
            <rect x="118" y="120" width="4" height="50" rx="2" fill="#cbd5e1" />
            <!-- Ekor -->
            <polygon points="120,212 113,165 127,165" fill="#cbd5e1" />
          </g>

          <!-- Lingkaran tengah -->
          <circle cx="120" cy="120" r="10" fill="#1e293b" />
          <circle cx="120" cy="120" r="5" fill="#f8fafc" />
        </svg>
      </div>

      <!-- Info kiblat -->
      <div class="text-center">
        <p class="text-slate-500 text-sm">Sudut kiblat dari lokasi Anda</p>
        <p class="text-3xl font-bold text-emerald-700 tabular-nums mt-1">
          {{ qiblaDisplay }}
        </p>
        <p class="text-slate-400 text-xs mt-0.5">dari arah Utara (searah jarum jam)</p>
      </div>

      <!-- Tombol aktifkan kompas -->
      <div v-if="!compassGranted" class="flex flex-col items-center gap-3 w-full max-w-xs">
        <button
          class="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          @click="$emit('requestCompass')"
        >
          Aktifkan Kompas Real-time
        </button>
        <p class="text-slate-400 text-xs text-center leading-relaxed">
          Izinkan akses sensor perangkat untuk petunjuk arah kiblat secara real-time
        </p>
      </div>

      <div v-else class="flex items-center gap-2 text-emerald-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <p class="text-sm font-medium">Kompas aktif</p>
      </div>

      <!-- Disclaimer -->
      <p class="text-slate-400 text-xs text-center leading-relaxed max-w-xs">
        Kompas magnetometer dapat tidak akurat di dekat benda logam atau perangkat elektronik.
        Gunakan sebagai panduan, bukan acuan utama.
      </p>
    </div>
  </div>
</template>
