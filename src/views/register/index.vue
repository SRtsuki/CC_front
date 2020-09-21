<template>
  <div class="mx-center">
    <el-form ref="loginForm" :model="loginForm" :rules="rules" class="regist-container" label-position="left"
             label-width="0px" v-loading="loading">
      <h3 class="regist_title">用户注册</h3>
      <el-form-item prop="username">
        <el-input ref="account" type="string" v-model="loginForm.username"
                  auto-complete="off" placeholder="请输入学工号" clearable></el-input>
      </el-form-item>
      <el-form-item prop="nickname">
        <el-input ref="nickname" type="string" v-model="loginForm.nickname"
                  auto-complete="off" placeholder="请输入真实姓名" clearable></el-input>
      </el-form-item>
      <el-form-item prop="email">
        <el-input type="string" v-model="loginForm.email"
                  auto-complete="off" placeholder="请输入邮箱"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input ref="password" type="password" v-model="loginForm.password"
                  auto-complete="off" placeholder="请输入密码" :show-password="true" ></el-input>
      </el-form-item>
      <el-form-item prop="passwordag">
        <el-input type="password" v-model="loginForm.passwordag"
                  auto-complete="off" placeholder="请重复密码" :show-password="true" ></el-input>
      </el-form-item>
      <el-form-item class="regist-agre-item" prop="argement">
        <el-checkbox v-model="loginForm.argement">
          同意
        </el-checkbox>
        <span class="agreement">《注册协议》</span>
      </el-form-item>
      <el-form-item style="width: 100%">
        <el-button type="primary" class="register-button" @click="handleValidateForm" :disabled="!loginForm.argement">立即注册</el-button>
      </el-form-item>
      <el-form-item>
        <router-link to="/login">去登录</router-link>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import crypto from 'crypto-js'

export default {
  name: 'index.vue',
  data() {
    const checkUsername = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请正确填写学工号'));
      } else {
        if (value !== '') {
          var reg=/^[A-Za-z0-9][a-zA-Z0-9_]*/;
          if(!reg.test(value)){
            callback(new Error('请输入正确的学工号'));
          }
        }
        callback();
      }
    };
    const checkPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.loginForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    };
    const checkEmail = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请正确填写邮箱'));
      } else {
        if (value !== '') {
          var reg=/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
          if(!reg.test(value)){
            callback(new Error('请输入有效的邮箱'));
          }
        }
        callback();
      }
    };
    const rules = {
      username: [{required: true, message: '请输入学工号', trigger: 'blur'},
        { validator: checkUsername, trigger: 'blur'}],
      nickname: [{required: true, message: '请输入真实姓名', trigger: 'blur'}],
      password: [{required: true, message: '请输入密码', trigger: 'blur'}],
      email: [{required: true, message: '请输入邮箱', trigger: 'blur'},
        { validator: checkEmail, trigger: 'blur'}],
      passwordag: [{required: true, message: '请再次输入密码', trigger: 'blur'},
        { validator: checkPassword, trigger: 'blur' }],
    };
    return {
      rules: rules,
      checked: true,
      loginForm: {
        type: 'student',
        username: '',
        email: '',
        password: '',
        passwordag: '',
        argement: false,
        nickname: ''
      },
      loading: false,
    }
  },
  computed:{},
  mounted () {
    // 自动聚焦
    const usernameRef = this.$refs.account
    const passwordRef = this.$refs.password
    if (!this.loginForm.username) {
      usernameRef.focus()
    } else if (!this.loginForm.password) {
      passwordRef.focus()
    }
    // 监听enter事件
    window.addEventListener('keyup', this.handleListenKeyup)
  },
  methods: {
    async clickRegister(e) {
      e.preventDefault();
      const params = {
        username: this.loginForm.username,
        nickname: this.loginForm.nickname,
        email: this.loginForm.email,
        password: crypto.MD5(this.loginForm.password).toString()
      }
      this.loading = true
      // vuex dispatch => /store/modules/user.js
      this.$store.dispatch('user/register', params).then(() => {
        this.loading = false;
        this.$message.success(`注册成功`)
        this.loginForm = {}
        //跳转登录
        setTimeout(()=>{this.$router.push({ path: this.redirect || '/login' });},1000);
      }).catch(err => {
        this.loading = false;
        this.loginForm.password = '';
        this.loginForm.passwordag = '';
        this.loginForm.argement = false;
        this.$message.error('服务器异常:' + err);
      })
    },
    // 监听页面enter事件
    handleListenKeyup (e) {
      if (e.keyCode === 13) {
        this.handleValidateForm(e)
      }
    },
    // 表单校验
    handleValidateForm (e) {
      if (this.loading) {
        return false
      }
      this.$refs['loginForm'].validate((valid) => {
        if (valid) {
          this.clickRegister(e);
        }
      })
    },
  },
  beforeDestroy () {
    window.removeEventListener('keyup', this.handleListenKeyup)
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/common.sass";

.regist-container {
  border-radius: 15px;
  background-clip: padding-box;
  margin: 60px auto;
  width: 450px;
  padding: 35px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
  .register-button {
    width: 100%;
  }
  a {
    color: $font-four-color;
  }
}

.regist_title {
  margin: 0px auto 40px auto;
  text-align: center;
  color: #505458;
}

.agreement {
  color: #37f;
  cursor: pointer;
  >>> .el-checkbox__label{
    color: #9199a1!important;
  }
}

</style>
