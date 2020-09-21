import request from '@/utils/request'

export function getCourseList(params) {
  let { pagenum, pagesize } = params;
  return request({
    url: '/course/list',
    method: 'get',
    params: { pagenum, pagesize }
  })
}
