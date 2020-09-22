import request from '@/utils/request'

export function getStudentList(params){
    let {id} = params;
    return request({
        url:'/student/list',
        method:'get',
        params:{id},
    })
}

export function addStudentList(params){
    let {cid,ids} = params;
    return request({
        url:'/student/add',
        method:'post',
        data:{cid,ids},
    })
}

export function deleteStudentList(params){
    let {cid,id} = params;
    return request({
        url:'/student/del',
        method:'post',
        data:{cid,id},
    })
}
