<template>
  <div class='container'>
    <div class='title'>
      投诉数量: {{ user.complaintNum }}
    </div>
    <div v-if='complaintList.length > 0' class='complaint-list'>
      <div class='complaint-item' v-for='item in complaintList' :key='item.id'>
        <div class='complaint-tip'>
          <span>投诉用户: {{ item.username }}</span>
          <span>投诉时间: {{ item.createTime }}</span>
        </div>
        <p>{{ item.reason }}</p>
        <div class='complaint-imgs'>
          <van-image v-for='img in item.imgArr' :src='img' @click='onPreview(item.imgArr)' />
        </div>
      </div>
    </div>
    <van-empty v-else>做的很好, 您还没有投诉哦</van-empty>
  </div>
</template>

<script>
import { pageComplaintApi } from '@/api/complaint'
import { infoDriverApi } from '@/api/driver'
import { ImagePreview } from 'vant'

export default {
  data() {
    return {
      complaintList: [],
      user: {}
    }
  },
  methods: {
    onPreview(imgArr) {
      ImagePreview(imgArr)
    },
    async listComplaint() {
      const { data } = await pageComplaintApi({ current: 1, size: 9999 })
      data.rows.forEach(item => {
        item.imgArr = item.imgs.split(',').map(img => this.$baseUrl + img)
      })
      this.complaintList = data.rows
    },
    async infoDriver() {
      const { data } = await infoDriverApi()
      this.user = data
    }
  },
  mounted() {
    this.infoDriver()
    this.listComplaint()
  }
}
</script>

<style lang='scss' scoped>
.title {
  display: inline-block;
  width: 100%;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  margin: 15px 0;
  color: red;
}

.complaint-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
  overflow: auto;
  padding-bottom: 60px;

  .complaint-item {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: white;
    border-radius: 10px;
    margin-bottom: 10px;
    padding: 15px;

    .complaint-tip {
      width: 100%;
      display: flex;
      justify-content: space-between;
      color: gray;
    }

    .complaint-imgs {
      width: 100%;
      display: flex;

      .van-image {
        width: 150px;
        margin-right: 10px;
      }
    }

    p {
      width: 100%;
      margin: 10px 0;
    }
  }
}

.container {
  width: 100%;
  height: 100%;
  padding: 0 15px;
}
</style>