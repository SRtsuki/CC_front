import request from '@/utils/request'

// 获取所有课程
export function getCourseList(params) {
  let { pagenum, pagesize } = params;
  return request({
    url: '/course/list',
    method: 'get',
    params: { pagenum, pagesize },
  })
}

// 获取老师创建的或者学生加入的课程列表
export function getMyCourseList() {
  return request({
    url : '/course/mylist',
    method: 'get'
  })
}

// 根据课程id获取课程信息
export function courseInfo(params) {
  let {id} = params;
  return request({
    url : '/course/info',
    method: 'get',
    params: {id}
  })
}

export function courseCreate(params) {
  let {name,instruction} = params;
  return request({
    url:'/course/create',
    method:'post',
    data:{name,instruction},
  })
}

export function courseDelete(params){
  let {cid} = params;
  return request({
    url:'/course/del',
    method:'delete',
    data:{cid},
  })
}