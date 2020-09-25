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
    <wlExplorer
      ref="wl-explorer-cpt"
      :headerDropdown="headerHandle"
      :columns="file_table_columns"
      :all-path="all_folder_list"
      :is-folder-fn="isFolderFn"
      :folderType="rource_type"
      :data="file_table_data"
      :props="explorer_prop"
      @handleFolder="handleFolder"
      @search="fileSearch"
      @del="fileDel"
      @closeFade="closeOtherLayout(fade)"
    ></wlExplorer>
  </div>
</template>

<script>
import Vue from 'vue'
import wlExplorer from "wl-explorer";
import "wl-explorer/lib/wl-explorer.css"
import store from "@/store";

Vue.use(wlExplorer);

export default {
  name: "teacher_index.vue",
  data(){
    return {
      // 获取到的课程信息
      courseInfo: '',
      // 文件浏览器数据
      // 文件列表数据
      file_table_data:[],
      // 文件列表表头数据
      file_table_columns: [],
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
      };
    },
    // courseList(){
    //   let courseListData = this.$store.getters.courseList;
    //   let index = 0;
    //   let cid = parseInt(this.$route.params.cid);
    //   while(index < courseListData.length && courseListData[index].ID !== cid){
    //     index++;
    //   }
    //   courseListData.splice(index, 1);
    //   return courseListData;
    // }
  },
  created() {
    store.dispatch('course/getCourseInfo', parseInt(this.$route.params.cid)).then( data => {
      this.courseInfo = data;
    }).catch(err=>{
      this.$message.error("服务器错误：" + err);
    });
  },
  methods: {
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
    }
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
  //.select-course-box {
  //  //padding-left: 10px;
  //  //display: flex;
  //  flex: 1;
  //}
}
</style>
