import request from '@/util/request'

export function listAddressApi() {
  return request({ url: '/address/list', method: 'get' })
}
export function saveAddressApi(data) {
  return request({ url: '/address', method: 'post', data })
}
export function deleteAddressApi(id) {
  return request({ url: `/address/${id}`, method: 'delete' })
}