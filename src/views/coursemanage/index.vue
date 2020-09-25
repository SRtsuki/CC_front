<template>
  <div style="padding:30px;">
    <el-alert :closable="false" title="课程列表" />
    <el-main>
      <div>
        <!-- <el-button>加入课程</el-button> -->
        <el-button @click="dialogFormVisible = true">创建课程</el-button>
        <el-button @click="deleteCourse()" type="danger" icon="el-icon-delete"></el-button>
        <el-button circle icon="el-icon-refresh"></el-button>
      </div>
      <el-dialog title="创建课程" :visible.sync="dialogFormVisible">
        <el-form>
          <el-form-item label="课程名">
            <el-input v-model="courseName"></el-input>
          </el-form-item>
          <el-form-item label="课程介绍">
            <el-input v-model="courseDes" type="textarea" rows="5"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="createCourse()">确 定</el-button>
        </div>
      </el-dialog>
      <div style="padding-top:15px;">
        <el-table
          v-loading="tableLoading"
          :data="tableData"
          style="width: 100%"
          :default-sort="{prop: 'tid', order: 'descending'}"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50px;"></el-table-column>
          <el-table-column prop="tid" label="任课教师" sortable width="100"></el-table-column>
          <el-table-column prop="name" label="课程名" width="180"></el-table-column>
          <el-table-column prop="instruction" label="介绍"></el-table-column>
        </el-table>
      </div>
    </el-main>
  </div>
</template>

<script>
import { getCourseList, courseCreate ,courseDelete} from "@/api/course";
import { mapGetters } from "vuex";

export default {
  name: "index.vue",
  data() {
    return {
      tableData: [],
      tableLoading: true,
      dialogFormVisible: false,
      courseName: "",
      courseDes: "",
      multipleSelection:[],
    };
  },
  created() {
    this.fetchData();
  },
  computed: {},
  methods: {
    fetchData() {
      this.tableLoading = true;
      let params = {
        pagenum: 0,
        pagesize: 20,
      };
      getCourseList(params).then((response) => {
        this.tableData = response.data.cs;
        this.tableLoading = false;
      });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
      console.log(val);
    },
    createCourse() {
      // let name = this.courseName;
      // let instruction = this.courseDes;
      let params = {
        name: this.courseName,
        instruction: this.courseDes,
      };
      courseCreate(params).then((response) => {
        this.dialogFormVisible = false;
        this.$router.go(0);
      });
    },
    deleteCourse() {
      for(let id in this.multipleSelection){
        let params = {cid:parseInt(this.multipleSelection[id].ID)};
        courseDelete(params).then(response => {
          this.$router.go(0);
        })
      }
    },
  },
};
</script>

<style scoped>
</style>
