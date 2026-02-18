import request from '@/util/request'

export function createPublishApi(data) {
  return request({
    url: '/publish',
    method: 'post',
    data
  })
}

export function deletePublishApi(id) {
  return request({
    url: '/publish/' + id,
    method: 'delete'
  })
}

export function updatePublishApi(data) {
  return request({
    url: '/publish',
    method: 'put',
    data
  })
}

export function valuationPublishApi(data) {
  return request({
    url: '/publish/valuation',
    method: 'patch',
    data
  })
}

export function processPublishApi(id, isAccept) {
  return request({
    url: `/publish/process/${id}/${isAccept}`,
    method: 'patch'
  })
}

export function pagePublishApi(params) {
  return request({
    url: '/publish/page',
    method: 'get',
    params
  })
}

export function findPublishApi(id) {
  return request({
    url: '/publish/find/' + id,
    method: 'get'
  })
}
