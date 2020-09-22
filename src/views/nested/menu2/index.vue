<template>
  <div style="padding:30px;">
    <el-alert :closable="false" title="学生管理" />
    <el-main>
      <div>
        <el-button>添加学生</el-button>
        <el-button circle icon="el-icon-refresh"></el-button>
      </div>
      <div style="margin-top:15px;">
        <el-table :data="tableData" style="width:100%">
          <el-table-column label="学号" prop="id" width="300"></el-table-column>
          <el-table-column label="用户名" prop="username" width="300"></el-table-column>
          <el-table-column label="昵称" prop="nickname" width="300"></el-table-column>
          <el-table-column label="邮箱" prop="email" ></el-table-column>
        </el-table>
      </div>
    </el-main>
  </div>
</template>
<script>
export default {};
</script>
<style scoped>
.el-main {
  background: #f4f4f5;
  margin-top: 15px;
}
</style>