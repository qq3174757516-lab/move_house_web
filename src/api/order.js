import request from '@/util/request'

export function pageOrderApi(params) {
  return request({
    url: '/order/page',
    method: 'get',
    params
  })
}

export function arriveOrderApi(id) {
  return request({
    url: `/order/change-status/${id}/${0}`,
    method: 'patch'
  })
}

export function finishOrderApi(id) {
  return request({
    url: `/order/change-status/${id}/${1}`,
    method: 'patch'
  })
}

