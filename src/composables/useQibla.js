import { ref, computed, isRef, onUnmounted } from 'vue'

const MECCA = { lat: 21.4225, lng: 39.8262 }

function toRad(deg) {
  return deg * (Math.PI / 180)
}
function toDeg(rad) {
  return rad * (180 / Math.PI)
}

function bearing(fromLat, fromLng, toLat, toLng) {
  const dLng = toRad(toLng - fromLng)
  const fromR = toRad(fromLat)
  const toR = toRad(toLat)
  const y = Math.sin(dLng) * Math.cos(toR)
  const x = Math.cos(fromR) * Math.sin(toR) - Math.sin(fromR) * Math.cos(toR) * Math.cos(dLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

export function useQibla(latInput, lngInput) {
  const lat = isRef(latInput) ? latInput : ref(latInput)
  const lng = isRef(lngInput) ? lngInput : ref(lngInput)

  const qiblaAngle = computed(() => {
    if (!lat.value || !lng.value) return null
    return bearing(lat.value, lng.value, MECCA.lat, MECCA.lng)
  })

  const deviceHeading = ref(null)
  const compassGranted = ref(false)
  const compassRequested = ref(false)

  // Rotasi jarum = arah kiblat dikurangi heading device (agar jarum selalu menunjuk ke Mekkah)
  const needleRotation = computed(() => {
    if (qiblaAngle.value === null) return 0
    if (deviceHeading.value === null) return qiblaAngle.value
    return (qiblaAngle.value - deviceHeading.value + 360) % 360
  })

  function handleOrientation(e) {
    compassGranted.value = true
    // iOS menggunakan webkitCompassHeading, Android menggunakan alpha
    if (e.webkitCompassHeading != null) {
      deviceHeading.value = e.webkitCompassHeading
    } else if (e.alpha != null) {
      deviceHeading.value = (360 - e.alpha) % 360
    }
  }

  function startListening() {
    window.addEventListener('deviceorientation', handleOrientation, true)
  }

  function stopListening() {
    window.removeEventListener('deviceorientation', handleOrientation, true)
  }

  async function requestCompass() {
    compassRequested.value = true
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      // iOS 13+
      try {
        const result = await DeviceOrientationEvent.requestPermission()
        if (result === 'granted') startListening()
      } catch {
        // user menolak atau browser tidak support
      }
    } else {
      // Android & desktop — langsung listen
      startListening()
    }
  }

  onUnmounted(stopListening)

  return {
    qiblaAngle,
    deviceHeading,
    compassGranted,
    compassRequested,
    needleRotation,
    requestCompass,
    stopListening,
  }
}
