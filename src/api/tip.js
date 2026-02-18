import request from '@/util/request'

export function listTipApi() {
  return request({
    url: '/tip',
    method: 'get'
  })
}