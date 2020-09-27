import request from '@/utils/request'

// 获取课程镜像列表
export function getImageList (data){
  return request({
    url: '/docker/images',
    method: 'post',
    data
  })
}
