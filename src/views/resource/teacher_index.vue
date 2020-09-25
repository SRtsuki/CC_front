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
<!--    :folderType="rource_type"-->
<!--    :is-folder-fn="isFolderFn"-->
    <wlExplorer
      ref="wl-explorer-cpt"
      :headerDropdown="headerHandle"
      :columns="file_table_columns"
      :all-path="all_folder_list"
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
  // components: { wlExplorer },
  data(){
    return {
      // 获取到的课程信息
      courseInfo: '',
      // 文件浏览器数据
      // 文件列表数据
      file_table_data:[],
      // 文件列表表头数据
      file_table_columns: [],
      // 所有文件路径列表,用于快速访问、移动、上传、新建
      all_folder_list: [],
      // 文件浏览器配置项
      explorer_prop:{

      },
      // 头部更多操作自定义菜单
      headerHandle: [],
      fade: null,
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
    },
    // 判断row是否为文件夹
    isFolderFn(row){
      return false;
    },
    // 文件夹新增或编辑处理 act当前选择文件夹、type类型edit/add、file当前的路径信息
    handleFolder(act, type, file){
      console.log(act + "|||" + type + "|||" + file);
      console.log(act);
      console.log(type);
      console.log(file);
    },
    // 获取数据 path当前路径对象、refresh是否需要更新数据
    fileSearch(path, refresh){

    },
    // 删除数据 data为要删除的数据
    fileDel(data){

    },
    // 为防止弹出框覆盖，应在接收到此函数时关闭外部页面上其他遮罩性的dom
    closeOtherLayout(fade){

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
