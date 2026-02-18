import request from '@/util/request'

export function loginApi(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function registerApi(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

export function infoUserApi() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

export function updateUserApi(data) {
  return request({
    url: '/user',
    method: 'put',
    data
  })
}

