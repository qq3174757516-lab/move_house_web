<template>
  <div class='container'>
    <div class="tip-banner">
      <van-swipe :autoplay='3000' :show-indicators='false' vertical class="notice-swipe">
        <van-swipe-item v-for='(tip, idx) in tipList' :key='tip.id'>
          <div class='tip-item' @click='onTip(idx)'><van-icon name='volume-o' class="tip-icon" /><span class="tip-text">{{ tip.title }}</span><van-icon name='arrow' class="tip-arrow" /></div>
        </van-swipe-item>
      </van-swipe>
    </div>

    <div class='publish-list' v-if='publishList.length > 0'>
      <div v-for='item in publishList' :key='item.id' class='publish-card' @click='$router.push(`/publish/${item.id}`)'>
        <div class='card-header'><div class="user-info"><van-icon name="contact" size="16" /><span>{{ item.username }}</span></div><span class="time">{{ item.createTime }}</span></div>
        <div class='card-body'><van-image :src='$baseUrl + item.cover' class="cover-img" radius="8px" fit="cover" /><div class="content-text"><h4 class="title van-ellipsis">{{ item.title }}</h4><p class="desc van-multi-ellipsis--l2">{{ item.content }}</p></div></div>
        <div class="card-footer">
          <p class="address"><van-icon name="location-o" /> {{ item.address }}</p>
          <div class="price-wrap">
            <span class="price-label">预期价格:</span>
            <span class="price-value">{{ item.valuation ? '¥' + item.valuation.toFixed(2) : (item.estimatedPrice ? '系统预估 ¥' + item.estimatedPrice : '等待估价') }}</span>
          </div>
        </div>
        <div class="card-actions" @click.stop>
          <template v-if='user.userType === 3'>
            <van-button round size='small' type='info' plain v-if='item.status === 0' @click='onEdit(item)'>修改信息</van-button>
            <van-button round size='small' type='danger' plain v-if='item.status === 0' @click='onDelete(item.id)'>取消发布</van-button>
            <van-button round size='small' type='primary' v-if='item.status === 1' @click='onProcess(item.id, 1)'>同意出价</van-button>
            <van-button round size='small' type='danger' plain v-if='item.status === 1' @click='onProcess(item.id, 0)'>拒绝出价</van-button>
            <van-button round size='small' type='primary' disabled v-if='item.status === 2'>订单已完成</van-button>
          </template>
          <template v-if='user.userType === 2'>
            <van-button round size='small' type='info' v-if='item.status === 0' @click='$router.push(`/publish/${item.id}`)'>查看详情抢单</van-button>
            <van-button round size='small' type='primary' disabled v-if='item.status === 1'>已接单</van-button>
          </template>
        </div>
      </div>
    </div>
    <div class="empty-state" v-else><van-empty image="search" description="当前还没有搬家需求信息哦" /></div>
    <FloatBtn v-if='user.userType === 3' @click.native='onAdd' text='发布需求' icon='plus' :show='floatShow' class="custom-float" />

    <van-popup v-model='popupShow' position='bottom' round @close='floatShow = true' class="form-popup">
      <div class='form-container'>
        <div class='form-header'>
          <h3>{{ form.id ? '修改搬家信息' : '发布搬家需求' }}</h3>
          <van-icon name="cross" @click="popupShow = false" color="#999" size="20"/>
        </div>
        <van-form ref='formRef' @submit='submit' label-width='70px'>
          <van-field v-model='form.title' label='需求标题' placeholder='如: 周末小型搬家' :rules="[{ required: true, message: '请填写标题' }]" />

          <van-field readonly clickable v-model='form.originAddress' label='搬出地址' placeholder='点击选择搬出地址' @click="openAddressSelector('origin')" :rules="[{ required: true, message: '请选择搬出地址' }]">
            <template #right-icon><van-icon name="arrow" /></template>
          </van-field>
          <van-field readonly clickable v-model='form.destinationAddress' label='搬入地址' placeholder='点击选择搬入地址' @click="openAddressSelector('destination')" :rules="[{ required: true, message: '请选择搬入地址' }]">
            <template #right-icon><van-icon name="arrow" /></template>
          </van-field>

          <van-field v-model='form.distance' type='number' label='预估距离' placeholder='大概多少公里' >
            <template #right-icon><span>公里</span></template>
          </van-field>

          <van-field name="stepper" label="搬运楼层">
            <template #input>
              <van-stepper v-model="form.floor" min="1" max="20" />
            </template>
          </van-field>
          <van-field label='有无电梯'>
            <template #input>
              <van-radio-group v-model='form.hasElevator' direction='horizontal'>
                <van-radio :name='1' checked-color="#4facfe">有电梯</van-radio>
                <van-radio :name='0' checked-color="#4facfe">爬楼梯</van-radio>
              </van-radio-group>
            </template>
          </van-field>

          <van-field v-model='form.content' type='textarea' rows="1" autosize label='物品简述' placeholder='请描述或点击下方快捷选择...' :rules="[{ required: true, message: '请填写简述' }]" />

          <div class="quick-tags-wrap">
            <span class="quick-tags-label">点选常见物品：</span>
            <div class="quick-tags">
              <van-tag plain type="primary" round size="medium" v-for="tag in commonItems" :key="tag" @click="appendItem(tag)">
                + {{ tag }}
              </van-tag>
            </div>
          </div>

          <van-field label='封面主图'>
            <template #input><van-uploader v-model='covers' :max-count='1' :before-read='beforeRead' :after-read='afterReadCover' /></template>
          </van-field>

          <div class="estimated-price-box">
            <span>系统智能预估价:</span>
            <span class="price-text">¥ {{ calculatedPrice }}</span>
          </div>

          <div class="submit-btn-wrap">
            <van-button round block type='info' color="linear-gradient(to right, #4facfe 0%, #00f2fe 100%)" native-type='submit'>确认发布</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-action-sheet v-model="showAddressSheet" title="请选择地址">
      <van-address-list
        v-model="chosenAddressId"
        :list="addressListForSheet"
        default-tag-text="默认"
        @select="onAddressSelect"
        @add="$router.push('/address')"
        add-button-text="去添加新地址"
        class="sheet-address-list"
      />
    </van-action-sheet>

    <van-popup v-model='tipPopupShow' round class="tip-popup"><div class="tip-content"><h3 class="tip-popup-title">{{ tipList[tipIndex]?.title }}</h3><van-divider /><div class="html-content" v-html='tipList[tipIndex]?.content'></div><van-button round block type="info" size="small" @click="tipPopupShow = false" style="margin-top: 20px;">我知道了</van-button></div></van-popup>
    <van-popup v-model='valuationShow' round class="valuation-popup"><div class="valuation-content"><h3>请输入您的报价</h3><van-field v-model='valuationForm.valuation' type='number' label='接单价格' placeholder='请输入预期金额' :rules="[{ required: true }]"><template #right-icon><span>元</span></template></van-field><div class="submit-btn-wrap"><van-button @click='valuationSubmit' type='info' round block>确认报价</van-button></div></div></van-popup>
  </div>
