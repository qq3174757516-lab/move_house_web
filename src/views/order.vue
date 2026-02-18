<template>
  <div class='order-container'>

    <div v-if='orderList.length > 0' class='order-list'>
      <div class='order-card' v-for='order in orderList' :key='order.id'>

        <div class='card-header'>
          <div class="order-no">
            <van-icon name="orders-o" />
            <span>订单号: {{ order.orderNo }}</span>
          </div>
          <span class="time">{{ order.createTime }}</span>
        </div>

        <div class='card-body'>
          <div class='info-row'>
            <div class="person">
              <van-icon name="user-circle-o" color="#1989fa" />
              <span>用户: {{ order.username }}</span>
            </div>
            <div class="person">
              <van-icon name="logistics" color="#07c160" />
              <span>司机: {{ order.driverName }}</span>
            </div>
          </div>
          <div class="address-row">
            <van-icon name="location-o" color="#ee0a24" />
            <span>{{ order.address }}</span>
          </div>
          <div class="price-row">
            <span class="label">订单金额:</span>
            <span class="price-val">¥{{ order.price.toFixed(2) }}</span>
          </div>
        </div>

        <div class="card-footer">
          <div class='action-btns' v-if='user.userType === 3'>
            <van-button round plain v-if='order.status === 0' type='info' size='small' @click='onArrive(order.id)'>
              确认司机已到达
            </van-button>
            <van-button round v-else-if='order.status === 1' type='primary' size='small' @click='onFinish(order.id)'>
              确认搬家完毕
            </van-button>
            <van-button round plain v-else-if='!order.isComplaint' type='danger' size='small' @click='onComplaint(order)'>
              申请售后/投诉
            </van-button>
            <van-button round disabled v-else type='danger' size='small'>订单已投诉</van-button>
          </div>

          <div class='status-tags' v-if='user.userType === 2'>
            <van-tag round plain v-if='order.status === 0' type='primary' size="medium">待用户确认您已到达</van-tag>
            <van-tag round plain v-else-if='order.status === 1' type='success' size="medium">待用户确认订单完成</van-tag>
            <van-tag round v-else-if='!order.isComplaint' type='success' size="medium">订单已完成</van-tag>
            <van-tag round v-else type='danger' size="medium">用户已投诉</van-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-if='orderList.length === 0'>
      <van-empty image="error" description="您目前还没有任何订单记录哦" />
    </div>

    <van-popup v-model='popupShow' round class="complaint-popup">
      <div class='form-wrapper'>
        <div class='form-header'>
          <h3>订单投诉</h3>
          <p class="subtitle">请客观填写投诉原因，我们将尽快处理</p>
        </div>
        <van-form ref='formRef' @submit='submit' label-width='70px'>
          <van-field
            v-model='form.reason'
            type='textarea'
            rows="3"
            autosize
            label='投诉理由'
            placeholder='请详细描述您遇到的问题...'
            :rules="[{ required: true, message: '请填写投诉理由' }]"
            show-word-limit
            maxlength="200"
          />
          <van-field label='详情图片'>
            <template #input>
              <van-uploader
                v-model='form.imgArr'
                :max-count='2'
                :before-read='beforeRead'
                :after-read='afterReadImgs'
                upload-text="上传凭证"
              />
            </template>
          </van-field>
          <div class="submit-btn-wrap">
            <van-button round block type='danger' native-type='submit'>提交投诉</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { pageOrderApi, arriveOrderApi, finishOrderApi } from '@/api/order'
import { createComplaintApi } from '@/api/complaint'
import { uploadApi } from '@/api/file'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      popupShow: false,
      orderList: [],
      query: {
        current: 1,
        size: 9999
      },
      form: {
        imgArr: []
      }
    }
  },
  methods: {
    onComplaint(order) {
      this.form.driverId = order.driverId
      this.form.driverName = order.driverName
      this.form.userId = order.userId
      this.form.username = order.username
      this.form.orderId = order.id
      this.popupShow = true
    },
    async submit() {
      this.form.imgs = this.form.imgArr.map(item => item.img).join(',')
      await createComplaintApi(this.form)
      this.$toast.success('投诉成功!')
      await this.listOrder()
      this.popupShow = false
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
    async onArrive(id) {
      this.$dialog.confirm({
        title: '温馨提示',
        message: '你确认司机已经到达了吗?'
      }).then(async () => {
        await arriveOrderApi(id)
        await this.listOrder()
      }).catch(() => {
      })
    },
    async onFinish(id) {
      this.$dialog.confirm({
        title: '温馨提示',
        message: '你确认物品已经搬完了吗?'
      }).then(async () => {
        await finishOrderApi(id)
        await this.listOrder()
      }).catch(() => {
      })
    },
    async listOrder() {
      const { data } = await pageOrderApi(this.query)
      this.orderList = data.rows
    }
  },
  computed: {
    ...mapState(['user'])
  },
  mounted() {
    this.listOrder()
  }
}
</script>

<style lang='scss' scoped>
.order-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 16px;
  padding-bottom: 80px; /* 预留底部导航空间 */
  box-sizing: border-box;
}

/* 列表样式 */
.order-list {
  display: flex;
  flex-direction: column;
}

/* 订单卡片 */
.order-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

  /* 卡片头部 */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f5f6f7;
    padding-bottom: 12px;
    margin-bottom: 12px;

    .order-no {
      font-size: 13px;
      color: #323233;
      display: flex;
      align-items: center;
      font-weight: 500;

      .van-icon {
        margin-right: 4px;
        font-size: 16px;
      }
    }

    .time {
      font-size: 12px;
      color: #969799;
    }
  }

  /* 卡片主体 */
  .card-body {
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      .person {
        font-size: 14px;
        color: #323233;
        display: flex;
        align-items: center;

        .van-icon {
          margin-right: 6px;
          font-size: 16px;
        }
      }
    }

    .address-row {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 6px;
      font-size: 13px;
      color: #646566;
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
      line-height: 1.4;

      .van-icon {
        margin-top: 2px;
        margin-right: 6px;
        font-size: 16px;
      }
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .label {
        font-size: 14px;
        color: #646566;
      }

      .price-val {
        font-size: 18px;
        font-weight: bold;
        color: #ff5722;
      }
    }
  }

  /* 卡片底部按钮区 */
  .card-footer {
    border-top: 1px dashed #ebedf0;
    padding-top: 12px;
    display: flex;
    justify-content: flex-end;

    .action-btns {
      display: flex;
      gap: 10px;
    }

    .status-tags {
      display: flex;
      justify-content: flex-end;
      width: 100%;
    }
  }
}

.empty-state {
  margin-top: 50px;
}

/* 投诉弹窗样式 */
.complaint-popup {
  width: 90%;
  max-width: 400px;
  padding: 24px 20px;
  box-sizing: border-box;
}

.form-wrapper {
  .form-header {
    text-align: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 18px;
      color: #ee0a24;
    }

    .subtitle {
      margin: 6px 0 0;
      font-size: 12px;
      color: #969799;
    }
  }

  .submit-btn-wrap {
    margin-top: 24px;
  }
}
</style>