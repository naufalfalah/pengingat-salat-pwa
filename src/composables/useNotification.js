import { ref, watch, isRef, onUnmounted } from 'vue'

export function useNotification(prayers, enabledInput) {
  const enabled = isRef(enabledInput) ? enabledInput : ref(enabledInput)

  // Ref yang bisa dibaca komponen untuk menampilkan in-app alert
  const activePrayerAlert = ref(null) // { name, key } saat masuk waktu sholat
  const alertTimer = ref(null)

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

  async function fireNotification(p) {
    if (Notification.permission === 'granted' && enabled.value) {
      const payload = {
        body: `Sudah masuk waktu sholat ${p.name}`,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: `salat-${p.key}`,
        renotify: true,
        vibrate: [200, 100, 200],
      }
      try {
        const reg = await navigator.serviceWorker?.ready
        if (reg) {
          await reg.showNotification(`Waktu ${p.name}`, payload)
        } else {
          new Notification(`Waktu ${p.name}`, payload)
        }
      } catch {
        // Ditangani lewat in-app alert di bawah
      }
    }
    if (enabled.value) triggerInApp(p)
  }

  function scheduleAll(prayerList) {
    clearAll()
    if (!prayerList?.length) return

    const now = Date.now()

    for (const p of prayerList) {
      if (!p.time) continue
      const delay = p.time.getTime() - now
      if (delay < 0 || delay > 24 * 60 * 60 * 1_000) continue

      timers.push(setTimeout(() => fireNotification(p), delay))
    }
  }

  // Saat app kembali ke foreground (misal: dari background/lock screen),
  // cek apakah ada waktu sholat yang terlewat dalam 15 menit terakhir,
  // lalu jadwalkan ulang sisa hari ini. Ini mengatasi setTimeout yang
  // tidak berjalan saat iOS membekukan app.
  function handleVisibilityChange() {
    if (document.visibilityState !== 'visible' || !enabled.value) return

    const list = isRef(prayers) ? prayers.value : prayers
    if (!list?.length) return

    const now = Date.now()
    const missed = 15 * 60 * 1_000 // 15 menit

    // Tampilkan alert untuk sholat yang baru terlewat (paling dekat ke sekarang)
    const recentlyMissed = list
      .filter((p) => p.time && p.time.getTime() <= now && now - p.time.getTime() <= missed)
      .sort((a, b) => b.time.getTime() - a.time.getTime())[0]

    if (recentlyMissed && enabled.value) triggerInApp(recentlyMissed)

    // Jadwalkan ulang sisa hari ini
    scheduleAll(list)
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Jadwalkan ulang setiap kali daftar sholat atau status enabled berubah
  watch(
    [prayers, enabled],
    ([list]) => {
      if (enabled.value) scheduleAll(list)
      else clearAll()
    },
    { immediate: true, deep: true }
  )

  onUnmounted(() => {
    clearAll()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

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
