<template>
  <div class='publish-detail-container'>

    <div class="carousel-section">
      <van-swipe loop :autoplay='3000' indicator-color="white" class="custom-swipe">
        <van-swipe-item v-for='(image, index) in publish.imgArr' :key='index'>
          <van-image :src='$baseUrl + image' width='100%' height='260' fit="cover" />
        </van-swipe-item>
        <van-swipe-item v-if="!publish.imgArr || publish.imgArr.length === 0">
          <div class="empty-image">
            <van-icon name="photo-o" size="40" color="#c8c9cc" />
            <p>该需求暂无图片</p>
          </div>
        </van-swipe-item>
      </van-swipe>
    </div>

    <div class="info-card">
      <div class="card-header">
        <h2 class="title van-multi-ellipsis--l2">{{ publish.title }}</h2>
        <div class="price-box">
          <span class="price-label">预期价格</span>
          <span class="price-value">{{ publish.valuation ? '¥' + publish.valuation?.toFixed(2) : '等待出价' }}</span>
        </div>
      </div>
      <van-divider dashed :style="{ borderColor: '#ebedf0', margin: '10px 0' }" />
      <div class="card-body">
        <p class="content-desc">{{ publish.content }}</p>
      </div>
    </div>

    <van-cell-group inset class="detail-cells">
      <van-cell title='地址' icon="location-o" :value='publish.address' />
      <van-cell title='发布者' icon="contact" :value='publish.username' />
      <van-cell title='发布时间' icon="clock-o" :value='publish.createTime' />
    </van-cell-group>

    <div class="bottom-action-bar">
      <van-button
        v-if='user.userType === 2 && publish.status === 0'
        round block type='info'
        color="linear-gradient(to right, #ff6034, #ee0a24)"
        @click='onValuation(publish.id)'>
        我要抢单 / 报价
      </van-button>
      <van-button v-else-if='publish.status === 1' round block type='info' disabled>已被接单 / 搬运中</van-button>
      <van-button v-else-if='publish.status === 2' round block type='default' disabled>订单已完成</van-button>
    </div>

    <van-popup v-model='valuationShow' round class="valuation-popup">
      <div class="valuation-form">
        <h3>请输入您的报价</h3>
        <p class="subtitle">合理报价能极大提高您的接单成功率</p>
        <van-field
          v-model='valuationForm.valuation'
          type='number'
          label='接单价格'
          placeholder='请输入您的预期金额'
          :rules="[{ required: true, message: '请填写价格' }]"
          class="price-input"
        >
          <template #right-icon><span style="color: #323233; font-weight: bold;">元</span></template>
        </van-field>
        <div class="submit-wrap">
          <van-button @click='valuationSubmit' type='info' color="linear-gradient(to right, #ff6034, #ee0a24)" round block>确认提交报价</van-button>
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
  processPublishApi,
  findPublishApi
} from '@/api/publish'
import { uploadApi } from '@/api/file'
import { listTipApi } from '@/api/tip'
import FloatBtn from '@/components/FloatBtn.vue'
import { mapState } from 'vuex'

export default {
  components: { FloatBtn },
  data() {
    return {
      id: null,
      valuationShow: false,
      publish: {
        imgArr: []
      },
      valuationForm: {
        id: 0,
        valuation: 0
      }
    }
  },
  methods: {
    async valuationSubmit() {
      if (this.valuationForm.valuation <= 0) {
        this.$toast('请填写价格!')
        return
      }
      await valuationPublishApi(this.valuationForm)
      this.$toast.success('操作成功!')
      this.valuationShow = false
      await this.findPublish()
    },
    onValuation(id) {
      this.valuationForm.id = id
      this.valuationForm.valuation = 0
      this.valuationShow = true
    },
    async findPublish() {
      const { data } = await findPublishApi(this.id)
      data.imgArr = data.imgs.split(',').filter(e => !!e)
      data.imgArr.unshift(data.cover)
      this.publish = data
    }
  },
  created() {
    this.id = this.$route.params.id
    this.findPublish()
  },
  computed: {
    ...mapState(['user'])
  }
}
</script>

<style lang='scss' scoped>
.publish-detail-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 100px; /* 给底部悬浮按钮留出空间 */
}

/* 轮播图 */
.custom-swipe {
  background-color: #fff;
}
.empty-image {
  height: 260px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f7f8fa;
  color: #969799;
  font-size: 14px;
}

/* 详情卡片 */
.info-card {
  margin: -20px 16px 16px; /* 负边距让它悬浮在图片上 */
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  position: relative;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .title {
      flex: 1;
      margin: 0;
      font-size: 18px;
      color: #323233;
      line-height: 1.4;
      font-weight: bold;
    }

    .price-box {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin-left: 12px;

      .price-label {
        font-size: 12px;
        color: #969799;
      }
      .price-value {
        font-size: 18px;
        font-weight: bold;
        color: #ff5722;
        margin-top: 2px;
      }
    }
  }

  .card-body {
    .content-desc {
      margin: 0;
      font-size: 14px;
      color: #646566;
      line-height: 1.6;
    }
  }
}

.detail-cells {
  margin-top: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

/* 底部操作栏 */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  padding: 10px 16px 20px;
  box-sizing: border-box;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 99;
}

/* 报价弹窗 */
.valuation-popup {
  width: 90%;
  max-width: 340px;
}

.valuation-form {
  padding: 24px 20px;
  text-align: center;

  h3 {
    margin: 0;
    font-size: 18px;
    color: #323233;
  }
  .subtitle {
    margin: 6px 0 20px;
    font-size: 12px;
    color: #969799;
  }

  .price-input {
    background-color: #f7f8fa;
    border-radius: 8px;
    margin-bottom: 24px;
  }
}
</style>