<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Toolbar -->
    <q-header
      elevated
      class="q-electron-drag"
    >
      <q-toolbar>
        <q-toolbar-title>
          <q-icon name="mouse" /> Click &
          <q-icon name="keyboard" /> Clack
        </q-toolbar-title>

        <q-btn
          dense
          flat
          icon="settings"
          @click="showDisplaySettings"
          style="height: 100%"
        />
        <q-btn
          dense
          flat
          icon="minimize"
          @click="minimize"
          style="height: 100%"
        />
        <q-btn
          dense
          flat
          icon="close"
          @click="closeApp"
          style="height: 100%"
        />
      </q-toolbar>
    </q-header>

    <q-dialog
      v-model="displaySettings"
      transition-show="scale"
      transition-hide="scale"
      full-width
      full-height
    >
      <q-card class="full-width">
        <q-card-section class="q-py-sm">
          <div class="text-h6 text-center">Settings</div>
        </q-card-section>
        <q-card-section class="q-py-lg">
          <div class="text-h6 text-center">Always on top</div>
          <q-btn-toggle
            v-model="alwaysOnTop"
            spread
            toggle-color="primary"
            :options="[
              {label: 'Yes', value: true},
              {label: 'No', value: false},
            ]"
          />
        </q-card-section>
        <q-card-section class="q-py-sm">
          <div class="text-h6 text-center">Random delay</div>
          <q-btn-toggle
            v-model="randomDelay"
            spread
            toggle-color="primary"
            :options="[
              {label: 'Yes', value: true},
              {label: 'No', value: false},
            ]"
          />
        </q-card-section>
        <q-card-section class="q-py-sm">
          <q-checkbox v-model="clicking">
            <template v-slot:default>
              <q-icon name="mouse"></q-icon> Clicking
            </template>
          </q-checkbox>

          <q-checkbox v-model="clacking">
            <template v-slot:default>
              <q-icon name="keyboard"></q-icon> Clacking
            </template>
          </q-checkbox>
        </q-card-section>
        <q-page-sticky
          position="bottom"
          :offset="[0, 0]"
        >
          <q-card-actions>
            <q-btn
              icon="close"
              round
              color="primary"
              v-close-popup
            >
            </q-btn>
          </q-card-actions>
        </q-page-sticky>
      </q-card>
    </q-dialog>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style>
body {
  overflow: hidden;
}
</style>

<script>
import { sync } from 'vuex-pathify'

export default {
  name: 'MainLayout',

  data () {
    return {
      displaySettings: false
    }
  },
  computed: {
    alwaysOnTop: sync('store/alwaysOnTop'),
    randomDelay: sync('store/randomDelay'),
    clicking: sync('store/clicking'),
    clacking: sync('store/clacking')
  },
  methods: {
    showDisplaySettings () {
      this.displaySettings = !this.displaySettings
    },
    minimize () {
      if (process.env.MODE === 'electron') {
        this.$q.electron.remote.BrowserWindow.getFocusedWindow().minimize()
      }
    },
    closeApp () {
      if (process.env.MODE === 'electron') {
        this.$q.electron.remote.BrowserWindow.getFocusedWindow().close()
      }
    }
  },
  watch: {
    alwaysOnTop (alwaysOnTop) {
      this.$q.electron.remote.BrowserWindow.getFocusedWindow().setAlwaysOnTop(alwaysOnTop) // When alwaysOnTop value changes, configure electron window accordingly
    }
  }
}
</script>
