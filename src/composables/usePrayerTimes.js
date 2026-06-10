import { ref, watch, isRef, onUnmounted } from 'vue'
import { Coordinates, PrayerTimes, CalculationMethod, Madhab, Prayer } from 'adhan'

const METHOD_MAP = {
  MoonsightingCommittee: CalculationMethod.MoonsightingCommittee,
  NorthAmerica: CalculationMethod.NorthAmerica,
  MuslimWorldLeague: CalculationMethod.MuslimWorldLeague,
  Egyptian: CalculationMethod.Egyptian,
  Karachi: CalculationMethod.Karachi,
}

export function usePrayerTimes(
  latInput,
  lngInput,
  methodInput = 'MoonsightingCommittee',
  madhabInput = 'Shafi'
) {
  const lat = isRef(latInput) ? latInput : ref(latInput)
  const lng = isRef(lngInput) ? lngInput : ref(lngInput)
  const method = isRef(methodInput) ? methodInput : ref(methodInput)
  const madhab = isRef(madhabInput) ? madhabInput : ref(madhabInput)

  const prayers = ref([])
  const nextPrayer = ref(null)
  const nextPrayerTime = ref(null)
  const currentPrayer = ref(null)
  const currentDate = ref(new Date())

  function calculate() {
    if (!lat.value || !lng.value) return

    const coords = new Coordinates(lat.value, lng.value)
    const params = METHOD_MAP[method.value]()
    params.madhab = madhab.value === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi

    const times = new PrayerTimes(coords, currentDate.value, params)

    prayers.value = [
      { key: 'fajr', name: 'Subuh', time: times.fajr },
      { key: 'dhuhr', name: 'Dzuhur', time: times.dhuhr },
      { key: 'asr', name: 'Asar', time: times.asr },
      { key: 'maghrib', name: 'Maghrib', time: times.maghrib },
      { key: 'isha', name: 'Isya', time: times.isha },
    ]

    const next = times.nextPrayer()
    nextPrayer.value = next === Prayer.None ? null : next
    nextPrayerTime.value = next === Prayer.None ? null : times.timeForPrayer(next)

    const cur = times.currentPrayer()
    currentPrayer.value = cur === Prayer.None ? null : cur
  }

  watch([lat, lng, method, madhab, currentDate], calculate, {
    immediate: true,
  })

  // Recalculate at midnight for the new day
  let midnightTimer
  function scheduleMidnight() {
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    midnightTimer = setTimeout(() => {
      currentDate.value = new Date()
      scheduleMidnight()
    }, tomorrow - now)
  }
  scheduleMidnight()
  onUnmounted(() => clearTimeout(midnightTimer))

  return { prayers, nextPrayer, nextPrayerTime, currentPrayer }
}
