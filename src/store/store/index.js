import { make } from 'vuex-pathify'
import state from './state'
const getters = make.getters(state)
const mutations = make.mutations(state)
const actions = make.actions(state)

export default {
  namespaced: true,
  getters,
  mutations,
  actions,
  state
}
