<template>
  <div style="width:200px; margin:30% 40%">
    <el-input v-model="containerID" placeholder="请输入容器名称/ID"></el-input>
    <el-button @click="goToTerminal">跳转到命令行</el-button>
  </div>
</template>

<script>
export default {
  data() {
      return {
          containerID: ""
      }
  },
  methods: {
    goToTerminal() {
      let routeUrl = this.$router.resolve({
        path: "/terminal",
        query: { id: this.containerID },
      });
      window.open(routeUrl.href, "_blank");
    },
  },
};
</script>