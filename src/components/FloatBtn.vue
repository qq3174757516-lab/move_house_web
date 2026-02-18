<template>
  <div class='float-btn' v-show='show'>
    <van-icon :name='icon' />
    <span>{{ text }}</span>
  </div>
</template>

<script>
export default {
  props: {
    show: {
      required: false,
      type: Boolean,
      default: true
    },
    text: {
      required: true,
      type: String
    },
    icon: {
      required: false,
      type: String,
      default: 'share-o'
    }
  }
}
</script>

<style lang='scss' scoped>
.float-btn {
  z-index: 10;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 80px;
  right: 20px;
  border: 0.5px solid #1989fa;
  background-color: rgba(25, 137, 250, .05);
  color: #1989fa;
  border-radius: 8px;
  font-size: 12px;
  padding: 8px 15px;

  .van-icon {
    margin-right: 5px;
    font-size: 16px;
  }
}
</style>