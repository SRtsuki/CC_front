<template>
  <div class="app-container">
    <el-card class="container-title-card">
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

    <el-card class="container-control-bar">
      <el-button type="primary" @click="handleCreateContainer">创建容器</el-button>
      <el-button @click="handleAllocateContainer">分配容器</el-button>
      <el-button type="danger" @click="handleDeleteContainer">删除容器</el-button>
    </el-card>

    <!--容器创建-->
    <el-dialog class="container-create-dialog" title="批量创建实验容器" :visible.sync="dialogCreateTableVisible">
      <el-form
        :v-loading="containerCreateForm.loading"
        ref="container-create-form"
        :rules="rules"
        :model="containerCreateForm"
        label-width="100px"
      >
        <el-form-item label="选用镜像" prop="image">
          <el-autocomplete
            class="el-input"
            v-model="containerCreateForm.image"
            :fetch-suggestions="queryOptionalImage"
            placeholder="镜像格式：imagename:tag"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="环境参数">
          <el-input
            v-model="containerCreateForm.env"
            :placeholder="containerCreateForm.envPlaceHolder"
          ></el-input>
        </el-form-item>
        <el-form-item label="端口绑定">
          <el-input
            v-model="containerCreateForm.port"
            placeholder="端口暴露,为0时不绑定端口"
          ></el-input>
        </el-form-item>
        <el-form-item label="创建数量" prop="num">
          <el-input-number
            v-model="containerCreateForm.num"
            :min="1"
            :max="200"
            :step="1"
            step-strictly
          ></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onCreateContainerSubmit">{{containerCreateForm.submitText}}</el-button>
          <el-button @click="onCreateContainerCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!--    容器分配    -->
    <el-dialog class="container-allocate-dialog" title="实验容器分配" :visible.sync="dialogAllocateTableVisible">
      <el-form :v-loading="containerAllocateForm.loading" ref="container-allocate-form" :rules="rules" :model="containerAllocateForm" label-width="120px">
        <el-form-item
          v-for="(container, index) in containerAllocateForm.containers"
          :label="'容器ID：' + container.containerid"
          :key="container.containerid"
          :prop="'containers.' + index + '.username'"
          :rules="{required: true, message: '请填写该容器分配给的用户学工号', trigger: 'change'}"
        >
          <el-row>
            <el-col :span="10">
              <el-autocomplete
                class="el-input"
                v-model="container.username"
                :fetch-suggestions="queryNoContainerUserList"
                placeholder="请输入用户学工号"
                @input="handleUsernameInput"
              ></el-autocomplete>
            </el-col>
            <el-col :span="9">
              <span v-if="container.response === containerAllocateForm.response.pending">{{container.nickname}}&nbsp;</span>
              <span v-else-if="container.response === containerAllocateForm.response.success" class="span-on-success">分配成功</span>
              <span v-else class="span-on-failed">分配失败</span>
            </el-col>
            <el-col :span="1">
              <el-button @click.prevent="removeContainer(container)">取消分配此容器</el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onAllocateContainerSubmit">提交分配信息</el-button>
          <el-button @click="onAllocateContainerCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-card class="container-list" :body-style="containerListCardBodyStyle">
