import {courseInfo, getMyCourseList} from "@/api/course";

const state = {
  courseList: [],
  cid: 0
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    // eslint-disable-next-line no-prototype-builtins
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  }
}

const actions = {
  changeSetting({ commit }, data) {
    return new Promise((resolve, reject) => {
      commit('CHANGE_SETTING', data);
      resolve();
    })
  },
  getCourseList({ commit, state }){
    return new Promise((resolve, reject) => {
      // 获取用户信息
      getMyCourseList().then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        //保存课程信息
        commit('CHANGE_SETTING', {
          key: 'courseList',
          value: data,
        });
        // 设置初始cid
        if (data[0]){
          commit('CHANGE_SETTING', {
            key: 'cid',
            value: data[0].ID,
          });
        } else {
          // 记cid为0 表示名下还没有课程
          commit('CHANGE_SETTING', {
            key: 'cid',
            value: 0
          });
        }
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },
  getCourseInfo({ commit, state }, id){
    return new Promise((resolve, reject) => {
      // 获取用户信息
      courseInfo({
        id: id
      }).then(response => {
        const { data } = response

        if (!data) {
          return reject('无课程信息，请检查cid是否正确！')
        } else {
          // 更换当前课程cid记录
          commit('CHANGE_SETTING', {
            key: 'cid',
            value: id,
          })
        }
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
