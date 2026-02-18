<template>
  <div class="address-container">
    <van-nav-bar title="地址管理" left-arrow @click-left="$router.back()" fixed placeholder />

    <van-address-list
      v-model="chosenAddressId"
      :list="addressList"
      default-tag-text="默认"
      @add="onAdd"
      @edit="onEdit"
      class="custom-address-list"
    >
      <template #top v-if="addressList.length === 0">
        <van-empty description="您还没有添加过地址哦" />
      </template>
    </van-address-list>

    <van-popup v-model="showEdit" position="bottom" round class="edit-popup">
      <div class="popup-header">
        <h3>{{ form.id ? '编辑地址' : '新增地址' }}</h3>
      </div>
      <van-address-edit
        :area-list="areaList"
        :address-info="form"
        show-postal
        show-delete
        show-set-default
        :area-columns-placeholder="['请选择', '请选择', '请选择']"
        @save="onSave"
        @delete="onDelete"
      />
    </van-popup>
  </div>
</template>

<script>
import { listAddressApi, saveAddressApi, deleteAddressApi } from '@/api/address'
import { areaList } from '@vant/area-data' // 需要 npm install @vant/area-data

export default {
  data() {
    return {
      areaList,
      chosenAddressId: '1',
      addressList: [],
      showEdit: false,
      form: {}
    }
  },
  methods: {
    async loadList() {
      const { data } = await listAddressApi()
      this.addressList = data.map(item => ({
        id: item.id,
        name: item.name,
        tel: item.phone,
        address: `${item.province}${item.city}${item.county} ${item.addressDetail}`,
        isDefault: item.isDefault,
        // 保留原始数据用于编辑回显
        province: item.province,
        city: item.city,
        county: item.county,
        addressDetail: item.addressDetail
      }))
    },
    onAdd() {
      this.form = { name: '', tel: '', province: '', city: '', county: '', addressDetail: '', isDefault: false }
      this.showEdit = true
    },
    onEdit(item) {
      this.form = { ...item }
      this.showEdit = true
    },
    async onSave(content) {
      const payload = {
        id: content.id,
        name: content.name,
        phone: content.tel,
        province: content.province,
        city: content.city,
        county: content.county,
        addressDetail: content.addressDetail,
        isDefault: content.isDefault
      }
      await saveAddressApi(payload)
      this.$toast.success('保存成功')
      this.showEdit = false
      this.loadList()
    },
    async onDelete(content) {
      if(content.id) {
        await deleteAddressApi(content.id)
        this.$toast.success('删除成功')
        this.showEdit = false
        this.loadList()
      }
    }
  },
  mounted() {
    this.loadList()
  }
}
</script>

<style scoped>
.address-container { min-height: 100vh; background-color: #f7f8fa; }
.edit-popup { max-height: 90vh; }
.popup-header { text-align: center; padding: 15px 0; font-size: 16px; font-weight: bold; border-bottom: 1px solid #eee; }
</style>