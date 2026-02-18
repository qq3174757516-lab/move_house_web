<template>
  <div class='layout'>
    <van-nav-bar fixed :title='$route.meta.title || "搬家助手"' left-arrow @click-left='$router.back()' />

    <div class='layout-main'>
      <router-view />
    </div>

    <van-tabbar v-show='!$route.meta.hideTabbar' fixed v-model='active' route>
      <van-tabbar-item icon='home-o' to='/index'>首页</van-tabbar-item>
      <van-tabbar-item icon='cart-o' to='/order'>订单</van-tabbar-item>
      <van-tabbar-item icon='user-o' to='/user'>个人中心</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
export default {
  data() {
    return {
      active: 0
    }
  }
}
</script>



<style lang='scss' scoped>
.layout {
  overflow-y: hidden; /* 外层禁止滚动，固定住上下导航栏 */
}

.layout-main {
  width: 100vw;
  height: calc(100vh - 96px); /* 减去顶部导航和底部菜单的高度 */
  margin-top: 46px;
  margin-bottom: 50px;
  background-color: #f1f1f1;

  /* 核心修复：允许这块核心区域在 Y轴(上下) 出现滚动条 */
  overflow-y: auto;
  /* 平滑滚动（针对移动端触屏的优化） */
  -webkit-overflow-scrolling: touch;
}
</style>