import request from '@/utils/request'

// 获取所有镜像
export function getImageList(data) {
  return request({
    url: '/docker/images',
    method: 'post',
    data: data
  })
}

// 上传镜像
export function postImage(data) {
  return request({
    url : '/docker/pull',
    method: 'post',
    data: data,
    timeout: 30000,
  })
}

// 删除镜像
export function deleteImage(data) {
  return request({
    url : '/docker/del',
    method: 'post',
    data: data,
  })
}
