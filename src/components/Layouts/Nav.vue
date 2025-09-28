<template>
  <nav class="relative z-50 animate-fade-in">
    <div class="relative p-6">
      <div
        class="w-full bg-gradient-to-br from-slate-800/40 to-slate-900/60 rounded-3xl p-5 border border-slate-600/30 backdrop-blur-2xl shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center group">
            <div class="relative">
              <div
                class="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"
              ></div>

              <div
                class="relative flex items-center space-x-3 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl px-6 py-3 border border-emerald-400/20 hover:border-emerald-400/40 transition-all duration-300"
              >
                <div
                  class="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl shadow-lg"
                >
                  <svg
                    class="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    ></path>
                  </svg>
                </div>

                <div class="flex items-center">
                  <span
                    class="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent"
                  >
                    Swift
                  </span>
                  <span class="text-2xl font-bold text-white ml-1"> Flow </span>
                </div>
              </div>
            </div>
          </div>

          <div class="hidden md:flex items-center space-x-2">
            <!-- <router-link
              to="/"
              class="group relative px-6 py-3 rounded-2xl text-white/80 hover:text-white font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-cyan-500/20 hover:border hover:border-emerald-400/30"
              active-class="bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 border border-emerald-400/50 text-white"
            >
              <span class="relative z-10">Practicar</span>
              <div
                class="absolute inset-0 bg-gradient-to-r from-emerald-400/0 to-cyan-400/0 group-hover:from-emerald-400/10 group-hover:to-cyan-400/10 rounded-2xl transition-all duration-300"
              ></div>
            </router-link>

            <button
              class="group relative px-6 py-3 rounded-2xl text-white/80 hover:text-white font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 hover:border hover:border-purple-400/30"
            >
              <span class="relative z-10">Estadísticas</span>
              <div
                class="absolute inset-0 bg-gradient-to-r from-purple-400/0 to-pink-400/0 group-hover:from-purple-400/10 group-hover:to-pink-400/10 rounded-2xl transition-all duration-300"
              ></div>
            </button>

            <button
              class="group relative px-6 py-3 rounded-2xl text-white/80 hover:text-white font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-indigo-500/20 hover:border hover:border-blue-400/30"
            >
              <span class="relative z-10">Ajustes</span>
              <div
                class="absolute inset-0 bg-gradient-to-r from-blue-400/0 to-indigo-400/0 group-hover:from-blue-400/10 group-hover:to-indigo-400/10 rounded-2xl transition-all duration-300"
              ></div>
            </button> -->
          </div>

          <!-- <div class="md:hidden">
            <button
              @click="toggleMobileMenu"
              class="group relative p-3 rounded-2xl bg-gradient-to-r from-slate-700/50 to-slate-800/50 border border-slate-600/30 hover:border-emerald-400/50 transition-all duration-300"
            >
              <svg
                class="w-6 h-6 text-white group-hover:text-emerald-300 transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  v-if="!mobileMenuOpen"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div> -->
        </div>

        <div
          v-if="mobileMenuOpen"
          class="md:hidden mt-6 pt-6 border-t border-slate-600/30 space-y-2 animate-fade-in"
        >
          <router-link
            to="/"
            @click="closeMobileMenu"
            class="block px-6 py-3 rounded-2xl text-white/80 hover:text-white font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-cyan-500/20 hover:border hover:border-emerald-400/30"
            active-class="bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 border border-emerald-400/50 text-white"
          >
            Practice
          </router-link>

          <button
            @click="closeMobileMenu"
            class="block w-full text-left px-6 py-3 rounded-2xl text-white/80 hover:text-white font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 hover:border hover:border-purple-400/30"
          >
            Stats
          </button>

          <button
            @click="closeMobileMenu"
            class="block w-full text-left px-6 py-3 rounded-2xl text-white/80 hover:text-white font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-indigo-500/20 hover:border hover:border-blue-400/30"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from "vue";

const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.group:hover .bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient-shift 2s ease infinite;
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.group:hover .absolute {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.05);
  }
}

button:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

* {
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter,
    backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(148, 163, 184, 0.1);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.3);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 185, 129, 0.5);
}
</style>
