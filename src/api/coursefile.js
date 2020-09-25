import request from '@/utils/request'

// 获取文件列表
export function getCoursefileList(data) {
  return request({
    url: '/coursefile/files',
    method: 'post',
    data
  })
}

//文件下载
export function downloadStaticFileByBlob(url){
  return request({
    url: url,
    method: 'get',
    responseType: 'blob'
  })
}