</template>

<script>
import { pagePublishApi, createPublishApi, deletePublishApi, updatePublishApi, valuationPublishApi, processPublishApi } from '@/api/publish'
import { uploadApi } from '@/api/file'
import { listTipApi } from '@/api/tip'
import { listAddressApi } from '@/api/address'
import FloatBtn from '@/components/FloatBtn.vue'
import { mapState } from 'vuex'

export default {
  components: { FloatBtn },
  data() {
    return {
      floatShow: true, popupShow: false, valuationShow: false, publishList: [], tipList: [], tipIndex: 0, tipPopupShow: false, covers: [],
      query: { current: 1, size: 999, total: 0 },
      showAddressSheet: false, currentAddressType: '', addressListForSheet: [], chosenAddressId: '',
      // 配置的常见物品列表
      commonItems: ['冰箱', '洗衣机', '大衣柜', '1.8米大床', '沙发', '电视', '空调', '几个编织袋', '打包箱', '电脑桌'],
      form: {
        title: '', content: '', cover: '', imgs: '', imgArr: [],
        originAddress: '', destinationAddress: '', distance: '', floor: 1, hasElevator: 1, estimatedPrice: 0
      },
      valuationForm: { id: 0, valuation: 0 }
    }
  },
  computed: {
    ...mapState(['user']),
    calculatedPrice() {
      let basePrice = 60;
      let dist = parseFloat(this.form.distance) || 0;
      let distPrice = dist * 4;
      let floorPrice = 0;
      if (this.form.hasElevator === 0 && this.form.floor > 1) {
        floorPrice = (this.form.floor - 1) * 15;
      }
      return (basePrice + distPrice + floorPrice).toFixed(2);
    }
  },
  watch: {
    calculatedPrice(newVal) {
      this.form.estimatedPrice = newVal;
    }
  },
  methods: {
    // 快捷添加物品的方法
    appendItem(tag) {
      if (!this.form.content) {
        this.form.content = tag;
      } else {
        // 避免重复添加
        if (!this.form.content.includes(tag)) {
          this.form.content += '、' + tag;
        }
      }
    },
    async fetchAddressList() {
      const { data } = await listAddressApi()
      this.addressListForSheet = data.map(item => ({
        id: item.id,
        name: item.name,
        tel: item.phone,
        address: `${item.province}${item.city}${item.county}${item.addressDetail}`,
        isDefault: item.isDefault
      }))
    },
    async openAddressSelector(type) {
      this.currentAddressType = type
      await this.fetchAddressList()
      if(this.addressListForSheet.length === 0) {
        this.$dialog.confirm({title: '提示', message: '您还没有添加地址，是否去添加？'}).then(() => this.$router.push('/address'))
        return;
      }
      this.showAddressSheet = true
    },
    onAddressSelect(item) {
      if(this.currentAddressType === 'origin') this.form.originAddress = item.address
      if(this.currentAddressType === 'destination') this.form.destinationAddress = item.address
      this.showAddressSheet = false
    },
    onProcess(id, isAccept) {
      this.$dialog.confirm({ title: '温馨提示', message: isAccept ? '是否接受此价格, 并结账?' : '是否拒绝此价格?' }).then(async () => {
        await processPublishApi(id, isAccept)
        this.$toast.success('操作成功!')
        await this.pagePublish()
      }).catch(() => {})
    },
    async valuationSubmit() {
      if (this.valuationForm.valuation <= 0) return this.$toast('请填写价格!')
      await valuationPublishApi(this.valuationForm)
      this.$toast.success('操作成功!')
      this.valuationShow = false
      await this.pagePublish()
    },
    onValuation(id) { this.valuationForm.id = id; this.valuationForm.valuation = 0; this.valuationShow = true; },
    onDelete(id) {
      this.$dialog.confirm({ title: '温馨提示', message: '确定要删除吗?' }).then(async () => {
        await deletePublishApi(id)
        this.$toast.success('操作成功!')
        await this.pagePublish()
      }).catch(() => {})
    },
    async submit() {
      this.form.imgs = this.form.imgArr.map(item => item.img).join(',')
      this.form.cover = this.covers[0]?.img || ''
      this.form.address = this.form.originAddress + ' -> ' + this.form.destinationAddress

      if (this.form.id) await updatePublishApi(this.form)
      else await createPublishApi(this.form)

      this.$toast.success('发布成功!')
      await this.pagePublish()
      this.popupShow = false
    },
    async afterReadCover(file) { const { data: url } = await uploadApi(file.file); file.img = url },
    async afterReadImgs(file) { const { data: url } = await uploadApi(file.file); file.img = url },
    beforeRead(file) { if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) { this.$toast('请上传 jpg 或 png!'); return false } return true },
    onTip(idx) { this.tipIndex = idx; this.tipPopupShow = true },
    onEdit(item) {
      this.popupShow = true; this.floatShow = false
      this.form = { ...item, imgArr: [] }
      this.covers = [{ url: this.$baseUrl + item.cover, img: item.cover }]
      if(item.imgs) this.form.imgArr = item.imgs.split(',').map(img => ({ url: this.$baseUrl + img, img }))
    },
    onAdd() {
      this.popupShow = true; this.floatShow = false
      this.form = { title: '', content: '', cover: '', imgs: '', imgArr: [], originAddress: '', destinationAddress: '', distance: '', floor: 1, hasElevator: 1, estimatedPrice: 0 }
      this.covers = []
    },
    async pagePublish() { const { data } = await pagePublishApi(this.query); this.publishList = data.rows; this.query.total = data.total },
    async listTip() { const { data } = await listTipApi(); this.tipList = data }
  },
  created() { this.pagePublish(); this.listTip() }
}
</script>

