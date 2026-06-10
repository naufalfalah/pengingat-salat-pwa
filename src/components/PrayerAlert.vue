<script setup>
defineProps({
  prayer: { type: Object, default: null }, // { name, key }
})
defineEmits(['dismiss'])
</script>

<template>
  <Transition
    enter-from-class="-translate-y-4 opacity-0"
    enter-active-class="transition-all duration-300"
    leave-to-class="-translate-y-4 opacity-0"
    leave-active-class="transition-all duration-200"
  >
    <div
      v-if="prayer"
      class="mx-4 mt-4 bg-emerald-600 text-white rounded-2xl shadow-lg px-4 py-3.5 flex items-center gap-3"
    >
      <div class="text-2xl shrink-0">🕌</div>
      <div class="flex-1">
        <p class="font-bold text-sm">Allahu Akbar — Waktu {{ prayer.name }}</p>
        <p class="text-emerald-200 text-xs mt-0.5">Sudah masuk waktu sholat {{ prayer.name }}</p>
      </div>
      <button
        @click="$emit('dismiss')"
        class="shrink-0 bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </Transition>
</template>
