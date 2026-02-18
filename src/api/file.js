import request from '@/util/request'

export function uploadApi(file) {
  const data = new FormData()
  data.append('file', file)
  return request({
    url: '/file/upload',
    method: 'post',
    data
  })
}