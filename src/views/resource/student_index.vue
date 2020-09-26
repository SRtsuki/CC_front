<template>
  <div class="app-container">
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

    <el-card class="resource-operate-card">
      <el-button @click="handleFileDownload">下载文件</el-button>
    </el-card>

    <el-card
      class="resource-list-card"
      :body-style="resourceListCardBodyStyle"
    >
      <el-table :data="file_table_data" class="resource-list-table" @selection-change="handleFileSelectionChange">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column label="文件名" prop="name"></el-table-column>
        <el-table-column label="文件类型" prop="suffix" width="100"></el-table-column>
      </el-table>
    </el-card>

  </div>
</template>

<script>
import store from "@/store";
import {downloadStaticFileByBlob, getCoursefileList} from "@/api/coursefile";

export default {
  name: "student_index.vue",
  data(){
    return {
      // 获取到的课程信息
      courseInfo: '',
      resourceListCardBodyStyle: {
        width: '100%'
      },
      // 文件列表数据
      file_table_data:[],
      // 多选选中数据
      multipleFileSelection: [],
    }
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
      }
    },
  },
  created() {
    // 获取课程信息
    store.dispatch('course/getCourseInfo', parseInt(this.$route.params.cid)).then( data => {
      this.courseInfo = data;
    }).catch(err=>{
      this.$message.error("服务器错误：" + err);
    });
    // 获取文件信息
    this.getAllFolders();
    this.getFileList();
  },
  methods: {
    // 课程跳转
    onCourseClick(row){
      store.dispatch('course/changeSetting', {
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
    // todo 获取所有文件夹
    getAllFolders() {
      this.all_folder_list = [];
      this.tree_folder_list = [];
    },
    // 获取文件列表
    getFileList() {
      getCoursefileList({
        cid: parseInt(this.$route.params.cid)
      }).then(res => {
        this.file_table_data = res.data;
        let suffixArray = [];
        let suffix = "";
        for (let i = 0; i < this.file_table_data.length; i++){
          suffixArray = this.file_table_data[i].name.split(".");
          suffix = suffixArray.pop();
          if (suffix.length === this.file_table_data[i].name.length) {
            suffix = "-"
          }
          this.file_table_data[i].suffix = suffix;
        }
      }).catch(err=>{
        this.$message.error("服务器错误:" + err);
      });
    },
    handleFileSelectionChange(val){
      this.multipleFileSelection = val;
    },
    // 下载
    handleFileDownload(){
      let downloadLink = 'source/coursefile/' + this.$route.params.cid + '/';
      for (let i = 0; i < this.multipleFileSelection.length; i++){
        downloadStaticFileByBlob(downloadLink+this.multipleFileSelection[i].name).then(res => {
          // 如果是IE10及以上，不支持download属性，采用msSaveOrOpenBlob方法，但是IE10以下也不支持msSaveOrOpenBlob
          if ('msSaveOrOpenBlob' in navigator) {
            navigator.msSaveOrOpenBlob(res, this.multipleFileSelection[i].name);
            return;
          }
          // const blob = new Blob([this.response], { type: xhr.getResponseHeader('Content-Type') });
          // const url = URL.createObjectURL(blob);
          const url = URL.createObjectURL(res);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = this.multipleFileSelection[i].name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }).catch(err => {
          this.$message.error("下载失败:" + err);
        })
      }
    },
  }
}
</script>

<style lang="scss" scoped>
@import "src/styles/common";

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

.resource-operate-card {
  width: 98%;
  margin: 20px auto;

  display: flex;
  display: -webkit-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: flex-start;
}

.resource-list-card {
  width: 98%;
  margin: 20px auto;
  display: flex;
  display: -webkit-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  .resource-list-table {
    width: 100%;
  }
}

</style>
