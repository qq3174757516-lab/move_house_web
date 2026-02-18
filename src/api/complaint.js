import request from '@/util/request'

export function pageComplaintApi(params) {
  return request({
    url: '/complaint/page',
    method: 'get',
    params
  })
}

export function createComplaintApi(data) {
  return request({
    url: '/complaint',
    method: 'post',
    data
  })
}