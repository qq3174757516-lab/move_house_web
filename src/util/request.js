import axios from 'axios'
import { Toast } from 'vant'
import router from '@/router'
import Vue from 'vue'
import store from '@/store'

const service = axios.create({
  // 默认地址
  baseURL: Vue.prototype.$baseUrl,
  // 设置超时时间
  timeout: 120000,
  // 跨域时候允许携带凭证
  withCredentials: true
})

service.interceptors.request.use(config => {
  const user = store.state.user
  config.headers['token'] = user.token
  return config
})

service.interceptors.response.use(res => {
  let data = res.data
  let code = data.code

  if (code === 401) {
    Toast.fail('请先登录!')
    store.commit('changeLogin', false)
    store.commit('setUser', {})
    router.push('/login')
    return Promise.reject(data)
  }

  if (code !== 200) {
    Toast.fail(data.message)
    return Promise.reject(data)
  }

  return Promise.resolve(data)
})

export default service