import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/index',
    component: () => import('@/components/Layout.vue'),
    children: [{
      path: '/index',
      component: () => import('@/views')
    }, {
      path: '/publish/:id',
      component: () => import('@/views/publish.vue'),
      meta: { title: '发布详情' }
    },{
      path: '/user',
      component: () => import('@/views/user.vue'),
      meta: { title: '用户中心' }
    }, {
      path: '/order',
      component: () => import('@/views/order.vue'),
      meta: { title: '订单' }
    }, {
      path: '/complaint',
      component: () => import('@/views/complaint.vue'),
      meta: { title: '我的投诉' }
    }, {
      // 新增地址簿路由，隐藏底部导航栏
      path: '/address',
      component: () => import('@/views/address.vue'),
      meta: { title: '地址管理', hideTabbar: true }
    }]
  }, {
    path: '/login',
    component: () => import('@/views/login.vue')
  }
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

export default router