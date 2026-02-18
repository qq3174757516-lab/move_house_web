<template>
  <div class='user-container'>
    <div class='header-section'>
      <div class="user-profile">
        <van-image :src='$baseUrl + user.avatar' round width='70px' height='70px' fit="cover" class="avatar-img" />
        <div class='header-info'>
          <div class="name-row">
            <span class="username">{{ user.username }}</span>
            <van-tag round :color="userType === 3 ? 'rgba(255,255,255,0.3)' : '#ff976a'" text-color="#fff">
              {{ userType === 3 ? '普通用户' : '认证司机' }}
            </van-tag>
          </div>
          <span class="sub-name">{{ userType === 3 ? '昵称' : '姓名' }}: {{ user.nickname ?? user.name ?? '未设置' }}</span>
        </div>
      </div>
    </div>

    <div class="asset-card">
      <div class="asset-info">
        <span class="asset-title">{{ userType === 3 ? '账户余额 (元)' : '我的总收入 (元)' }}</span>
        <span class="asset-value">{{ user.balance?.toFixed(2) ?? user.income?.toFixed(2) ?? '0.00' }}</span>
      </div>
      <van-button v-if='userType === 3' round size="small" type="info" color="linear-gradient(to right, #4facfe, #00f2fe)" class="recharge-btn" @click='walletPopup = true'>
        立即充值
      </van-button>
    </div>

    <van-cell-group inset class="menu-group">
      <van-cell title='修改个人资料' is-link icon='edit' center clickable @click='infoPopup = true' />
      <van-cell v-if='userType === 3' title='我的地址簿' is-link icon='location-o' center clickable @click='$router.push("/address")' />

      <van-cell v-if='userType === 3' is-link center clickable title='钱包充值中心' icon='gold-coin-o' @click='walletPopup = true' />
      <van-cell v-if='userType === 2' center clickable is-link title='我的客诉记录' icon='warning-o' @click='$router.push("/complaint")' />
    </van-cell-group>

    <div class="logout-wrap">
      <van-button block round plain type="danger" @click='logout'>退出当前账号</van-button>
    </div>

    <van-popup v-model='infoPopup' position='bottom' round closeable @close='form = {...user, avatars: []}' class="custom-popup">
      <div class='user-info-form'>
        <h3 class="popup-title">编辑资料</h3>
        <van-form @submit='onInfoSubmit' label-width="60px">
          <van-field v-if='userType === 3' v-model='form.nickname' clearable label='昵称' placeholder='请输入您的昵称' :rules="[{ required: true, message: '请填写昵称' }]" />
          <template v-if='userType === 2'>
            <van-field type='digit' v-model='form.age' clearable label='年龄' placeholder='请输入年龄' :rules="[{ required: true, message: '请填写年龄' }]" />
            <van-field type='digit' v-model='form.carAge' clearable label='驾龄' placeholder='请输入驾龄(年)' :rules="[{ required: true, message: '请填写驾龄' }]" />
            <van-field label='性别' :rules="[{ required: true, message: '请选择性别' }]">
              <template #input>
                <van-radio-group v-model='form.gender' direction='horizontal'>
                  <van-radio :name='0' checked-color="#4facfe">男</van-radio>
                  <van-radio :name='1' checked-color="#4facfe">女</van-radio>
                </van-radio-group>
              </template>
            </van-field>
          </template>
          <van-field v-model='form.password' type='password' label='新密码' placeholder='不修改请留空' />
          <van-field label='头像'>
            <template #input>
              <van-uploader v-model='form.avatars' :max-count='1' :before-read='beforeRead' :after-read='afterRead' />
            </template>
          </van-field>
          <div style='margin: 30px 16px 16px;'>
            <van-button round block type='info' color="linear-gradient(to right, #4facfe, #00f2fe)" native-type='submit'>保存修改</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-popup v-model='walletPopup' position='bottom' round class="custom-popup">
      <div class='wallet-recharge'>
        <h3 class="popup-title">选择充值方式</h3>
        <div class='pay-list'>
          <div class='pay-item' :class='type === 0 ? "active" : ""' @click='type = 0'>
            <van-icon size='32' name='wechat-pay' color='#07c160' />
            <span>微信支付</span>
            <van-icon v-show="type === 0" name="checked" color="#07c160" class="check-icon" />
          </div>
          <div class='pay-item' :class='type === 1 ? "active" : ""' @click='type = 1'>
            <van-icon size='32' name='alipay' color='#1989fa' />
            <span>支付宝</span>
            <van-icon v-show="type === 1" name="checked" color="#1989fa" class="check-icon" />
          </div>
        </div>
        <van-field class="amount-input" type='number' v-model='amount' label='充值金额' placeholder="请输入充值金额" size="large">
          <template #left-icon><span style="color:#323233; font-weight:bold; font-size: 18px">¥</span></template>
        </van-field>
        <div style='margin: 30px 0 10px; width: 100%;'>
          <van-button round block type='info' color="linear-gradient(to right, #4facfe, #00f2fe)" @click='recharge'>立即充值</van-button>
        </div>
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
      amount: '',
      type: 0,
      userType: 0
    }
  },
  methods: {
    logout() {
      this.$dialog.confirm({ title: '温馨提示', message: '确认退出当前账号吗?' }).then(() => {
        this.setUser({})
        this.changeLogin(false)
        this.$router.push('/login')
      }).catch(() => {})
    },
    async recharge() {
      if (!this.amount || this.amount <= 0) return this.$toast('请输入有效的充值金额!')
      await updateUserApi({ id: this.user.id, balance: +this.user.balance + +this.amount })
      await this.infoUser()
      this.$toast.success('充值成功!')
      this.walletPopup = false
      this.amount = ''
    },
    async onInfoSubmit() {
      if (this.userType === 3) await updateUserApi(this.form)
      else await updateDriverApi(this.form)
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
      if (this.userType === 3) data = (await infoUserApi()).data
      else data = (await infoDriverApi()).data
      this.user = { ...data }
      this.form = { ...data, avatars: [] }
    },
    ...mapActions(['setUser', 'changeLogin'])
  },
  computed: { ...mapState({ loginUser: state => state.user }) },
  mounted() {
    this.userType = this.loginUser.userType
    this.infoUser()
  }
}
</script>

