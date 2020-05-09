<template>
  <q-page class="flex flex-center">
    <!-- Mouse Dialog -->
    <q-dialog
      v-model="mouseSettings"
      transition-show="scale"
      transition-hide="scale"
      full-width
      full-height
    >
      <q-card class="full-width">
        <q-card-section class="q-py-sm">
          <div class="text-h6 text-center">Mouse settings</div>
        </q-card-section>
        <q-card-section class="q-py-lg">
          <div class="text-h6 text-center">Button</div>
          <q-btn-toggle
            v-model="mouseButton"
            spread
            toggle-color="primary"
            :options="[
              {label: 'Left', value: 'left'},
              {label: 'Right', value: 'right'},
            ]"
          />
        </q-card-section>
        <q-card-section class="q-py-lg">
          <div class="text-h6 text-center">Double Click</div>
          <q-btn-toggle
            v-model="doubleClick"
            spread
            toggle-color="primary"
            :options="[
              {label: 'Yes', value: true},
              {label: 'No', value: false},
            ]"
          />
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
    <!-- Keyboard dialog -->
    <q-dialog
      v-model="keyboardSettings"
      transition-show="scale"
      transition-hide="scale"
      full-width
      full-height
    >
      <q-card class="full-width">
        <q-card-section class="q-py-sm">
          <div class="text-h6 text-center">Special key</div>
        </q-card-section>
        <q-card-section>
          <q-btn
            class="full-width"
            v-for="key in specialKeys"
            :key="key"
            :label="key"
            @click="setCustomKey(key)"
            unelevated
            v-close-popup
          />
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
    <!-- Main page -->
    <q-card
      square
      bordered
      class="q-pa-lg shadow-1"
    >
      <q-form
        @submit="buttonPress"
        ref="loginform"
        class="q-gutter-md"
      >
        <q-card-section>
          <!-- Mouse timer input -->
          <q-input
            class="q-my-xs"
            type="number"
            lazy-rules
            v-model="mouseTimer"
            no-error-icon
            label="Click interval in seconds"
            :disable="workflowRunning"
            :rules="[
              val => val !== null && val !== '' || 'Set interval!',
              val => val > 0 || 'Must be positive!'
            ]"
          >
            <template v-slot:prepend>
              <q-btn
                icon="mouse"
                round
                @click="showMouseSettings"
              />
            </template>
            <template v-slot:append>
              <q-icon name="schedule" />
            </template>
          </q-input>
          <div class="row">
            <div class="col-7">
              <!-- Key to press input -->
              <q-input
                class="q-my-xs"
                lazy-rules
                v-model="key"
                @keypress="keyPress"
                no-error-icon
                stack-label
                input-class="text-uppercase"
                label="Key"
                :disable="workflowRunning"
                :rules="[ val => val !== null && val !== '' || 'Select Key!']"
              >
                <template v-slot:prepend>
                  <q-btn
                    icon="keyboard"
                    round
                    @click="showKeyboardSettings"
                  />
                </template>
              </q-input>
            </div>
            <div class="col-5">
              <!-- Key timer input -->
              <q-input
                class="q-my-xs"
                type="number"
                lazy-rules
                v-model="keyTimer"
                no-error-icon
                stack-label
                label="Seconds"
                :disable="workflowRunning"
                :rules="[
              val => val !== null && val !== '' || 'Set interval!',
              val => val > 0 || 'Must be positive!'
            ]"
              >
                <template v-slot:append>
                  <q-icon name="schedule" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
        <q-card-actions class="q-px-md">
          <!-- Primary button starting workflow -->
          <q-btn
            @click="buttonPress"
            unelevated
            label="Alt + C"
            color="primary"
            size="lg"
            class="full-width"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script>
// import robot from 'robotjs'
const robot = require('electron').remote.require('robotjs')
import { sync } from 'vuex-pathify'
const { globalShortcut } = require('electron').remote

