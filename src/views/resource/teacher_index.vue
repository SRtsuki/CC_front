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
      <el-button @click="handleShowUpload">上传文件</el-button>
      <el-button @click="handleFileDownload">下载文件</el-button>
    </el-card>

    <el-dialog class="resource-operate-dialog" title="上传文件" :visible.sync="dialogUploadTableVisible">
      <!--   todo:   文件重复检查-->
      <el-upload
        class="file-upload"
        drag
        :action="uploadUrl"
        :headers="uploadHeaders"
        :data="uploadOptions"
        :with-credentials=false
        :show-file-list=true
        :multiple=false
        :on-success="getFileList"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
<!--        <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>-->
      </el-upload>
    </el-dialog>

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

<!--    :upload-options="uploadOptions"-->
<!--    :upload-headers="uploadHeaders"-->
<!--    :upload-url="uploadUrl"-->
<!--    @uploadBefore="handleUploadBefore"-->
<!--    @upload="handleUpload"-->
<!--    <wlExplorer-->
<!--      ref="wl-explorer-cpt"-->
<!--      :headerDropdown="headerHandle"-->
<!--      :columns="file_table_columns"-->
<!--      :all-path="all_folder_list"-->
<!--      :is-folder-fn="isFolderFn"-->
<!--      :useUpload="false"-->
<!--      :folderType="rource_type"-->
<!--      :data="file_table_data"-->
<!--      :props="explorer_prop"-->
<!--      size="big"-->
<!--      @handleFolder="handleFolder"-->

<!--      @search="fileSearch"-->
<!--      @del="fileDel"-->
<!--      @closeFade="closeOtherLayout(fade)"-->
<!--    >-->
<!--    </wlExplorer>-->
  </div>
</template>

<script>
import Vue from 'vue'
import wlExplorer from "wl-explorer";
import wl from "wl-vue-select";
import "wl-vue-select/lib/wl-vue-select.css"
import "wl-explorer/lib/wl-explorer.css"
import store from "@/store";
import {downloadStaticFileByBlob, getCoursefileList} from "@/api/coursefile";
import {BASE_URL} from "@/api/config";

Vue.use(wlExplorer);
Vue.use(wl);

