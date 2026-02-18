<template>
  <div class="complaint-container">
    <div class="header-stats" :class="user.complaintNum === 0 ? 'is-excellent' : 'is-warning'">
      <div class="stat-box">
        <span class="label">累计被投诉次数</span>
        <span class="value">{{ user.complaintNum || 0 }}</span>
      </div>
      <p class="stat-desc" v-if="user.complaintNum === 0">保持得非常完美，继续加油！</p>
      <p class="stat-desc" v-else>请注意服务质量，减少客诉哦</p>
    </div>

    <div class="complaint-list" v-if="complaintList.length > 0">
      <div class="complaint-card" v-for="item in complaintList" :key="item.id">
        <div class="card-header">
          <div class="user-info">
            <van-icon name="user-circle-o" color="#1989fa" size="18" />
            <span class="name">投诉用户: {{ item.username }}</span>
          </div>
          <span class="time">{{ item.createTime }}</span>
        </div>

        <div class="card-body">
          <div class="reason-box">
            <van-icon name="warning-o" color="#ee0a24" class="quote-icon"/>
            <p class="reason-text">{{ item.reason }}</p>
          </div>

          <div class="imgs-grid" v-if="item.imgArr && item.imgArr.length > 0">
            <van-image
              v-for="(img, idx) in item.imgArr"
              :key="idx"
              :src="img"
              radius="8px"
              class="grid-img"
              fit="cover"
              @click="onPreview(item.imgArr, idx)"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <van-empty
        class="custom-empty"
        image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
        description="做得很好，您目前没有任何客诉记录哦！"
      />
    </div>
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
    // 预览图片，startPosition 确保点哪张就先放大哪张
    onPreview(imgArr, startPosition = 0) {
      ImagePreview({
        images: imgArr,
        startPosition: startPosition,
        closeable: true
      })
    },
    async listComplaint() {
      const { data } = await pageComplaintApi({ current: 1, size: 9999 })
      data.rows.forEach(item => {
        // 增加容错，防止 imgs 为空时 split 报错
        item.imgArr = item.imgs ? item.imgs.split(',').filter(i => i).map(img => this.$baseUrl + img) : []
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

<style lang="scss" scoped>
.complaint-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 40px;
}

/* 顶部看板样式 */
.header-stats {
  padding: 40px 20px 60px; /* 底部多留白，给卡片悬浮用 */
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  transition: background 0.3s;

  &.is-excellent {
    background: linear-gradient(135deg, #07c160 0%, #38f9d7 100%);
  }

  &.is-warning {
    background: linear-gradient(135deg, #ff6034 0%, #ee0a24 100%);
  }

  .stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;

    .label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 8px;
    }

    .value {
      font-size: 40px;
      font-weight: bold;
      line-height: 1;
      font-family: Arial, Helvetica, sans-serif;
    }
  }

  .stat-desc {
    margin: 12px 0 0;
    font-size: 13px;
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: 20px;
  }
}

/* 列表容器 */
.complaint-list {
  margin: -30px 16px 20px; /* 负边距悬浮效果 */
  position: relative;
  z-index: 10;
}

/* 卡片样式 */
.complaint-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px dashed #ebedf0;
    padding-bottom: 12px;
    margin-bottom: 12px;

    .user-info {
      display: flex;
      align-items: center;

      .name {
        margin-left: 6px;
        font-size: 14px;
        color: #323233;
        font-weight: 500;
      }
    }

    .time {
      font-size: 12px;
      color: #969799;
    }
  }

  .card-body {
    .reason-box {
      display: flex;
      align-items: flex-start;
      background-color: #fffbe8;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;

      .quote-icon {
        margin-top: 2px;
        margin-right: 8px;
        font-size: 16px;
      }

      .reason-text {
        margin: 0;
        font-size: 13px;
        color: #ed6a0c;
        line-height: 1.5;
        flex: 1;
      }
    }

    /* 图片网格排列 */
    .imgs-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .grid-img {
        width: calc((100% - 20px) / 3); /* 每行 3 张图 */
        aspect-ratio: 1 / 1; /* 保证正方形 */
        border: 1px solid #f5f6f7;
      }
    }
  }
}

.empty-state {
  margin-top: 30px;
}
</style>