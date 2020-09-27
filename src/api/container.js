import request from '@/utils/request'

// 容器批量创建
export function createContainers (data){
  return request({
    url: '/docker/create',
    method: 'post',
    data
  })
}

// 获取容器列表
export function getMyContainerList(data) {
  return request({
    url: '/docker/containerlist',
    method: 'post',
    data
  })
}

// 容器分配
export function allocateContainer(data) {
  return request({
    url: '/docker/alloc',
    method: 'post',
    data
  })
}