export default {
  name: "teacher_index.vue",
  data(){
    const _GB = 1024 * 1024;
    return {
      // 获取到的课程信息
      courseInfo: '',
      // 文件浏览器数据
      // 文件列表数据
      file_table_data:[],
      // 文件列表表头数据
      file_table_columns: [
        {
          label: "名称",
          prop: "name",
          minWidth: 120
        },
        // {
        //   label: "修改日期",
        //   align: "center",
        //   width: 120,
        //   formatter(row) {
        //     return row.EditTime.split("T")[0] || "-";
        //   }
        // },
        // {
        //   label: "类型",
        //   align: "center",
        //   width: 90,
        //   formatter(row) {
        //     return row.Type === 1 ? "文件夹" : row.SuffixName;
        //   }
        // },
        // {
        //   label: "大小",
        //   minWidth: 90,
        //   align: "center",
        //   formatter(row) {
        //     if (row.Size === null) return "-";
        //     if (row.Size < 1024) {
        //       // 1024以下显示kb
        //       return row.Size + "KB";
        //     }
        //     if (row.Size < _GB) {
        //       // 1024*1024
        //       let _mb = (row.Size / 1024).toFixed(2);
        //       return parseFloat(_mb) + "MB";
        //     }
        //     let _gb = (row.Size / _GB).toFixed(2);
        //     return parseFloat(_gb) + "GB";
        //   }
        // },
        // {
        //   label: "创建日期",
        //   align: "center",
        //   width: 120,
        //   formatter(row) {
        //     return row.CreateTime.split("T")[0] || "-";
        //   }
        // },
        // {
        //   label: "作者",
        //   minWidth: 100,
        //   align: "center",
        //   formatter(row) {
        //     return row.CreateUserName || "-";
        //   }
        // },
        // {
        //   label: "描述",
        //   minWidth: 100,
        //   formatter(row) {
        //     return row.Describe || "-";
        //   }
        // }
      ], // 自定义表格列
      // 所有文件路径列表,用于快速访问、移动、上传、新建
      all_folder_list: [],
      tree_folder_list: [], // 树形文件夹列表
      type: {
        folder: 1,
        img: 2,
        video: 3,
        other: 4
      }, // 文件类型
      // 文件浏览器配置项
      explorer_prop: {
        name: "Name",
        match: "Name",
        splic: true,
        suffix: "SuffixName",
        pathId: "Id",
        pathPid: "ParentId",
        pathName: "Name",
        pathChildren: "Children", // String 路径数据 children字段
        pathConnector: "\\", // String 路径父子数据拼接连接符,默认为'\'
        pathParents: "Parents", // String 路径数据所有直系祖先节点自增长identityId逗号拼接
        pathIdentityId: "IdentityId" // String 路径数据自增长id
      }, // 文件管理器配置项
      // 头部更多操作自定义菜单
      headerHandle: [],
      rource_type: {
        self: 1 // 自建
      }, // 数据来源类型
      load: {
        folder: false
      }, // loading管理
      fade: {
        folder: false
      }, // 弹出类视图管理
      path: {}, // 路径数据
      folder_form: {
        ParentId: "",
        Name: "",
        preview: [],
        handle: []
      }, // 文件夹表单
      folder_rules: {
        Name: [{ required: true, message: "请填写文件夹名称", trigger: "blur" }]
      }, // 文件夹表单验证
      child_act_saved: {}, // 存储子组件数据，用于编辑更新
      tree_select_prop: {
        label: "Name",
        children: "Children"
      }, // 树形下拉框配置项
      uploadOptions: {
        cid: parseInt(this.$route.params.cid),
      }, // 上传文件附加参数
      uploadHeaders: {
        authorization: this.$store.getters.token,
      },
      uploadUrl:BASE_URL + "coursefile/createfile",
      dialogUploadTableVisible: false,
      resourceListCardBodyStyle: {
        width: '100%'
      },
      multipleFileSelection: []
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

    // 装载测试数据
    this.getAllFolders();
    this.getFileList();
    // this.file_table_data = fileList;
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
    //
    handleFileSelectionChange(val){
      this.multipleFileSelection = val;
    },
    // 判断row是否为文件夹
    isFolderFn(row){
      return row.Type === this.type.folder;
    },
    // 文件夹新增或编辑处理 act当前选择文件夹、type类型edit/add、file当前的路径信息
    handleFolder(act, type, file){
      this.path = file;
      this.fade.folder = true;
      if (type === "add") {
        this.$nextTick(() => {
          this.$refs["folder_form"].resetFields();
        });
        this.folder_form.Id = "";
        this.folder_form.ParentId = file.id;
        return;
      }
      this.child_act_saved = act;
      this.folder_form = { ...act };
    },
    // 获取文件夹列表
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
    // 获取所有文件夹
    getAllFolders() {
      this.all_folder_list = [];
      let _list = [...this.all_folder_list];
      let options = {
        id: this.explorer_prop.pathId,
        pid: this.explorer_prop.pathPid,
        children: "Children"
      };
      this.tree_folder_list = this.arrayToTree(_list, options);
      // console.log("==============================")
      // console.log(this.tree_folder_list)
    },
    // 根据关键词搜索文件 file Object 文件属性、update Boolean 数据是否需要更新（不需要表示已存在）
    fileSearch(file, update){
      if (update) {
        this.path = file;
        this.getFileList();
      }
    },
    // 删除数据 data为要删除的数据
    fileDel(data){

    },
    // 为防止弹出框覆盖，应在接收到此函数时关闭外部页面上其他遮罩性的dom
    closeOtherLayout(fade){

    },
    // 重写上传函数
    handleUploadBefore(file, path){
      console.log("============file, path==================")
      console.log(file, path);
    },
    handleUpload(path, cb){
      console.log("===============path===============")
      console.log(path);
      cb();
    },
    handleShowUpload(){
      this.dialogUploadTableVisible = true;
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
    arrayToTree(
      array = [],
      options = { id: "id", pid: "pid", children: "children" },
    ) {
      let array_ = []; // 创建储存剔除叶子节点后的骨架节点数组
      let unique = {}; // 创建盒子辅助本轮children合并去重
      let root_pid = [
        0,
        "0",
        undefined,
        "undefined",
        null,
        "null",
        "00000000-0000-0000-0000-000000000000"
      ]; // 可能存在的根节点pid形式
      array.forEach(item => {
        // 筛选可以插入当前节点的所有子节点
        let children_array = array.filter(
          it => it[options.pid] === item[options.id]
        );
        if (item[options.children] && item[options.children] instanceof Array && item[options.children].length > 0) {
          // 去重合并数组
          item[options.children].map(i => (unique[i[options.id]] = 1));
          item[options.children].push(
            ...children_array.filter(i => unique[i[options.id]] !== 1)
          );
        } else {
          item[options.children] = children_array;
        }
        // 当children_array有数据时插入下一轮array_，当无数据时将最后留下来的根节点树形插入数组
        let has_children = children_array.length > 0;
        if (
          has_children ||
          (!has_children && root_pid.includes(item[options.pid]))
        ) {
          array_.push(item);
        }
      });
      // 当数组内仅有根节点时退出，否组继续处理 最终递归深度次
      if (!array_.every(item => root_pid.includes(item[options.pid]))) {
        return this.arrayToTree(array_, options);
      } else {
        return array_;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "src/styles/common";

.resource-title-card {
  width: 98%;
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

.resource-operate-dialog {
  align-items: center;
  /deep/ .el-upload {
      width: 100%;
      /deep/ .el-upload-dragger {
        width: 100%;
      }
  }
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

.wl-explorer {
  min-height: calc(100vh - 200px);
  margin-top: 20px;
}

///deep/ .wl-header-btn {
//  display:none
//}

/deep/ .wl-header-file {
  display:none
}
</style>
