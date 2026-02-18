<template>
  <div class='container'>
    <div class='header'>
      <van-image :src='$baseUrl + user.avatar' round width='100px' height='100px' />
      <div class='header-info'>
        <span>用户名: {{ user.username }}</span>
        <span>
          {{ userType === 3 ? '昵称' : '名称' }}:
          {{ user.nickname ?? user.name }}
        </span>
        <span>
          {{ userType === 3 ? '账户余额' : '我的收入' }}:
          ¥{{ user.balance?.toFixed(2) ?? user.income?.toFixed(2) }}
        </span>
      </div>
    </div>

    <van-cell-group style='margin: 20px 0;border-radius: 10px;overflow: hidden'>
      <van-cell title='修改个人信息' is-link icon='user-o' center clickable @click='infoPopup = true' />
      <van-cell
        v-if='userType === 3'
        is-link center clickable
        title='钱包充值'
        icon='balance-pay'
        @click='walletPopup = true'
      />
      <van-cell
        v-if='userType === 2'
        center clickable is-link
        title='我的投诉'
        icon='balance-pay'
        @click='$router.push("/complaint")'
      />
    </van-cell-group>

    <van-button style='width: 100%;border-radius: 10px' @click='logout'>退出登录</van-button>

    <van-popup v-model='infoPopup' position='bottom' closeable @close='form = {...user, avatars: []}'>
      <div class='user-info-form'>
        <van-form @submit='onInfoSubmit'>
          <van-field
            v-if='userType === 3'
            v-model='form.nickname'
            clearable
            label='昵称'
            placeholder='昵称'
            :rules="[{ required: true, message: '请填写昵称' }]"
          />
          <van-field
            v-if='userType === 2'
            type='digit'
            v-model='form.age'
            clearable
            label='年龄'
            placeholder='年龄'
            :rules="[{ required: true, message: '请填写年龄' }]"
          />
          <van-field
            v-if='userType === 2'
            type='digit'
            v-model='form.carAge'
            clearable
            label='驾龄'
            placeholder='驾龄'
            :rules="[{ required: true, message: '请填写驾龄' }]"
          />
          <van-field
            v-if='userType === 2'
            label='性别'
            placeholder='性别'
            :rules="[{ required: true, message: '请填写性别' }]"
          >
            <template #input>
              <van-radio-group v-model='form.gender' direction='horizontal'>
                <van-radio :name='0'>男</van-radio>
                <van-radio :name='1'>女</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field
            v-model='form.password'
            type='password'
            label='密码'
            placeholder='密码'
          />
          <van-field label='头像'>
            <template #input>
              <van-uploader
                v-model='form.avatars'
                :max-count='1'
                :before-read='beforeRead'
                :after-read='afterRead'
              />
            </template>
          </van-field>
          <div style='margin: 16px;'>
            <van-button round block type='info' native-type='submit'>提交</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-popup v-model='walletPopup' position='bottom'>
      <div class='wallet-recharge'>
        <div class='list'>
          <div class='item' :class='type === 0 ? "active" : ""' @click='type = 0'>
            <van-icon size='30' name='wechat-pay' color='#2ecc71' />
            <span>微信充值</span>
          </div>
          <div class='item' :class='type === 1 ? "active" : ""' @click='type = 1'>
            <van-icon size='30' name='alipay' color='#1e90ff' />
            <span>支付宝充值</span>
          </div>
        </div>
        <van-field style='margin: 10px 0' type='number' v-model='amount' label='充值金额' />
        <van-button style='width: 100%; border-radius: 15px' type='info' @click='recharge'>充值</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { infoUserApi, updateUserApi } from '@/api/user'
import { infoDriverApi, updateDriverApi } from '@/api/driver'
import { uploadApi } from '@/api/file'
import { mapActions, mapState } from 'vuex'

export default {
  data() {
    return {
      infoPopup: false,
      walletPopup: false,
      user: {},
      form: {},
      amount: 0,
      type: 0,
      userType: 0
    }
  },
  methods: {
    logout() {
      this.$dialog.confirm({
        title: '温馨提示',
        message: '确认退出登陆吗?'
      }).then(() => {
        this.setUser({})
        this.changeLogin(false)
        this.$router.push('/login')
      }).catch(() => {
      })
    },
    async recharge() {
      if (this.amount <= 0) {
        return this.$toast('请输入充值金额!')
      }
      await updateUserApi({ id: this.user.id, balance: +this.user.balance + +this.amount })
      await this.infoUser()
      this.$toast.success('充值成功!')
      this.walletPopup = false
      this.amount = 0
    },
    async onInfoSubmit() {
      if (this.userType === 3) {
        await updateUserApi(this.form)
      } else {
        await updateDriverApi(this.form)
      }
      this.$toast.success('修改成功!')
      this.infoPopup = false
      await this.infoUser()
    },
    async afterRead(file) {
      const { data: url } = await uploadApi(file.file)
      this.form.avatar = url
    },
    beforeRead(file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        this.$toast('请上传 jpg 或者 png 格式图片!')
        return false
      }
      return true
    },
    async infoUser() {
      let data
      if (this.userType === 3) {
        data = (await infoUserApi()).data
      } else {
        data = (await infoDriverApi()).data
      }
      this.user = { ...data }
      this.form = { ...data, avatars: [] }
    },
    ...mapActions(['setUser', 'changeLogin'])
  },
  computed: {
    ...mapState({ loginUser: state => state.user })
  },
  mounted() {
    this.userType = this.loginUser.userType
    this.infoUser()
  }
}
</script>

<style lang='scss' scoped>
.wallet-recharge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;

  .list {
    width: 100%;
    display: flex;
    justify-content: space-around;

    .item {
      display: flex;
      align-items: center;
      border: 1px solid gray;
      border-radius: 20px;
      padding: 15px 20px;
    }

    .active {
      border-color: #1780e8;
      background-color: rgba(23, 128, 232, .1);
    }
  }
}

.user-info-form {
  margin-top: 30px;
}

.header {
  display: flex;
  align-items: center;
  height: 120px;
  width: 100%;
  border-radius: 10px;
  background-color: white;
  padding: 20px;

  &-info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    margin-left: 20px;
    font-size: 15px;
    color: gray;
  }
}

.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 15px;
}
</style>
