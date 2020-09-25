<template>
  <div class="app-container">
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%"
      :default-sort = "{prop: 'tid', order: 'descending'}"
    >
      <el-table-column
        prop="tid"
        label="任课教师"
        sortable
        width="100">
      </el-table-column>
      <el-table-column
        prop="name"
        label="课程名"
        width="180">
      </el-table-column>
      <el-table-column
        prop="instruction"
        label="介绍">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>

import {getCourseList} from "@/api/course";
import {mapGetters} from "vuex";

export default {
  name: "index.vue",
  data(){
    return {
      tableData : [],
      tableLoading: true,
    }
  },
  created() {
    this.fetchData()
  },
  computed:{
  },
  methods: {
    fetchData() {
      this.tableLoading = true;
      let params = {
        pagenum: 0,
        pagesize: 20
      };
      getCourseList(params).then(response => {
        this.tableData = response.data.cs
        this.tableLoading = false
      })
    },
  }
}
</script>

<style scoped>

</style>
