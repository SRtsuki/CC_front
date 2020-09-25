const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  id: state => state.user.id,
  username: state => state.user.username,
  nickname: state => state.user.nickname,
  email: state => state.user.email,
  avatar: state => state.user.avatar,
  role: state => state.user.role,
  name: state => state.user.username,
  permission_routes: state => state.permission.routes,
  cid: state => state.course.cid,
  courseList: state => state.course.courseList,
}
export default getters
