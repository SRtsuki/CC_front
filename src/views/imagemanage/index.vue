<template>
  <div style="padding:30px;">

    <!--    课程切换    -->
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
    <!--    课程切换 结束    -->

    <el-alert :closable="false" title="镜像管理" />

    <el-main>
      <div class="handle-box">
        <!--搜索镜像-->
        <!-- <el-input
          v-model="select_userImage"
          placeholder="输入镜像名称"
          class="handle-input mr10"
        ></el-input>
        <el-button type="primary" icon="el-icon-search" @click="searhImage"
          >搜索</el-button
        > -->
        <!-- 添加镜像 -->
        <el-button type="primary" @click="dialogVisible = true">添加镜像</el-button>
      </div>

      <!-- 镜像列表 -->
      <el-table :data="imageList" style="width: 100%">
        <el-table-column label="镜像名称" prop="name"></el-table-column>
        <el-table-column label="镜像标签">
          <template slot-scope="scope">
            <div slot="reference" class="name-wrapper">
              <el-tag size="medium">{{ scope.row.tag }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <!-- <el-table-column label="镜像大小" prop="size"> </el-table-column> -->
        <!-- <el-table-column label="所属用户" prop="username"> </el-table-column> -->
        <!-- <el-table-column label="是否公开" prop="hasOpen"> </el-table-column> -->
        <!-- <el-table-column label="上传时间" prop="createDate"> </el-table-column> -->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click="deleteImage(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <div class="pagination">
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page.sync="pageInfo.pagenum"
          :page-size="pageInfo.pagesize"
          layout="prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>

      <!--上传镜像的模态框-->
      <el-dialog title="上传镜像" :visible.sync="dialogVisible" width="30%">
        <el-form>
          <el-form-item label="镜像地址">
            <el-input v-model="imageUpload.name"></el-input>
          </el-form-item>
          <el-form-item label="标签">
            <el-input v-model="imageUpload.tag"></el-input>
          </el-form-item>
        </el-form>
        <!-- 进度条 -->
        <div v-show="progressFlag">
          <el-progress type="circle" :percentage="percentage"></el-progress>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="postImage"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </el-main>
  </div>
</template>

<script>

import { getImageList, postImage, deleteImage } from "../../api/image"

export default {
  name: "ImageManage",
  data() {
    return {
			// 课程ID
      cid: 0, 
      // 课程信息
      courseInfo: {},
      // 镜像列表
      imageList: [],
      // 用户分页当前页码
      pageInfo: {
				pagenum: 1,
				pagesize: 10
			},
      // 镜像列表总的条数
      total: 0,
			// 添加镜像diaglog
			dialogVisible: false,
			// 添加镜像详情
      imageUpload: {
        name: "",
        tag: "",
      },
      // 添加镜像的进度条
      progressFlag: false,
      percentage: 0,
    };
  },
  methods: {
    // 课程跳转
    onCourseClick(row){
      this.$store.dispatch('course/changeSetting', {
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

		// 上传镜像
		async postImage() {
			if (this.imageUpload.name == '') {
				this.$message({
          message: "请输入镜像地址",
          type: "error",
				});
				return
			}

			let data = {
				cid: this.cid,
				name: this.imageUpload.name,
				tag: this.imageUpload.tag
      }

      this.progressFlag = true
      let interval = window.setInterval(() => {
        if (this.percentage >= 99) {
          this.percentage += 0.01
        } else if (this.percentage >= 90) {
          this.percentage += 1
        } else if (this.percentage >= 60) {
          this.percentage += 5
        } else {
          this.percentage += 15
        }
      }, 1000);

			const res = await postImage(data)
      this.percentage = 100
      window.clearInterval(interval)

      const delay = t =>  new Promise(resolve => setTimeout(resolve, t))
      await delay(1000)

			if (res.code != 0) {
				this.$message({
          message: "上传镜像失败:" + res.msg,
          type: "error",
				});
			} else {
        this.$message({
          message: "上传成功",
          type: "success",
				});
			  // 上传成功后，重新获取镜像列表
			  this.getImageList()
      }

      this.imageUpload.name = ''
			this.imageUpload.tag = ''
      this.dialogVisible = false
      this.progressFlag = false
      this.percentage = 0
		},

		// 获取镜像列表
    async getImageList() {

			let data = {
				cid: this.cid,
				pagenum: this.pageInfo.pagenum,
				pagesize: this.pageInfo.pagesize
			}

			const res = await getImageList(data)
      // console.log(res)
      
			if (res.code != 0) {
				this.$message({
          message: "获取镜像列表失败：" + res.msg,
          type: "error",
        });
			} 

			this.total = res.total
			this.imageList = res.data
    },

		// 删除镜像
		async deleteImage(row) {
      // console.log(row)

      const confirmRes = await this.$confirm(
        "此操作将删除镜像, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmRes != "confirm") {
        return;
      }
      
      let data = {
        cid: this.cid,
        id: row.ID,
      }

			const res = await deleteImage(data)

      if (res.code != 0) {
        this.$message({
          message: "删除失败：" + res.msg,
          type: "error",
        });
        return 
      }

      // 重新获取镜像列表
      this.getImageList()
		},

    // 
    handleCurrentChange(newPage) {
      this.pageInfo.pagenum = newPage;
      this.getImageList();
    },

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
  },
  created() {
    // 获取课程信息
    this.$store.dispatch('course/getCourseInfo', parseInt(this.$route.params.cid)).then( data => {
      this.courseInfo = data;
    }).catch(err=>{
      this.$message.error("服务器错误：" + err);
    });

    // 获取cid
    this.cid = parseInt(this.$route.params.cid) 

    // 获取所有镜像列表
		this.getImageList()
  },
};
</script>

<style lang="scss" scoped>
@import "src/styles/common";

.el-main {
  background: #f4f4f5;
  margin-top: 15px;
}


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
</style>
