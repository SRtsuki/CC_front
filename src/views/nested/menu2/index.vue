<template>
  <div style="padding:30px;">
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
import { store } from "@/store";

export default {
  data() {
    return {
      tableData: [],
      tableLoading: true,
      dialogTableVisible: false,
      textarea: "",
      selectedCourse: "",
      multipleSelection:[],
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.tableLoading = true;
      let params = {
        id: this.$store.getters.id,
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
      let cid = parseInt(this.selectedCourse);
      let ids = this.textarea.split(",");
      console.log(ids);
      let params = { cid, ids };

      addStudentList(params)
        .then((response) => {
          this.$message({
            message:'添加成功',
            type:'success'
          });
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
      let cid = this.$store.getters.id;
      console.log(this.multipleSelection);
      for(let id in this.multipleSelection){
        console.log("id"+id);
        console.log(this.multipleSelection[id].username);
        let params = {cid:cid,id:parseInt(this.multipleSelection[id].username)};
        // console.log(params);
        deleteStudentList(params).then(response =>{
        }).catch((err)=>(console.log(err.msg)));
      }
      // this.$router.go(0);
    }
  },
};
</script>
<style scoped>
.el-main {
  background: #f4f4f5;
  margin-top: 15px;
}
</style>