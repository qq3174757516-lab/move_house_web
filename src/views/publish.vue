<template>
  <div class='container'>
    <van-swipe loop :autoplay='2000' show-indicators>
      <van-swipe-item v-for='(image, index) in publish.imgArr' :key='index'>
        <van-image :src='$baseUrl + image' width='100%' :height='230' />
      </van-swipe-item>
    </van-swipe>

    <van-cell-group inset>
      <van-cell :title='publish.title' :label='publish.content'>
        <template #right-icon>
          <p class='price'>价格: {{ publish.valuation ? '¥' + publish.valuation?.toFixed(2) : '未出价'
            }}</p>
        </template>
      </van-cell>
      <van-cell title='地址' :value='publish.address' />
      <van-cell title='发布者' :value='publish.username' />
      <van-cell title='发布时间' :value='publish.createTime' />
    </van-cell-group>

    <van-button class='sbtn' v-if='user.userType === 2 && publish.status === 0' round type='primary'
                @click='onValuation(publish.id)'>
      接单
    </van-button>
    <van-button class='sbtn' v-else-if='publish.status === 1' round type='info'>已接单</van-button>
    <van-button class='sbtn' v-else-if='publish.status === 2' round>已完成</van-button>


    <van-popup v-model='valuationShow' style='border-radius: 15px;overflow: hidden'>
      <div style='padding: 15px'>
        <van-field
          label-width='50px'
          v-model='valuationForm.valuation'
          type='number'
          label='价格'
          placeholder='价格'
          :rules="[{ required: true, message: '请填写价格' }]"
        >
          <template #right-icon>
            <span>元</span>
          </template>
        </van-field>
        <van-button @click='valuationSubmit' size='small' type='info' round block>提交</van-button>
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
  processPublishApi, findPublishApi
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
.sbtn {
  margin: 0 15px;
}

.price {
  font-size: 14px;
  font-weight: 700;
  color: #f39c12;
}

.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>
