<template>
  <el-container class="login-container">
    <el-header class="login-header">
      <router-link style="margin: auto;" to="/">
        <!--        <img src="/static/logo/logo.png" height="72" alt="Logo">-->
        <span>【云计算实验平台】</span>
      </router-link>
      <el-divider direction="vertical"></el-divider>
      <span>登录</span>
    </el-header>
    <el-main id="nest-area">
      <vue-canvas-nest :config="{color:'28,31,33', count: 88}"></vue-canvas-nest>
      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">

        <div class="title-container">
          <h3 class="login_title">用户登录</h3>
        </div>

        <el-form-item prop="username">
<!--        <span class="svg-container">-->
<!--          <svg-icon icon-class="user" />-->
<!--        </span>-->
          <el-input
            ref="username"
            v-model="loginForm.username"
            placeholder="请输入学工号"
            name="username"
            type="text"
            tabindex="1"
            auto-complete="on"
          />
        </el-form-item>

        <el-form-item prop="password">
<!--        <span class="svg-container">-->
<!--          <svg-icon icon-class="password" />-->
<!--        </span>-->
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="请输入密码"
            name="password"
            tabindex="2"
            auto-complete="on"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
        </el-form-item>

        <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">Login</el-button>

        <div class="tips">
          <router-link to="/register">去注册</router-link>
        </div>

      </el-form>
    </el-main>
  </el-container>
</template>

<script>
// import { validUsername } from '@/utils/validate'
import vueCanvasNest from 'vue-canvas-nest';

export default {
  name: 'Login',
  components: { vueCanvasNest },
  data() {
    const validateUsername = (rule, value, callback) => {
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
    const validatePassword = (rule, value, callback) => {
      callback()
    }
    return {
      loginForm: {
        username: 'admin',
        password: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm).then(() => {
            this.$router.push({ path: this.redirect || '/' })
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss">
@import "src/styles/common";

/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $font-three-color;
  }
}

/* reset element-ui css */
.login-container {
  .login-header {
    padding-left: 20%;
    background: #FFF;
    box-shadow: 0 2px 8px #cac6c6;
    height: 60px;
    line-height: 60px;
    .el-divider {
      height:24px ;
    }
    span {
      font-size: 24px;
      vertical-align: middle;
      -webkit-user-select: none;
      user-select: none;
    }
  }

  .el-input {
    display: inline-block;
    //width: 85%;
    width: 100%;

    //input {
    //  background: transparent;
    //  border: 0px;
    //  -webkit-appearance: none;
    //  border-radius: 0px;
    //  padding: 12px 5px 12px 15px;
    //  color: $font-three-color;
    //  height: 47px;
    //  //caret-color: $cursor;
    //
    //  //&:-webkit-autofill {
    //  //  box-shadow: 0 0 0px 1000px $bg inset !important;
    //  //  -webkit-text-fill-color: $cursor !important;
    //  //}
    //}
  }

  //.el-form-item {
  //  border: 1px solid rgba(255, 255, 255, 0.1);
  //  background: rgba(0, 0, 0, 0.1);
  //  border-radius: 5px;
  //  color: #454545;
  //}
}
</style>

<style lang="scss" scoped>
@import "src/styles/common";

$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 450px;
    max-width: 100%;
    overflow: hidden;
    border-radius: 15px;
    background-clip: padding-box;
    margin: 60px auto;
    //width: 450px;
    padding: 35px 35px 15px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
  }

  .tips {
    font-size: 14px;
    color: $font-three-color;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $font-three-color;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .login_title {
      margin: 0px auto 40px auto;
      text-align: center;
      color: #505458;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $font-three-color;
    cursor: pointer;
    user-select: none;
  }
}
</style>
