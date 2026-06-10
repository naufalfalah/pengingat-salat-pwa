<script setup>
import { ref } from 'vue'
import { useSettingsStore }              from '../stores/settings.js'
import { requestNotificationPermission } from '../composables/useNotification.js'

const settings = useSettingsStore()

const selectedMethod = ref(settings.calculationMethod)
const selectedMadhab = ref(settings.madhab)
const notifEnabled   = ref(settings.notificationsEnabled)

const saved       = ref(false)
const notifDenied = ref(false)

const METHODS = [
  { value: 'MoonsightingCommittee', label: 'Kemenag RI / Rukyat',    desc: 'Metode default Indonesia' },
  { value: 'MuslimWorldLeague',     label: 'Muslim World League',     desc: 'Digunakan di banyak negara' },
  { value: 'Egyptian',              label: 'Egyptian General Authority', desc: 'Populer di Timur Tengah' },
  { value: 'NorthAmerica',          label: 'ISNA (Amerika Utara)',    desc: 'Islamic Society of North America' },
  { value: 'Karachi',               label: 'University of Karachi',   desc: 'Digunakan di Asia Selatan' },
]

async function saveSettings() {
  settings.calculationMethod = selectedMethod.value
  settings.madhab            = selectedMadhab.value

  if (notifEnabled.value) {
    const granted = await requestNotificationPermission()
    if (!granted) {
      notifEnabled.value = false
      notifDenied.value  = true
    }
  }
  settings.notificationsEnabled = notifEnabled.value

  await settings.savePreferences()
  saved.value = true
  setTimeout(() => { saved.value = false }, 2_000)
}
</script>

<template>
  <div class="flex flex-col min-h-full bg-slate-50">
    <!-- Header -->
    <div class="bg-emerald-700 text-white px-5 pt-12 pb-6">
      <h1 class="text-lg font-bold">Pengaturan</h1>
      <p class="text-emerald-200 text-sm mt-0.5">Sesuaikan metode kalkulasi dan preferensi</p>
    </div>

    <div class="flex-1 overflow-y-auto px-5 py-6 space-y-7">

      <!-- Metode kalkulasi -->
      <section>
        <h2 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Metode Kalkulasi</h2>
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
          <label
            v-for="m in METHODS"
            :key="m.value"
            class="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <input
              type="radio"
              :value="m.value"
              v-model="selectedMethod"
              class="accent-emerald-600 w-4 h-4 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-800">{{ m.label }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ m.desc }}</p>
            </div>
          </label>
        </div>
      </section>

      <!-- Madhab -->
      <section>
        <h2 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Madhab (Waktu Asar)</h2>
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
          <label class="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors">
            <input type="radio" value="Shafi" v-model="selectedMadhab" class="accent-emerald-600 w-4 h-4 shrink-0" />
            <div>
              <p class="text-sm font-medium text-slate-800">Syafi'i / Maliki / Hambali</p>
              <p class="text-xs text-slate-400 mt-0.5">Mayoritas Indonesia — panjang bayangan = 1× tinggi benda</p>
            </div>
          </label>
          <label class="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors">
            <input type="radio" value="Hanafi" v-model="selectedMadhab" class="accent-emerald-600 w-4 h-4 shrink-0" />
            <div>
              <p class="text-sm font-medium text-slate-800">Hanafi</p>
              <p class="text-xs text-slate-400 mt-0.5">Panjang bayangan = 2× tinggi benda (Asar lebih akhir)</p>
            </div>
          </label>
        </div>
      </section>

      <!-- Notifikasi -->
      <section>
        <h2 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Notifikasi</h2>
        <div class="bg-white rounded-2xl shadow-sm px-4 py-3.5 flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-medium text-slate-800">Pengingat Waktu Sholat</p>
            <p class="text-xs text-slate-400 mt-0.5">Notifikasi otomatis saat masuk waktu sholat</p>
          </div>
          <button
            @click="notifEnabled = !notifEnabled"
            class="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none"
            :class="notifEnabled ? 'bg-emerald-600' : 'bg-slate-300'"
          >
            <span
              class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5"
              :class="notifEnabled ? 'translate-x-5' : 'translate-x-0.5'"
            />
          </button>
        </div>
        <p v-if="notifEnabled && !notifDenied" class="text-xs text-slate-400 mt-2 px-1">
          Izin notifikasi akan diminta saat menyimpan pengaturan.
        </p>
        <p v-if="notifDenied" class="text-xs text-red-500 mt-2 px-1">
          Izin notifikasi ditolak. Aktifkan melalui pengaturan browser / perangkat.
        </p>
      </section>
    </div>

    <!-- Tombol simpan -->
    <div class="px-5 pb-8 pt-4 bg-slate-50 border-t border-slate-200">
      <button
        @click="saveSettings"
        class="w-full py-3.5 rounded-xl font-semibold text-sm transition-colors"
        :class="saved ? 'bg-slate-200 text-slate-500' : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'"
      >
        {{ saved ? 'Tersimpan!' : 'Simpan Pengaturan' }}
      </button>
    </div>
  </div>
</template>