export default {
  name: 'ClickAndClack',

  data () {
    return {
      workflowRunning: false, // When button was pressed and either mouse, keyboard or both are running
      mouseInterval: {}, // Holds object for time interval on mouse
      keyInterval: {}, // Holds object for time interval on keyboard
      progress: 0, // Holds progress value
      mouseSettings: false, // Dialog visibility for mouse settings
      keyboardSettings: false, // Dialog visibility for keyboard settings
      specialKeys: ['space', 'enter', 'tab', 'escape', 'control', 'alt', 'shift'] // Special keys which user can define
    }
  },
  computed: {
    browserWindow () { // Hold window in variable to be able to show progress on taskbar
      const window = this.$q.electron.remote.BrowserWindow.getAllWindows()[0]
      return window
    },
    mouseTimer: sync('store/mouseTimer'), // Seconds to press mouse
    keyTimer: sync('store/keyTimer'), // Seconds to press key
    key: sync('store/key'), // Key to press
    mouseButton: sync('store/mouseButton'), // Left or Right button
    doubleClick: sync('store/doubleClick'), // Double click or Single click
    randomDelay: sync('store/randomDelay'), // Apply random delay up to 5 seconds
    clicking: sync('store/clicking'), // Should mouse be clicking
    clacking: sync('store/clacking') // Should key be clacking
  },
  methods: {
    showMouseSettings () {
      this.mouseSettings = !this.mouseSettings // Show or hide mouse settings dialog
    },
    showKeyboardSettings () {
      this.keyboardSettings = !this.keyboardSettings // Show or hide keyboard settings dialog
    },
    setCustomKey (keyName) {
      this.key = keyName // Set custom key from keyboard dialog
    },
    keyPress () {
      this.key = null // On keypress, always clear input field, so only one KEY can be entered
    },
    buttonPress () {
      // Activated with button press or global shortcut. Toggle between on and off.
      // Example: If you set 10 seconds for mouse click, it triggers 10 times each second to update progress. 10. trigger also fires mouse.
      // Keyboard trigger has separate timer and does not reflect on progress bar
      if (this.workflowRunning) {
        // If workflow is already running, stop it
        this.workflowRunning = false
        this.browserWindow.setProgressBar(-1) // Disables progress on taskbar
        this.progress = 0
        clearInterval(this.mouseInterval) // Stop cycling intervals for mouse presses
        clearInterval(this.keyInterval) // Stop cycling intervals for key presses
      } else {
        // Start workflow
        this.workflowRunning = true
        this.browserWindow.setProgressBar(0) // Start progress from 0
        // Start mouse interval - Interval triggers 10 times to update progress bar, then fires click event, if clicking is enabled
        this.mouseInterval = setInterval(() => {
          if (this.progress === 10) {
            this.progress = 0
            this.browserWindow.setProgressBar(0) // Start progress from 0
            this.click()
          } else {
            this.browserWindow.setProgressBar(this.progress / 10)
            this.progress++
          }
        }, this.mouseTimer * 100)
        // Start key interval - Simply waits certain number or seconds and then clacks if clacking is enabled
        this.keyInterval = setInterval(() => {
          this.clack()
        }, this.keyTimer * 1000)
      }
    },
    click () {
      if (this.clicking) {
        if (this.randomDelay) {
          var delay = Math.floor(Math.random() * 5 * 1000) // Delay in miliseconds between 0ms and 5000ms (5s)
          setTimeout(robot.mouseClick(this.mouseButton, this.doubleClick), delay) // Clicks with either left or right button and either single click or double click with random delay
        } else {
          robot.mouseClick(this.mouseButton, this.doubleClick) // Clicks with either left or right button and either single click or double click without delay
        }
      }
    },
    clack () {
      if (this.clacking) {
        if (this.randomDelay) {
          var delay = Math.floor(Math.random() * 5 * 1000) // Delay in miliseconds between 0ms and 5000ms (5s)
          setTimeout(robot.keyTap(this.key), delay) // Presses defined button with random delay
        } else {
          robot.keyTap(this.key) // Presses defined button without delay
        }
      }
    }
  },
  created: function () {
    // Register always listening function for Alt+C shortcut
    globalShortcut.register('Alt+C', () => {
      this.buttonPress()
    }
    )
  },
  destroyed: function () {
    // Unregister listening function
    globalShortcut.unregister('Alt+C')
  }
}
</script>