<!--  todo    :data="tableData.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"-->
      <el-table class="container-list-table"
                :data="courseContainerList"
                @selection-change="handleContainerSelectionChange"
                @row-click="handleOpenStatus"
                :v-loading="courseListLoading"
      >
        <el-table-column
          type="selection"
          width="55"
        >
        </el-table-column>
        <el-table-column
          label="容器ID"
          prop="ID"
          width="100">
        </el-table-column>
        <el-table-column
          label="容器状态"
          width="100">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.tagType"
              effect="dark">
              {{ scope.row.state }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="所属用户ID"
          prop="uid"
          width="100"
          >
        </el-table-column>
        <el-table-column
          label="学工号"
          prop="username"
          width="160"
          >
        </el-table-column>
        <el-table-column
          label="姓名"
          prop="nickname"
          >
        </el-table-column>
        <el-table-column
          label="端口暴露"
          prop="port"
          width="100">
        </el-table-column>
        <el-table-column
          label="外网端口"
          prop="portbind"
          width="100">
        </el-table-column>
        <el-table-column
          label="终端访问"
          width="100">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click="handleJumpToTerminal(scope.row.ID)"
            >跳转终端</el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="创建日期"
          prop="CreatedAt"
          width="300">
        </el-table-column>
      </el-table>
    </el-card>

<!--    :before-close="handleClose"-->
    <el-drawer
      class="container-status-drawer"
      :withHeader=false
      :destroy-on-close=true
      :visible.sync="containerDrawerVisiable"
      size="20%"
      direction="rtl"
      @opened="initStatusDrawer"
      @close="onStatusDrawerClose"
    >
      <div class="container-detail-drawer-container">
        <h3>容器实时监控</h3>
        <el-row class="container-detail-table-head">
          <p>基本信息</p>
          <el-button @click="handleJumpToTerminal(statusDrawer.containerID)" size="mini" plain>远程连接</el-button>
        </el-row>
        <el-row>
          <span>容器ID：</span>{{statusDrawer.containerID}}
        </el-row>
        <el-row>
          <span>所属用户：</span>{{statusDrawer.username}}
        </el-row>
        <el-row>
          <span>容器状态：</span>{{statusDrawer.state}}
        </el-row>
        <el-row>
          <span>总内存：</span>{{statusDrawer.totalMemory}}MB
        </el-row>
        <el-row>
          <span>内部端口：</span>{{statusDrawer.port}}
        </el-row>
        <el-row>
          <span>外部绑定端口：</span>{{statusDrawer.portbind}}
        </el-row>
      </div>
      <div class="container-status-drawer-container">
        <div id="echarts-realtime-use" class="echarts-realtime-graph"></div>
      </div>
    </el-drawer>

  </div>
</template>

<script>
import store from "@/store";
import {getImageList} from "@/api/images";
import {
  allocateContainer,
  createContainers,
  deleteContainer,
  getContainerStatus,
  getMyContainerList
} from "@/api/container";
import {getStudentList} from "@/api/student";
import {debounce} from "@/utils/debounce";
// 引入 ECharts 主模块
const echarts = require('echarts/lib/echarts')
// 引入折线图
require('echarts/lib/chart/line');
// 引入提示框和标题组件
require('echarts/lib/component/tooltip');
require('echarts/lib/component/title');

export default {
  name: "teacher_index.vue",
  data() {
    return {
      // 获取到的课程信息
      courseInfo: '',
      // 备选镜像列表
      optionalImageList: [],
      // 容器创建dialog
      dialogCreateTableVisible: false,
      // 容器创建表单
      containerCreateForm: {
        loading: false,
        image: "",
        env: "",
        envPlaceHolder: "例如：mysql [\"MYSQL_ROOT_PASSWORD=@buaa21\"]",
        port: 0,
        num: 1,
        submitText: "立即创建"
      },
      // 校验规则
      rules : {
        image: [
          { required: true, message: '请输入选用的镜像名', trigger: 'change' },
        ],
        num: [
          { required: true, message: '请输入创建容器数量', trigger: 'blur' },
        ]
      },
      containerListCardBodyStyle: {
        width: '100%'
      },
      // 容器列表
      courseContainerList: [],
      courseListLoading: false,
      // 容器tag映射
      containerTag:{
        created: '',
        running: 'success',
        paused: 'info',
        restarting: 'warning',
        removing: 'info',
        exited: 'warning',
        dead: 'danger',
      },
      // 容器多选器
      containerMultipleSelection: [],
      // 容器分配dialog
      dialogAllocateTableVisible: false,
      // 容器分配表单
      containerAllocateForm: {
        loading: false,
        containers: [],
        response: {
          pending: 1,
          success: 2,
          fail: 3
        }
      },
      // 课程用户列表
      courseUserList: [],
      // 未分配用户列表
      courseNoContainerUserList: [],
      // 容器详情drawer
      containerDrawerVisiable: false,
      // 容情详情参数
      statusDrawer:{
        containerID: null,
        username: null,
        state: null,
        totalMemory: null,
        port: null,
        portbind: null,
        interval: null
      },
      // 容器详情实时数据
      statusRealtimeData: []
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
    this.courseListLoading = true;
    // 获取容器列表
    getMyContainerList({cid:parseInt(this.$route.params.cid)}).then(res => {
      let listData = [];
      if (res.code === 0){
        listData = res.data;
        for (let i = 0; i< res.data.length; i++ ){
          listData[i].CreatedAt = res.data[i].CreatedAt.substr(0,10) + ' ' + res.data[i].CreatedAt.substr(11,8);
          listData[i].tagType = this.containerTag[res.data[i].state];
        }
        // 然后获取课程用户列表
        getStudentList({ id:parseInt(this.$route.params.cid)}).then(stures => {
          if (stures.code === 0){
            this.courseUserList = stures.data;
            for (let j = 0; j < listData.length; j++){
              if (listData[j].uid === 0 ){
                listData[j].uid = "未分配"
                listData[j].username = "-"
                listData[j].nickname = "-"
              } else {
                let uindex = this.courseUserList.findIndex(user => {
                  return user.ID === listData[j].uid;
                })
                listData[j].username = this.courseUserList[uindex].username;
                listData[j].nickname = this.courseUserList[uindex].nickname;
                this.courseUserList[uindex].allocate = true;
              }
            }
            // 生成未分配用户列表
            setTimeout(()=>{
              this.courseContainerList = listData;
              this.courseListLoading = false;
              this.updateNoContainerList();
            }, 500)
          } else {
            this.$message.error("获取用户列表错误:" + stures.msg);
          }
        }).catch(err => {
          this.$message.error("获取用户列表错误：" + err);
        })
      } else {
        this.$message.error("获取容器列表错误：" + res.msg);
      }
    }).catch(err => {
      this.$message.error("获取容器列表错误：" + err);
    });
    // 获取可选的镜像列表
    getImageList({cid:parseInt(this.$route.params.cid)}).then(res => {
      if (res.code === 0){
        this.optionalImageList = res.data;
      } else {
        this.$message.error("获取备选镜像列表错误：" + res.msg);
      }
    }).catch(err => {
      this.$message.error("获取备选镜像列表错误：" + err);
    })
  },
  mounted() {
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
    // 显示容器创建dialog
    handleCreateContainer(){
      this.dialogCreateTableVisible = true;
    },
    // 显示容器分配dialog
    handleAllocateContainer(){
      this.dialogAllocateTableVisible = true;
    },
    // 显示容器状态抽屉
    handleOpenStatus(row, column, event){
      if (this.statusDrawer.interval) {
        clearInterval(this.statusDrawer.interval)
      }
      this.statusDrawer = {}
      // 获取容器信息
      getContainerStatus({
        id: row.ID
      }).then(res => {
        if (res.code === 0){
          let data = {};
          data.containerID = row.ID;
          data.username = row.username;
          data.state = row.state;
          data.totalMemory = parseInt(res.data.memlimit / 1048576);
          data.port = row.port;
          data.portbind = row.portbind;
          this.statusDrawer = data;
          this.containerDrawerVisiable = true;
          // 设置实时统计初始值
          setTimeout(()=>{
            res.data.time = new Date().getTime();
            res.data.mem = (parseFloat(res.data.memuse * 100) / res.data.memlimit).toFixed(4);
            res.data.cpu = (parseFloat(res.data.cpu)*100).toFixed(4);
            this.statusRealtimeData.push(res.data);
          }, 1000)
          this.statusDrawer.interval = setInterval(()=>{
            getContainerStatus({
              id: row.ID
            }).then(res => {
              if (res.code === 0){
                res.data.time = new Date().getTime();
                res.data.mem = (parseFloat(res.data.memuse * 100) / res.data.memlimit).toFixed(4);
                res.data.cpu = (parseFloat(res.data.cpu)*100).toFixed(4);
                this.statusRealtimeData.push(res.data);
              } else {
                console.error("获取实时数据失败" + res.msg);
              }
            }).catch(err => {
              console.error("获取实时数据失败" + err);
            })
          },10000);
        } else {
          this.$message.error("获取容器信息失败:" + res.msg)
        }
      }).catch(err => {
        this.$message.error("获取容器信息失败:" + err)
      })
    },
    // 关闭容器创建dialog
    onCreateContainerCancel(){
      this.dialogCreateTableVisible = false;
    },
    // 关闭容器分配dialog
    onAllocateContainerCancel(){
      this.dialogAllocateTableVisible = false;
    },
    // 展示备选镜像
    queryOptionalImage(queryString, cb) {
      let data = [];
      for (let i =0; i < this.optionalImageList.length; i++) {
        data.push({
          value: this.optionalImageList[i].name + ':' + this.optionalImageList[i].tag
        });
      }
      cb(data);
    },
    checkStringWithcolon(string){
      try {
        let reg = /^[\s\S]*[:][\s\S]*$/;
        return reg.test(string);
      } catch (e) {
        this.$message.error("checkfailed: " + e)
      }
    },
    // 容器创建
    onCreateContainerSubmit(){
      this.$refs['container-create-form'].validate((valid) => {
        if (valid) {
          try {
            this.containerCreateForm.submitText = "创建中…"
            let data = {
              cid: parseInt(this.$route.params.cid),
              image : this.checkStringWithcolon(this.containerCreateForm.image)? this.containerCreateForm.image: this.containerCreateForm.image + ":latest",
              env : [...this.containerCreateForm.env], // 环境参数，比如mysql ["MYSQL_ROOT_PASSWORD=@buaa21"]
              port : parseInt(this.containerCreateForm.port), // docker暴露的端口 为0时不绑定
              num : this.containerCreateForm.num //创建的镜像数
            }
            // console.log("check passed:" + data.image);
            this.containerCreateForm.loading = true;
            createContainers(data).then(res => {
              this.containerCreateForm.submitText = "立即创建"
              if (res.code === 0){
                this.containerCreateForm.loading = false;
                this.dialogCreateTableVisible = false;
                this.$message.success("成功创建" + res.data + "个容器");
                this.$refs['container-create-form'].resetFields();
                this.updateContainerList();
              } else {
                this.$message.error("服务器错误：" + res.msg);
              }
            }).catch(err => {
              this.containerCreateForm.submitText = "立即创建"
              this.$message.error("服务器错误：" + err);
            })
          } catch (e) {
            this.$message.error("createfailed: " + e);
            this.containerCreateForm.submitText = "立即创建"
            this.updateContainerList();
          }
        } else {
          return false;
        }
      });
    },
    // 容器多选变更
    handleContainerSelectionChange(val){
      this.containerMultipleSelection = val;
      // 筛选可分配容器
      this.containerAllocateForm.containers = [];
      for (let i =0; i < this.containerMultipleSelection.length; i++){
        if (this.containerMultipleSelection[i].uid === "未分配"){
          this.containerAllocateForm.containers.push({
            uid: '',
            username: '',
            nickname: '',
            containerid: this.containerMultipleSelection[i].ID,
            response: this.containerAllocateForm.response.pending,
          });
        }
      }
    },
    // 更新未分配学生列表
    updateNoContainerList(){
      let data = [];
      for (let i = 0; i < this.courseUserList.length; i++){
        if (!this.courseUserList[i].allocate || this.courseUserList[i].allocate === false){
          data.push({
            username: this.courseUserList[i].username,
            nickname: this.courseUserList[i].nickname,
            id: this.courseUserList[i].ID
        });
        }
      }
      this.courseNoContainerUserList = data;
    },
    // 取消容器备选
    removeContainer(container){
      let index = this.containerAllocateForm.containers.indexOf(container)
      if (index !== -1) {
        this.containerAllocateForm.containers.splice(index, 1)
      }
    },
    // 获取未分配学生列表
    queryNoContainerUserList(queryString, cb) {
      let data = [];
      for (let i =0; i < this.courseNoContainerUserList.length; i++) {
        data.push({
          value: this.courseNoContainerUserList[i].username
        });
      }
      cb(data);
    },
    // 实时计算uid及nickname
    handleUsernameInput:debounce(function ()
    {
      console.log("computing!");
      // todo 设置计算标记？
      for (let i = 0; i <this.containerAllocateForm.containers.length; i++){
        if (this.containerAllocateForm.containers[i] && this.containerAllocateForm.containers[i].username) {
          //获取搜素结果
          let index = this.courseUserList.findIndex(user => {
            return user.username === this.containerAllocateForm.containers[i].username;
          });
          console.log("index:" + index)
          if (index !== -1) {
            this.containerAllocateForm.containers[i].nickname = this.courseUserList[index].nickname;
            this.containerAllocateForm.containers[i].uid = this.courseUserList[index].ID;
          } else {
            this.containerAllocateForm.containers[i].nickname = "请输入加入本课程的用户学工号！";
            this.containerAllocateForm.containers[i].uid = '';
          }
          console.log("finish update!");
        } else {
          return false
        }
      }
    }, 500),
    // 提交容器分配信息
    onAllocateContainerSubmit(){
      let count = this.containerAllocateForm.containers.length;
      let showindex = count;
      if (count !== 0){
        var interval = setInterval(()=> {
          count--;
          if (count < 0){
            clearInterval(interval);
            this.updateContainerList();
            setTimeout(()=>{
              this.dialogAllocateTableVisible = false;
            }, 500)
          } else {
            allocateContainer({
              cid: parseInt(this.$route.params.cid),
              uid: this.containerAllocateForm.containers[count].uid,
              containerid: this.containerAllocateForm.containers[count].containerid
            }).then(res=> {
              if (res.code === 0){
                this.containerAllocateForm.containers[--showindex].response = this.containerAllocateForm.response.success;
              } else {
                this.containerAllocateForm.containers[--showindex].response = this.containerAllocateForm.response.fail;
                this.$message.error("容器分配失败:" + res.msg);
              }
            }).catch(err => {
              this.$message.error("容器分配失败:" + err);
            })
          }
        }, 200)
      } else {
        this.dialogAllocateTableVisible = false;
      }
    },
    // 容器删除
    handleDeleteContainer(){
      if (this.containerMultipleSelection.length !== 0){
        let containerToDelList = "";
        for (let i = 0;i < this.containerMultipleSelection.length; i++){
          containerToDelList += (this.containerMultipleSelection[i].ID + ' ');
        }
        this.$confirm("此操作将永久删除容器 " + containerToDelList + " 是否继续?", '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let counter = this.containerMultipleSelection.length;
          let interval = setInterval(()=>{
            counter--
            if (counter < 0) {
              clearInterval(interval);
              setTimeout(()=>{
                this.$message({
                  type: 'success',
                  message: '删除成功!'
                });
                this.updateContainerList();
              }, 1000)
            } else {
              deleteContainer({
                containerid: this.containerMultipleSelection[counter].ID,
                cid: parseInt(this.$route.params.cid)
              }).then(res => {
                if (res.code !== 0 ){
                  this.$message.error("删除容器失败:" + res.msg)
                }
              }).catch(err =>{
                this.$message.error("删除容器失败:" + err)
              })
            }
          }, 200)
        }).catch(()=>{
          return false;
        })
      } else {
        return false;
      }
    },
    // 跳转至容器终端
    handleJumpToTerminal(containerID){
      let routerUrl = this.$router.resolve({
        path: "/terminal",
        query: {id: containerID}
      });
      window.open(routerUrl.href, "_blank");
    },
    // 更新容器列表信息
    updateContainerList(){
      // 重新获取list
      this.courseListLoading = true;
      getMyContainerList({cid:parseInt(this.$route.params.cid)}).then(res => {
        let listData = [];
        if (res.code === 0){
          listData = res.data;
          for (let i = 0; i< res.data.length; i++ ){
            listData[i].CreatedAt = res.data[i].CreatedAt.substr(0,10) + ' ' + res.data[i].CreatedAt.substr(11,8);
            listData[i].tagType = this.containerTag[res.data[i].state];
          }

          // 加入用户数据
          for (let j = 0; j < listData.length; j++){
            if (listData[j].uid === 0 ){
              listData[j].uid = "未分配"
              listData[j].username = "-"
              listData[j].nickname = "-"
            } else {
              let uindex = this.courseUserList.findIndex(user => {
                return user.ID === listData[j].uid;
              })
              listData[j].username = this.courseUserList[uindex].username;
              listData[j].nickname = this.courseUserList[uindex].nickname;
              this.courseUserList[uindex].allocate = true;
            }
          }
          // 生成未分配用户列表
          setTimeout(()=>{
            this.courseContainerList = listData;
            this.courseListLoading = false;
            this.updateNoContainerList();
          }, 500)
        } else {
          this.$message.error("获取容器列表错误：" + res.msg);
        }
      }).catch(err => {
        this.$message.error("获取容器列表错误：" + err);
      });
    },
    // 实时信息面板初始化
    initStatusDrawer(){
      // 初始化echarts
      this.initCharts();
    },
    // echarts初始化
    initCharts(){
      this.chart = echarts.init(document.getElementById('echarts-realtime-use'));
      this.setChartOptions();
    },
    setChartOptions(){
      this.chart.setOption({
        title: {
          text: '实时使用率',
          textStyle: {
            color: '#1c1f21'
          }
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: ['CPU使用率(%)', '内存使用率(%)']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'time'
        },
        yAxis: {
          type: 'value',
          scale: true,
          max: 100,
          min: 0,
        },
        series: []
      })
    },
    //实时信息面板关闭
    onStatusDrawerClose(){
      // 关闭定时器
      if (this.statusDrawer.interval) {
        clearInterval(this.statusDrawer.interval)
      }
      // 清除实时数据
      this.statusRealtimeData = [];
    }
  },
  watch: {
    statusRealtimeData(val) {
      // console.log("====================")
      // console.log(val);
      if (this.chart && val.length > 0 ){
        let cpudata = [];
        let memorydata = [];
        // 抛弃10分钟（超过60）的数据点
        for (let i = val.length > 60? val.length - 60: 0; i < val.length; i++) {
          cpudata.push([val[i].time, val[i].cpu]);
          memorydata.push([val[i].time, val[i].mem]);
        }
        this.chart.setOption({series: [
            {
              name: 'CPU使用率(%)',
              type: 'line',
              step: 'start',
              data: cpudata
            },
            {
              name: '内存使用率(%)',
              type: 'line',
              step: 'start',
              data: memorydata
            }
          ]});
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "src/styles/common";

  .container-title-card {
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

  .container-control-bar {
    width: 99%;
    margin: 20px auto;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-start;

  }

  .container-allocate-dialog {
    .el-col {
      padding-left: 10px;
      padding-right: 10px;
      .span-on-success {
        color: $theme-green-color;
      }
      .span-on-failed {
        color: $theme-red-color;
      }
    }
  }


  .container-list {
    width: 99%;
    margin: 20px auto;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    .container-list-table {
      width: 100%;
    }
  }

  .container-status-drawer{
    .container-detail-drawer-container {
      padding: 24px;
      h3 {
        margin-bottom: 20px;
        display: inline-block;
        font-size: 28px;
      }
      .container-detail-table-head {
        border-left-width: 5px !important;
        border-left-color: $border-first-color !important;
        border-top-style: solid !important;
        background: $background-primary-color;
        padding: 8px 19px !important;
        line-height: 32px;
        display: flex;
        .el-button {
          align-self: end;
          margin-left: auto;
        }
      }
      .el-row {
        font-size: 14px;
        padding: 14px 20px;
        color: $font-second-color;
        border-style: none solid solid solid ;
        border-width: 1px;
        border-color: $border-three-color;
        span {
          color: $font-four-color;
        }
      }
    }

    .container-status-drawer-container {
      padding: 24px;
      .echarts-realtime-graph {
        margin: auto;
        height: calc(18vw * 0.66);
        width: 18vw;
      }
    }
  }
</style>