<style lang='scss' scoped>
/* 原样保留你的 user.vue 样式 */
.user-container { min-height: 100vh; background-color: #f7f8fa; }
.header-section { height: 180px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px 20px 0; box-sizing: border-box; .user-profile { display: flex; align-items: center; .avatar-img { border: 3px solid rgba(255, 255, 255, 0.4); } .header-info { margin-left: 16px; color: #fff; display: flex; flex-direction: column; .name-row { display: flex; align-items: center; margin-bottom: 6px; .username { font-size: 20px; font-weight: bold; margin-right: 8px; } } .sub-name { font-size: 13px; opacity: 0.9; } } } }
.asset-card { margin: -40px 16px 20px; background: #ffffff; border-radius: 12px; padding: 24px 20px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 10; .asset-info { display: flex; flex-direction: column; .asset-title { font-size: 13px; color: #969799; margin-bottom: 8px; } .asset-value { font-size: 28px; font-weight: bold; color: #323233; font-family: Arial, Helvetica, sans-serif; } } .recharge-btn { padding: 0 20px; } }
.menu-group { margin-bottom: 30px; }
.logout-wrap { padding: 0 16px 40px; }
.custom-popup { border-top-left-radius: 20px; border-top-right-radius: 20px; }
.popup-title { text-align: center; margin: 20px 0; font-size: 16px; color: #323233; }
.wallet-recharge { display: flex; flex-direction: column; align-items: center; padding: 0 20px 20px; .pay-list { width: 100%; display: flex; justify-content: space-between; margin-bottom: 24px; .pay-item { width: 47%; display: flex; flex-direction: column; align-items: center; background-color: #f7f8fa; border: 1px solid transparent; border-radius: 12px; padding: 20px 0; position: relative; transition: all 0.2s; span { margin-top: 10px; font-size: 14px; color: #323233; } .check-icon { position: absolute; top: 8px; right: 8px; font-size: 18px; } } .active { border-color: #4facfe; background-color: rgba(79, 172, 254, 0.05); span { color: #4facfe; font-weight: bold; } } } .amount-input { background-color: #f7f8fa; border-radius: 8px; } }
</style>