<template>
  <div class='container'>
    <div class="tip-banner">
      <van-swipe :autoplay='3000' :show-indicators='false' vertical class="notice-swipe">
        <van-swipe-item v-for='(tip, idx) in tipList' :key='tip.id'>
          <div class='tip-item' @click='onTip(idx)'>
            <van-icon name='volume-o' class="tip-icon" />
            <span class="tip-text">{{ tip.title }}</span>
            <van-icon name='arrow' class="tip-arrow" />
          </div>
        </van-swipe-item>
      </van-swipe>
    </div>

    <div class='publish-list' v-if='publishList.length > 0'>
      <div v-for='item in publishList' :key='item.id' class='publish-card' @click='$router.push(`/publish/${item.id}`)'>

        <div class='card-header'>
          <div class="user-info">
            <van-icon name="contact" size="16" />
            <span>{{ item.username }}</span>
          </div>
          <span class="time">{{ item.createTime }}</span>
        </div>

        <div class='card-body'>
          <van-image :src='$baseUrl + item.cover' class="cover-img" radius="8px" fit="cover" />
          <div class="content-text">
            <h4 class="title van-ellipsis">{{ item.title }}</h4>
            <p class="desc van-multi-ellipsis--l2">{{ item.content }}</p>
          </div>
        </div>

        <div class="card-footer">
          <p class="address">
            <van-icon name="location-o" /> {{ item.address }}
          </p>
          <div class="price-wrap">
            <span class="price-label">预期价格:</span>
            <span class="price-value">{{ item.valuation ? '¥' + item.valuation.toFixed(2) : '等待司机出价' }}</span>
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

    <div class="empty-state" v-else>
      <van-empty image="search" description="当前还没有搬家需求信息哦" />
    </div>

    <FloatBtn v-if='user.userType === 3' @click.native='onAdd' text='发布需求' icon='plus' :show='floatShow' class="custom-float" />

    <van-popup v-model='popupShow' position='bottom' round @close='floatShow = true' class="form-popup">
      <div class='form-container'>
        <div class='form-header'>
          <h3>{{ form.id ? '修改搬家信息' : '发布搬家需求' }}</h3>
          <van-icon name="cross" @click="popupShow = false" color="#999" size="20"/>
        </div>
        <van-form ref='formRef' @submit='submit' label-width='70px'>
          <van-field v-model='form.title' label='需求标题' placeholder='一句话描述您的搬家需求' :rules="[{ required: true, message: '请填写标题' }]" />
          <van-field v-model='form.content' type='textarea' rows="2" autosize label='详细内容' placeholder='请描述需要搬运的物品、楼层等信息' :rules="[{ required: true, message: '请填写内容' }]" maxlength="200" show-word-limit />
          <van-field v-model='form.address' type='textarea' rows="1" autosize label='详细地址' placeholder='请输入起止地址' :rules="[{ required: true, message: '请填写地址' }]" />

          <van-field label='封面主图'>
            <template #input>
              <van-uploader v-model='covers' :max-count='1' :before-read='beforeRead' :after-read='afterReadCover' />
            </template>
          </van-field>
          <van-field label='物品图片'>
            <template #input>
              <van-uploader v-model='form.imgArr' :max-count='5' :before-read='beforeRead' :after-read='afterReadImgs' />
            </template>
          </van-field>

          <div class="submit-btn-wrap">
            <van-button round block type='info' color="linear-gradient(to right, #4facfe 0%, #00f2fe 100%)" native-type='submit'>确认提交</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-popup v-model='tipPopupShow' round class="tip-popup">
      <div class="tip-content">
        <h3 class="tip-popup-title">{{ tipList[tipIndex]?.title }}</h3>
        <van-divider />
        <div class="html-content" v-html='tipList[tipIndex]?.content'></div>
        <van-button round block type="info" size="small" @click="tipPopupShow = false" style="margin-top: 20px;">我知道了</van-button>
      </div>
    </van-popup>

    <van-popup v-model='valuationShow' round class="valuation-popup">
      <div class="valuation-content">
        <h3>请输入您的报价</h3>
        <van-field v-model='valuationForm.valuation' type='number' label='接单价格' placeholder='请输入预期金额' :rules="[{ required: true, message: '请填写价格' }]">
          <template #right-icon><span>元</span></template>
        </van-field>
        <div class="submit-btn-wrap">
          <van-button @click='valuationSubmit' type='info' round block>确认报价</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import {
  pagePublishApi,
  createPublishApi,
  deletePublishApi,
  updatePublishApi,
  valuationPublishApi,
  processPublishApi
} from '@/api/publish'
import { uploadApi } from '@/api/file'
import { listTipApi } from '@/api/tip'
import FloatBtn from '@/components/FloatBtn.vue'
import { mapState } from 'vuex'

