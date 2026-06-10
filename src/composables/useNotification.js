import { ref, watch, isRef, onUnmounted } from 'vue'

export function useNotification(prayers, enabledInput) {
  const enabled = isRef(enabledInput) ? enabledInput : ref(enabledInput)

  // Ref yang bisa dibaca komponen untuk menampilkan in-app alert
  const activePrayerAlert = ref(null) // { name, key } saat masuk waktu sholat
  const alertTimer        = ref(null)

  const timers = []

  function clearAll() {
    timers.splice(0).forEach(clearTimeout)
  }

  function dismissAlert() {
    activePrayerAlert.value = null
    if (alertTimer.value) {
      clearTimeout(alertTimer.value)
      alertTimer.value = null
    }
  }

  function triggerInApp(prayer) {
    activePrayerAlert.value = { name: prayer.name, key: prayer.key }
    // Auto-dismiss setelah 5 menit
    alertTimer.value = setTimeout(dismissAlert, 5 * 60 * 1_000)
  }

  function scheduleAll(prayerList) {
    clearAll()
    if (!prayerList?.length) return

    const now = Date.now()

    for (const p of prayerList) {
      if (!p.time) continue
      const delay = p.time.getTime() - now
      if (delay < 0 || delay > 24 * 60 * 60 * 1_000) continue

      timers.push(
        setTimeout(async () => {
          if (Notification.permission === 'granted' && enabled.value) {
            const payload = {
              body:     `Sudah masuk waktu sholat ${p.name}`,
              icon:     '/icons/icon-192.png',
              badge:    '/icons/icon-192.png',
              tag:      `salat-${p.key}`,
              renotify: true,
              vibrate:  [200, 100, 200],
            }
            try {
              // Gunakan SW registration agar notifikasi muncul saat app di-background
              const reg = await navigator.serviceWorker?.ready
              if (reg) {
                await reg.showNotification(`Waktu ${p.name}`, payload)
              } else {
                new Notification(`Waktu ${p.name}`, payload)
              }
            } catch {
              // Diabaikan — ditangani lewat in-app alert
            }
          }
          // In-app alert sebagai fallback atau pelengkap
          if (enabled.value) triggerInApp(p)
        }, delay),
      )
    }
  }

  // Jadwalkan ulang setiap kali daftar sholat atau status enabled berubah
  watch(
    [prayers, enabled],
    ([list]) => {
      if (enabled.value) scheduleAll(list)
      else clearAll()
    },
    { immediate: true, deep: true },
  )

  onUnmounted(clearAll)

  return { activePrayerAlert, dismissAlert }
}

/**
 * Minta permission notifikasi browser.
 * Kembalikan true jika granted, false jika ditolak.
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}
