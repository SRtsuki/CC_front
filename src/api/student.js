import request from '@/utils/request'

export function getStudentList(){
    return request({
        url:'/course/mylist',
        method:'get',
    })
}