export default {
  components: { FloatBtn },
  data() {
    return {
      floatShow: true,
      popupShow: false,
      valuationShow: false,
      publishList: [],
      tipList: [],
      tipIndex: 0,
      tipPopupShow: false,
      covers: [],
      query: {
        current: 1,
        size: 999,
        total: 0
      },
      form: {
        title: '',
        content: '',
        address: '',
        cover: '',
        imgs: '',
        imgArr: []
      },
      valuationForm: {
        id: 0,
        valuation: 0
      }
    }
  },
  methods: {
    onProcess(id, isAccept) {
      let message = isAccept ? '是否接受此价格, 并结账?' : '是否拒绝此价格, 并重新发布?';
      this.$dialog.confirm({
        title: '温馨提示',
        message
      }).then(async () => {
        await processPublishApi(id, isAccept)
        this.$toast.success('操作成功!')
        await this.pagePublish()
      }).catch(() => {})
    },
    async valuationSubmit() {
      if (this.valuationForm.valuation <= 0) {
        this.$toast('请填写价格!')
        return
      }
      await valuationPublishApi(this.valuationForm)
      this.$toast.success('操作成功!')
      this.valuationShow = false
      await this.pagePublish()
    },
    onValuation(id) {
      this.valuationForm.id = id
      this.valuationForm.valuation = 0
      this.valuationShow = true
    },
    onDelete(id) {
      this.$dialog.confirm({
        title: '温馨提示',
        message: '你确定要删除这个搬家信息吗?'
      }).then(async () => {
        await deletePublishApi(id)
        this.$toast.success('操作成功!')
        await this.pagePublish()
      }).catch(() => {})
    },
    async submit() {
      this.form.imgs = this.form.imgArr.map(item => item.img).join(',')
      this.form.cover = this.covers[0]?.img || ''
      if (this.form.id) {
        await updatePublishApi(this.form)
      } else {
        await createPublishApi(this.form)
      }
      this.$toast.success('操作成功!')
      await this.pagePublish()
      this.popupShow = false
    },
    async afterReadCover(file) {
      const { data: url } = await uploadApi(file.file)
      file.img = url
    },
    async afterReadImgs(file) {
      const { data: url } = await uploadApi(file.file)
      file.img = url
    },
    beforeRead(file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        this.$toast('请上传 jpg 或者 png 格式图片!')
        return false
      }
      return true
    },
    onTip(idx) {
      this.tipIndex = idx
      this.tipPopupShow = true
    },
    onEdit(item) {
      this.popupShow = true
      this.floatShow = false
      this.form = { ...item, imgArr: [] }
      this.covers = [{ url: this.$baseUrl + item.cover, img: item.cover }]
      this.form.imgArr = item.imgs.split(',').map(img => ({ url: this.$baseUrl + img, img }))
    },
    onAdd() {
      this.popupShow = true
      this.floatShow = false
      this.form = {
        title: '',
        content: '',
        address: '',
        cover: '',
        imgs: '',
        imgArr: []
      }
      this.covers = []
    },
    async pagePublish() {
      const { data } = await pagePublishApi(this.query)
      this.publishList = data.rows
      this.query.total = data.total
    },
    async listTip() {
      const { data } = await listTipApi()
      this.tipList = data
    }
  },
  created() {
    this.pagePublish()
    this.listTip()
  },
  computed: {
    ...mapState(['user'])
  }
}
</script>

<style lang='scss' scoped>
.container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}

/* 提示轮播横幅 */
.tip-banner {
  background-color: #fffbe8;
  color: #ed6a0c;
  padding: 0 16px;

  .notice-swipe {
    height: 40px;
    line-height: 40px;
  }

  .tip-item {
    display: flex;
    align-items: center;
    font-size: 14px;

    .tip-icon {
      font-size: 18px;
      margin-right: 8px;
    }

    .tip-text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tip-arrow {
      font-size: 14px;
      opacity: 0.6;
    }
  }
}

/* 列表容器 */
.publish-list {
  padding: 16px;
  padding-bottom: 100px;
}

/* 单个卡片样式 */
.publish-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;

  &:active {
    transform: scale(0.98);
  }

  /* 卡片头 */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f5f6f7;

    .user-info {
      display: flex;
      align-items: center;
      color: #323233;
      font-weight: 500;
      font-size: 14px;

      .van-icon {
        color: #1989fa;
        margin-right: 6px;
      }
    }

    .time {
      font-size: 12px;
      color: #969799;
    }
  }

  /* 卡片体 */
  .card-body {
    display: flex;
    margin-bottom: 12px;

    .cover-img {
      width: 90px;
      height: 70px;
      flex-shrink: 0;
      border: 1px solid #f0f0f0;
    }

    .content-text {
      margin-left: 12px;
      flex: 1;
      overflow: hidden;

      .title {
        margin: 0 0 6px 0;
        font-size: 16px;
        color: #323233;
      }

      .desc {
        margin: 0;
        font-size: 13px;
        color: #646566;
        line-height: 1.4;
      }
    }
  }

  /* 卡片底部 */
  .card-footer {
    background-color: #fcfcfd;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 12px;

    .address {
      margin: 0 0 6px 0;
      font-size: 13px;
      color: #646566;
      display: flex;
      align-items: center;

      .van-icon {
        margin-right: 4px;
        color: #ee0a24;
      }
    }

    .price-wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .price-label {
        font-size: 13px;
        color: #969799;
      }

      .price-value {
        font-size: 16px;
        font-weight: bold;
        color: #ff5722;
      }
    }
  }

  /* 按钮区 */
  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px; /* 按钮之间的间距 */
  }
}

/* 弹窗通用样式 */
.form-popup {
  max-height: 90vh;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.form-container {
  padding: 0 16px 20px;

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;

    h3 {
      margin: 0;
      font-size: 18px;
      color: #323233;
    }
  }
}

.submit-btn-wrap {
  margin-top: 24px;
  padding: 0 16px;
}

/* 提示详情弹窗 */
.tip-popup, .valuation-popup {
  width: 85%;
  padding: 24px 20px;
  box-sizing: border-box;
}

.tip-content {
  .tip-popup-title {
    margin: 0;
    text-align: center;
    color: #323233;
  }

  .html-content {
    font-size: 14px;
    color: #646566;
    line-height: 1.6;
    max-height: 50vh;
    overflow-y: auto;
  }
}

.valuation-content h3 {
  text-align: center;
  margin-top: 0;
}
</style>