<style lang='scss' scoped>
.container { min-height: 100vh; background-color: #f7f8fa; padding-bottom: 20px; }
.tip-banner { background-color: #fffbe8; color: #ed6a0c; padding: 0 16px; .notice-swipe { height: 40px; line-height: 40px; } .tip-item { display: flex; align-items: center; font-size: 14px; .tip-icon { font-size: 18px; margin-right: 8px; } .tip-text { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .tip-arrow { font-size: 14px; opacity: 0.6; } } }
.publish-list { padding: 16px; padding-bottom: 100px; }
.publish-card { background: #ffffff; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04); transition: transform 0.2s; &:active { transform: scale(0.98); } .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f5f6f7; .user-info { display: flex; align-items: center; color: #323233; font-weight: 500; font-size: 14px; .van-icon { color: #1989fa; margin-right: 6px; } } .time { font-size: 12px; color: #969799; } } .card-body { display: flex; margin-bottom: 12px; .cover-img { width: 90px; height: 70px; flex-shrink: 0; border: 1px solid #f0f0f0; } .content-text { margin-left: 12px; flex: 1; overflow: hidden; .title { margin: 0 0 6px 0; font-size: 16px; color: #323233; } .desc { margin: 0; font-size: 13px; color: #646566; line-height: 1.4; } } } .card-footer { background-color: #fcfcfd; border-radius: 8px; padding: 10px; margin-bottom: 12px; .address { margin: 0 0 6px 0; font-size: 13px; color: #646566; display: flex; align-items: center; .van-icon { margin-right: 4px; color: #ee0a24; } } .price-wrap { display: flex; justify-content: space-between; align-items: center; .price-label { font-size: 13px; color: #969799; } .price-value { font-size: 16px; font-weight: bold; color: #ff5722; } } } .card-actions { display: flex; justify-content: flex-end; gap: 8px; } }
.form-popup { max-height: 90vh; border-top-left-radius: 20px; border-top-right-radius: 20px; }
.form-container { padding: 0 16px 20px; .form-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; h3 { margin: 0; font-size: 18px; color: #323233; } } }

/* 新增的快捷标签样式 */
.quick-tags-wrap {
  padding: 0 16px 10px;
  display: flex;
  flex-direction: column;
  .quick-tags-label { font-size: 13px; color: #646566; margin-bottom: 8px; padding-left: 2px; }
  .quick-tags { display: flex; flex-wrap: wrap; gap: 8px; }
}

.submit-btn-wrap { margin-top: 24px; padding: 0 16px; }
.tip-popup, .valuation-popup { width: 85%; padding: 24px 20px; box-sizing: border-box; }
.tip-content { .tip-popup-title { margin: 0; text-align: center; color: #323233; } .html-content { font-size: 14px; color: #646566; line-height: 1.6; max-height: 50vh; overflow-y: auto; } }
.valuation-content h3 { text-align: center; margin-top: 0; }
.estimated-price-box { display: flex; justify-content: space-between; align-items: center; padding: 15px 16px; margin: 10px 16px 0; background-color: #fffbe8; border-radius: 8px; font-size: 14px; color: #323233; .price-text { font-size: 20px; font-weight: bold; color: #ee0a24; } }
.sheet-address-list { padding-bottom: 20px; }
</style>