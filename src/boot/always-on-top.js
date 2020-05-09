import { remote } from 'electron'

export default async ({ store }) => {
  // On boot read user preference from vuex store and set window accordingly
  remote.BrowserWindow.getAllWindows()[0].setAlwaysOnTop(store.state.store.alwaysOnTop)
}
