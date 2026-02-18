<template>
  <div class="login-container">
    <div class="header-bg">
      <h1 class="title">
        <span v-if="status === 0">{{ userType === 1 ? '用户登录' : '司机登录' }}</span>
        <span v-else>{{ userType === 1 ? '注册新用户' : '注册新司机' }}</span>
      </h1>
      <p class="subtitle">欢迎使用搬家系统</p>
    </div>

    <div class="form-card">
      <van-form ref="formRef" @submit="submit">
        <van-field
          v-model="form.username"
          left-icon="contact"
          name="username"
          label="账号"
          placeholder="请输入用户名或手机号"
          :rules="[{ required: true, message: '请填写用户名/手机号' }]"
        />

        <template v-if="status === 1">
          <van-field
            v-model="form.phone"
            left-icon="phone-o"
            type="tel"
            label="手机号"
            placeholder="请输入您的手机号"
            :rules="[{ required: true, message: '请填写手机号' }]"
          />
          <van-field
            v-if="userType === 1"
            v-model="form.nickname"
            left-icon="smile-o"
            label="昵称"
            placeholder="请输入您的昵称"
            :rules="[{ required: true, message: '请填写昵称' }]"
          />
          <template v-if="userType === 2">
            <van-field
              v-model="form.name"
              left-icon="user-o"
              label="姓名"
              placeholder="请输入您的真实姓名"
              :rules="[{ required: true, message: '请填写姓名' }]"
            />
            <van-field
              v-model="form.idCard"
              left-icon="idcard"
              label="身份证"
              placeholder="请输入18位身份证号"
              :rules="[{ required: true, message: '请填写身份证' }]"
            />
            <van-field
              v-model="form.carAge"
              left-icon="logistics"
              type="digit"
              label="驾龄(年)"
              placeholder="请输入您的驾龄"
              :rules="[{ required: true, message: '请填写驾龄' }]"
            />
          </template>
        </template>

        <van-field
          v-model="form.password"
          left-icon="lock"
          type="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
        <van-field
          v-if="status === 1"
          v-model="form.confirmPass"
          left-icon="shield-o"
          type="password"
          label="确认密码"
          placeholder="请再次输入密码"
          :rules="[{ required: true, message: '请确认密码' }]"
        />

        <div class="submit-btn-wrap">
          <van-button
            round
            block
            type="info"
            native-type="submit"
            color="linear-gradient(to right, #4facfe 0%, #00f2fe 100%)"
            :loading="loading"
            loading-text="处理中..."
          >
            {{ status === 0 ? '登 录' : '注 册' }}
          </van-button>
        </div>
      </van-form>

      <div class="action-tips">
        <span v-show="status === 0" @click="toggleStatus(1)">还没有账号? <strong>马上注册</strong></span>
        <span v-show="status === 1" @click="toggleStatus(0)">已有账号? <strong>立即登录</strong></span>
      </div>
    </div>

    <FloatBtn @click.native="changeUserType" :text="text" class="custom-float-btn" />
  </div>
</template>

<script>
import { loginApi, registerApi } from '@/api/user'
import { loginDriverApi, registerDriverApi } from '@/api/driver'
import { mapActions } from 'vuex'
import FloatBtn from '@/components/FloatBtn.vue'

export default {
  components: { FloatBtn },
  data() {
    return {
      status: 0, // 0是登录, 1是注册
      userType: 1, // 1是用户, 2是司机
      text: '我是司机',
      loading: false, // 控制提交按钮的加载防抖状态
      form: {
        username: '',
        password: '',
        phone: '',
        confirmPass: '',
        nickname: '',
        idCard: '',
        name: '',
        carAge: ''
      }
    }
  },
  methods: {
    ...mapActions(['setUser', 'changeLogin']),

    // 切换登录/注册状态并清理表单红字校验
    toggleStatus(newStatus) {
      this.status = newStatus;
      this.$refs.formRef.resetValidation();
    },

    // 切换用户身份
    changeUserType() {
      if (this.userType === 1) {
        this.userType = 2
        this.text = '我是用户'
      } else {
        this.userType = 1
        this.text = '我是司机'
      }
      this.$refs.formRef.resetValidation()
    },

    // 提交表单
    async submit() {
      this.loading = true; // 开启按钮加载状态
      try {
        // 登录逻辑
        if (this.status === 0) {
          let data;
          if (this.userType === 1) {
            data = (await loginApi(this.form)).data
          } else {
            data = (await loginDriverApi(this.form)).data
          }
          this.$toast.success('登录成功')
          await this.setUser({ ...data })
          await this.changeLogin(true)
          await this.$router.replace('/')
          return
        }

        // 注册逻辑
        if (this.form.password !== this.form.confirmPass) {
          this.$toast.fail('密码不一致, 请确认!')
          return
        }

        if (this.userType === 1) {
          await registerApi(this.form)
        } else {
          await registerDriverApi(this.form)
        }

        this.$toast.success('注册成功，请登录')
        this.status = 0 // 注册成功后自动切回登录页面
        // 清空密码框以便用户安全输入
        this.form.password = ''
        this.form.confirmPass = ''

      } catch (error) {
        console.error('提交失败:', error);
      } finally {
        this.loading = false; // 无论成功失败，恢复按钮状态
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 顶部渐变色头部背景 */
.header-bg {
  height: 240px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 30px;
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;

  .title {
    font-size: 32px;
    font-weight: bold;
    margin: 0 0 10px 0;
    letter-spacing: 2px;
  }

  .subtitle {
    font-size: 16px;
    opacity: 0.9;
    margin: 0;
  }
}

/* 悬浮表单卡片 */
.form-card {
  margin: -60px 20px 20px 20px;
  background: #ffffff;
  border-radius: 16px;
  padding: 30px 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.submit-btn-wrap {
  margin-top: 30px;
}

.action-tips {
  margin-top: 24px;
  text-align: center;
  color: #969799;
  font-size: 14px;

  strong {
    color: #4facfe;
    cursor: pointer;
    margin-left: 5px;
    transition: opacity 0.2s;

    &:active {
      opacity: 0.7;
    }
  }
}

/* 微调 Vant 单元格样式使其更舒适 */
::v-deep .van-cell {
  padding: 16px 0;
  &::after {
    left: 0;
    right: 0;
  }
}

::v-deep .van-field__label {
  font-weight: 500;
  color: #323233;
}
</style>