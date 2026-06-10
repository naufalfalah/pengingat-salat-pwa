import { computed } from 'vue'
import { Coordinates, PrayerTimes, CalculationMethod, Madhab, Prayer } from 'adhan'

const METHODS = {
  MoonsightingCommittee: CalculationMethod.MoonsightingCommittee,
  NorthAmerica:          CalculationMethod.NorthAmerica,
  MuslimWorldLeague:     CalculationMethod.MuslimWorldLeague,
  Egyptian:              CalculationMethod.Egyptian,
  Karachi:               CalculationMethod.Karachi,
}

export function usePrayerTimes(lat, lng, methodName = 'MoonsightingCommittee', madhabName = 'Shafi') {
  const coords = new Coordinates(lat, lng)
  const params = METHODS[methodName]()
  params.madhab = madhabName === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi

  const date = new Date()
  const times = new PrayerTimes(coords, date, params)

  const prayers = [
    { name: 'Subuh',   time: times.fajr    },
    { name: 'Dzuhur',  time: times.dhuhr   },
    { name: 'Asar',    time: times.asr     },
    { name: 'Maghrib', time: times.maghrib },
    { name: 'Isya',    time: times.isha    },
  ]

  const nextPrayer = times.nextPrayer()
  const nextPrayerTime = times.timeForPrayer(nextPrayer)

  return { prayers, nextPrayer, nextPrayerTime }
}