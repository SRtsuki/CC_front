<template>
  <div style="padding:30px;">
    <!--    课程切换    -->
    <el-card class="resource-title-card">
      <span class="course-title">{{courseInfo.name}}</span>
      <span class="course-id">#{{this.$route.params.cid}}</span>
      <span class="select-course-box" v-popover:popover1><i class="el-icon-refresh"></i>切换课程</span>
      <el-popover
        placement="bottom-end"
        width="400"
        ref="popover1"
        trigger="hover">
        <el-table :data="this.$store.getters.courseList"
                  :style="getPopoverTableStyle"
                  empty-text="暂无课程"
                  @row-click = "onCourseClick"
        >
          <el-table-column property="name" label="课程名"></el-table-column>
        </el-table>
      </el-popover>
    </el-card>
    <!--    课程切换 结束    -->

    <el-alert :closable="false" title="学生管理" />
    <el-main>
      <div>
        <el-button @click="dialogTableVisible = true">添加学生</el-button>
        <el-button circle icon="el-icon-refresh"></el-button>
        <el-button @click="deleteStudent()" icon="el-icon-delete" type="danger"></el-button>
      </div>
      <div style="margin-top:15px;">
        <el-table :data="tableData" style="width:100%" v-loading="tableLoading" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50px;"></el-table-column>
          <el-table-column label="学号" prop="id" width="200"></el-table-column>
          <el-table-column label="用户名" prop="username" width="300"></el-table-column>
          <el-table-column label="昵称" prop="nickname" width="300"></el-table-column>
          <el-table-column label="邮箱" prop="email"></el-table-column>
          <!-- <el-table-column label="操作"></el-table-column> -->
        </el-table>
      </div>
      <el-dialog title="添加学生" :visible.sync="dialogTableVisible">
        <el-form>
          <el-form-item label="所选课程">
            <el-select v-model="selectedCourse" placeholder="请选择课程">
              <el-option label="计算机组成" value="1"></el-option>
              <el-option label="操作系统" value="2"></el-option>
              <el-option label="计算机网络" value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="添加学生">
            <el-input type="textarea" :rows="4" placeholder="请输入学号，并使用英文‘,’分隔" v-model="textarea"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogTableVisible = false">取 消</el-button>
          <el-button type="primary" @click="addStudent()">确 定</el-button>
        </div>
      </el-dialog>
    </el-main>
  </div>
</template>
<script>
import {
  getStudentList,
  addStudentList,
  deleteStudentList,
} from "@/api/student";

export default {
  data() {
    return {
      // 获取到的课程信息
      courseInfo: '',
      // 页面数据
      tableData: [],
      tableLoading: true,
      dialogTableVisible: false,
      textarea: "",
      selectedCourse: "",
      multipleSelection:[],
    };
  },
  computed: {
    getPopoverTableStyle(){
      let height = document.body.clientHeight*0.6;
      return {
        'max-height': height.toString() + 'px',
        'overflow': 'auto',
        'width': '100%',
        'show-header' : false,
        'fit' : true,
      };
    },
  },
  created() {
    // 获取课程信息
    this.$store.dispatch('course/getCourseInfo', parseInt(this.$route.params.cid)).then( data => {
      this.courseInfo = data;
    }).catch(err=>{
      this.$message.error("服务器错误：" + err);
    });

    this.fetchData();
  },
  methods: {
    // 课程跳转
    onCourseClick(row){
      this.$store.dispatch('course/changeSetting', {
        key : 'cid',
        value: row.ID
      }).then(()=>{
        this.$router.push({
          name: this.$route.name,
          params: {
            cid : row.ID
          }
        });
      });
    },
    fetchData() {
      this.tableLoading = true;
      let params = {
        id: parseInt(this.$route.params.cid),
      };
      //课程id
      // console.log(params);
      getStudentList(params)
        .then((response) => {
          this.tableData = response.data;
          this.tableLoading = false;
        })
        .catch(function (err) {
          console.log(err);
        });
    },
    addStudent() {
      this.dialogTableVisible = false;
      let cid = parseInt(this.$route.params.cid);
      let ids = this.textarea.split(",");
      console.log(ids);
      let params = { cid, ids };

      addStudentList(params)
        .then((response) => {
          this.$router.go(0);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    handleSelectionChange(val){
      this.multipleSelection = val;
      console.log(val);
      // let cid = this.$store.getters.id;
      // for(let id in this.multipleSelection.)
    },
    deleteStudent(){
      let cid = parseInt(this.$route.params.id);
      console.log(this.multipleSelection);
      for(let id in this.multipleSelection){
        console.log("id"+id);
        console.log(this.multipleSelection[id].username);
        let params = {cid:cid,username:parseInt(this.multipleSelection[id].username)};
        deleteStudentList(params).then(response =>{
        }).catch((err)=>(console.log(err.msg)));
      }
    }
  },
};
</script>
<style lang="scss" scoped>
@import "src/styles/common";

.el-main {
  background: #f4f4f5;
  margin-top: 15px;
}

.resource-title-card {
  width: 99%;
  margin: auto;
  height: 80px;
  display: flex;
  display: -webkit-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  span {
    font-size: 24px;
  }
  .course-title {
  }
  .course-id {
    color: $font-three-color;
  }
  .select-course-box {
    padding-left: 10px;
    font-size: 18px;
    -webkit-user-select: none;
    user-select: none;
    color: $font-three-color;
  }
}

</style>
