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
  getContainerStatus,
  getMyContainerList
} from "@/api/container";
import {debounce} from "@/utils/debounce";
import {getStudentList} from "@/api/student";
// 引入 ECharts 主模块
const echarts = require('echarts/lib/echarts')
// 引入折线图
require('echarts/lib/chart/line');
// 引入提示框和标题组件
require('echarts/lib/component/tooltip');
require('echarts/lib/component/title');

export default {
  name: "student_index.vue",
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
    // 容器多选变更
    handleContainerSelectionChange(val){
      this.containerMultipleSelection = val;
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
          setTimeout(()=>{
            this.courseContainerList = listData;
            this.courseListLoading = false;
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
