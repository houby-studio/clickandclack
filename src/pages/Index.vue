<template>
  <q-page class="flex flex-center">
    <!-- Mouse dialog -->
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
              {label: 'Right', value: 'right'}
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
              {label: 'No', value: false}
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
    <!-- Timer dialog -->
    <q-dialog
      v-model="timerSettings"
      transition-show="scale"
      transition-hide="scale"
      full-width
      full-height
    >
      <q-card class="full-width">
        <q-card-section class="q-py-xs">
          <div class="text-h6 text-center">Timer settings</div>
        </q-card-section>
        <q-card-section class="q-py-sm">
          <!-- If Yes, mouse and keyboard share same interval; If No, each has separate interval -->
          <div class="text-h6 text-center">Click & Clack together</div>
          <q-btn-toggle
            v-model="clickAndClackTogether"
            spread
            toggle-color="primary"
            :options="[
              { label: 'Yes', value: true },
              { label: 'No', value: false }
            ]"
          />
        </q-card-section>
        <q-card-section class="q-py-sm">
          <!-- If true, mouse clicks first, then delay, then keyboard; If false, keyboard clacks first, then delay, then mouse -->
          <div class="text-h6 text-center">Trigger order</div>
          <q-btn-toggle
            v-model="clickFirst"
            spread
            toggle-color="primary"
            :disable="!clickAndClackTogether"
            :options="[
              { value: true, slot: 'clickthenclack' },
              { value: false, slot: 'clackthenclick' }
            ]"
          >
            <template v-slot:clickthenclack>
              1.
              <q-icon name="mouse" />
              2.
              <q-icon name="keyboard" />
              <q-tooltip :delay="1000">Click then clack</q-tooltip>
            </template>
            <template v-slot:clackthenclick>
              1.
              <q-icon name="keyboard" />
              2.
              <q-icon name="mouse" />
              <q-tooltip :delay="1000">Clack then click</q-tooltip>
            </template>
          </q-btn-toggle>
        </q-card-section>
        <q-card-section class="q-py-sm">
          <!-- Number in seconds, which sets delay between 1st action and 2nd action on each interval cycle -->
          <q-input
            type="number"
            lazy-rules
            v-model="delaySeconds"
            no-error-icon
            label="Delay in seconds"
            :disable="!clickAndClackTogether"
            :rules="[
              val => val !== null && val !== '' || 'Set delay!',
              val => val => 0 || 'Must be positive!'
            ]"
          >
            <template v-slot:append>
              <q-icon name="schedule" />
            </template>
          </q-input>
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
                size="small"
                round
                @click="showMouseSettings"
              />
            </template>
            <template v-slot:append>
              <q-btn
                icon="schedule"
                size="small"
                round
                @click="showTimerSettings"
              />
            </template>
          </q-input>
          <div class="row">
            <div :class="clickAndClackTogether ? 'col-12' : 'col-7'">
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
                    size="small"
                    round
                    @click="showKeyboardSettings"
                  />
                </template>
              </q-input>
            </div>
            <div
              class="col-5"
              v-show="!clickAndClackTogether"
            >
              <!-- Key timer input -->
              <q-input
                class="q-my-xs"
                type="number"
                lazy-rules
                v-model="keyTimer"
                no-error-icon
                stack-label
                label="Seconds"
                :disable="workflowRunning || clickAndClackTogether"
                :rules="[
              val => val !== null && val !== '' || 'Set interval!',
              val => val > 0 || 'Must be positive!'
            ]"
              >
                <template v-slot:append>
                  <q-btn
                    icon="schedule"
                    size="small"
                    round
                    @click="showTimerSettings"
                  />
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
            :label="workflowRunning ? 'STOP' : 'START'"
            color="primary"
            size="lg"
            class="full-width"
          >
            <q-tooltip
              transition-show="jump-up"
              transition-hide="jump-down"
            >Press <b>Alt + C</b> to {{ workflowRunning ? 'STOP' : 'START' }}</q-tooltip>
          </q-btn>
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
      randomNum: 0, // Holds random delay value
      mouseSettings: false, // Dialog visibility for mouse settings
      keyboardSettings: false, // Dialog visibility for keyboard settings
      timerSettings: false, // Dialog visibility for mouse timer settings
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
    clickAndClackTogether: sync('store/clickAndClackTogether'), // Timer settings - share same timer for clicking and clacking
    clickFirst: sync('store/clickFirst'), // Timer settings - whether order is click>clack or clack>click
    delaySeconds: sync('store/delaySeconds'), // Timer settings - Delay between click and clack when timer is shared
    key: sync('store/key'), // Key to press
    mouseButton: sync('store/mouseButton'), // Left or Right button
    doubleClick: sync('store/doubleClick'), // Double click or Single click
    randomDelay: sync('store/randomDelay'), // Apply random delay, up to 5 seconds
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
    showTimerSettings () {
      this.timerSettings = !this.timerSettings // Show or hide mouse timer settings dialog
    },
    setCustomKey (keyName) {
      this.key = keyName // Set custom key from keyboard dialog
    },
    keyPress () {
      this.key = null // On keypress, always clear input field, so only one KEY can be entered
    },
    buttonPress () {
      // Activated with button press or global shortcut. Toggle between on and off.
      if (this.workflowRunning) {
        // If workflow is already running, stop it
        this.workflowRunning = false
        this.browserWindow.setProgressBar(-1) // Disables progress on taskbar
        clearInterval(this.mouseInterval) // Stop cycling intervals for mouse presses
        clearInterval(this.keyInterval) // Stop cycling intervals for key presses
      } else {
        // Start workflow
        this.workflowRunning = true
        this.browserWindow.setProgressBar(2) // Starts continuous progress on taskbar
        // Start mouse interval - Simply waits certain number of seconds and then clicks, if clicking is enabled
        this.mouseInterval = setInterval(() => {
          this.randomNum = Math.floor(Math.random() * 5 * 1000) // Delay in miliseconds between 0ms and 5000ms (5s)
          // If click and clack together is enabled, both happens in this mouse interval
          if (this.clickAndClackTogether) {
            if (this.clickFirst) {
              // If mouse should click first, trigger it first, then keyboard clack with eventual delay
              this.click()
              setTimeout(() => { this.clack() }, this.delaySeconds * 1000)
            } else {
              // If keyboard should clack first, trigger it first, then mouse click with eventual delay
              this.clack()
              setTimeout(() => { this.click() }, this.delaySeconds * 1000)
            }
          } else {
            // If click and clack together is not enabled, only click
            this.click()
          }
        }, this.mouseTimer * 1000)
        // Start key interval - Simply waits certain number of seconds and then clacks, if clacking is enabled
        // If click and clack together is enabled, keyboard interval is not created
        if (!this.clickAndClackTogether) {
          this.keyInterval = setInterval(() => {
            this.clack()
          }, this.keyTimer * 1000)
        }
      }
    },
    click () {
      // If clicking is disabled in settings, do nothing
      if (this.clicking) {
        if (this.randomDelay) {
          // If random delay should be applied, start timeout, otherwise immediately click
          setTimeout(robot.mouseClick(this.mouseButton, this.doubleClick), this.randomNum) // Clicks with either left or right button and either single click or double click with random delay
        } else {
          robot.mouseClick(this.mouseButton, this.doubleClick) // Clicks with either left or right button and either single click or double click without delay
        }
      }
    },
    clack () {
      // If clacking is disabled in settings, do nothing
      if (this.clacking) {
        // If random delay should be applied, start timeout, otherwise immediately clack
        if (this.randomDelay) {
          setTimeout(robot.keyTap(this.key), this.randomNum) // Presses defined button with random delay
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
