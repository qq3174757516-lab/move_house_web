import request from '@/util/request'

export function loginDriverApi(data) {
  return request({
    url: '/driver/login',
    method: 'post',
    data
  })
}

export function registerDriverApi(data) {
  return request({
    url: '/driver/register',
    method: 'post',
    data
  })
}

export function infoDriverApi() {
  return request({
    url: '/driver/info',
    method: 'get'
  })
}

export function updateDriverApi(data) {
  return request({
    url: '/driver',
    method: 'put',
    data
  })
}