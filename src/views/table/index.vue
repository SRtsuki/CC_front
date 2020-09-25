<template>
  <div style="padding:30px;">
    <el-alert :closable="false" title="课程列表" />
    <el-main>
      <div>
        <!-- <el-button>加入课程</el-button> -->
        <el-button circle icon="el-icon-refresh"></el-button>
      </div>
      <div style="padding-top:15px;">
        <el-table
          v-loading="tableLoading"
          :data="tableData"
          style="width: 100%"
          :default-sort="{prop: 'tid', order: 'descending'}"
        >
          <el-table-column prop="tid" label="任课教师" sortable width="100"></el-table-column>
          <el-table-column prop="name" label="课程名" width="180"></el-table-column>
          <el-table-column prop="instruction" label="介绍"></el-table-column>
        </el-table>
      </div>
    </el-main>
  </div>
</template>


<script>

import {getCourseList,getMyCourseList} from "@/api/course";

export default {
  data(){
    return {
      tableData : [],
      tableLoading: true,
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.tableLoading = true;
      // let params = {
      //   pagenum: 0,
      //   pagesize: 20
      // };
      getMyCourseList().then(response => {
        console.log(response.data);
        this.tableData = response.data;
        this.tableLoading = false;
      })
    },
  }
};
</script>
<style scoped>
.el-main {
  background: #f4f4f5;
  margin-top: 15px;
}
</style>