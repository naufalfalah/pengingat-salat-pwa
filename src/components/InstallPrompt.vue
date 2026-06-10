<script setup>
import { ref, onMounted } from 'vue'

const show = ref(false)
const isIOS = ref(false)
const deferredEvt = ref(null)

onMounted(() => {
  // Hitung kunjungan — tampilkan setelah kunjungan kedua
  const visits = parseInt(localStorage.getItem('visit_count') ?? '0') + 1
  localStorage.setItem('visit_count', visits)

  isIOS.value = /iphone|ipad|ipod/i.test(navigator.userAgent) && !('MSStream' in window)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches

  if (isStandalone || visits < 2) return

  if (isIOS.value) {
    // iOS: tidak ada beforeinstallprompt — tampilkan instruksi manual
    show.value = true
  } else {
    // Android/Desktop: tunggu event beforeinstallprompt
    window.addEventListener(
      'beforeinstallprompt',
      (e) => {
        e.preventDefault()
        deferredEvt.value = e
        show.value = true
      },
      { once: true }
    )
  }
})

async function install() {
  if (!deferredEvt.value) return
  deferredEvt.value.prompt()
  const { outcome } = await deferredEvt.value.userChoice
  if (outcome === 'accepted') dismiss()
}

function dismiss() {
  show.value = false
  localStorage.setItem('install_dismissed', '1')
}
</script>

<template>
  <Transition
    enter-from-class="translate-y-full opacity-0"
    enter-active-class="transition-all duration-300"
    leave-to-class="translate-y-full opacity-0"
    leave-active-class="transition-all duration-200"
  >
    <div v-if="show" class="bg-white border border-slate-200 rounded-2xl shadow-xl mx-4 mt-4 p-4">
      <!-- iOS: instruksi manual -->
      <template v-if="isIOS">
        <div class="flex items-start gap-3">
          <div class="bg-emerald-100 rounded-xl p-2 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 text-emerald-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-slate-800">Tambahkan ke Home Screen</p>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              Tap <strong>Share</strong> (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="inline w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              ) di Safari, lalu pilih <strong>"Add to Home Screen"</strong>
            </p>
          </div>
          <button class="text-slate-400 hover:text-slate-600 p-1 shrink-0" @click="dismiss">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </template>

      <!-- Android: install prompt -->
      <template v-else>
        <div class="flex items-start gap-3">
          <div class="bg-emerald-100 rounded-xl p-2 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 text-emerald-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-slate-800">Pasang di perangkat</p>
            <p class="text-xs text-slate-500 mt-0.5">
              Akses jadwal sholat lebih cepat tanpa buka browser
            </p>
          </div>
          <button class="text-slate-400 hover:text-slate-600 p-1 shrink-0" @click="dismiss">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          class="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          @click="install"
        >
          Pasang Sekarang
        </button>
      </template>
    </div>
  </Transition>
</template>
