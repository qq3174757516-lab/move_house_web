import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isLogin: false,
    user: {}
  },
  mutations: {
    setUser(state, user) {
      state.user = { ...user }
    },
    changeLogin(state, status) {
      state.isLogin = status
    }
  },
  actions: {
    setUser({ commit }, user) {
      commit('setUser', user)
    },
    changeLogin({ commit }, status) {
      commit('changeLogin', status)
    }
  }
})
