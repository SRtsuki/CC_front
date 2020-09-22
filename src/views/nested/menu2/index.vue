<template>
  <div style="padding:30px;">
    <el-alert :closable="false" title="学生管理" />
    <el-main>
      <div>
        <el-button>添加学生</el-button>
        <el-button circle icon="el-icon-refresh"></el-button>
      </div>
    </el-main>
  </div>
</template>
<script>
export default {
  
}
</script>
<style scoped>
.el-main{
  background:#F4F4F5;
  margin-top:15px;
}
</style>