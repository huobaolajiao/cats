<template>
  <view class="container">
    <scroll-view :scroll-y="true" style="height: 100vh;">
      <loading :show="!isInit" height="100rpx"/>
      <view class="cat-detail" v-if="detail">
        <!-- 照片 -->
        <view class="item-photo">
          <image mode="aspectFill" :src="detail.photo"/>
        </view>
        <view class="item-info-photo">
          <image :src="nAA.avatar"/>
        </view>
        <view class="nickName">{{ nAA.nickName }}  上报情况：{{ detail.desc }}</view>
        <view class="locname">地址：{{ detail.location.name }}:</view>
        <view class="lat">{{ detail.location.latitude }},</view>
        <view class="lon">{{ detail.location.longitude }}</view>
        
        <view style="width: 100%; height: env(safe-area-inset-bottom); padding-top: 40rpx;"></view>
      </view>
      <page-status v-if="isError" :status="1" message="喵星信号中断 请重试" :showButton="true" @reload="loadDetail"/>
    </scroll-view>
  </view>
</template>

<script lang="ts">
import { Component, Provide, Mixins } from 'vue-property-decorator'
import Share from '@/mixins/share'
import Loading from '@/components/loading/loading.vue'
import PageStatus from '@/components/page-status/page-status.vue'
import { Footprints ,Cats, Users} from '@/api'

@Component({
  name: 'Detail',
  components: { Loading, PageStatus }
})
export default class Detail extends Mixins(Share) {
  @Provide()
  detail: any = null
  
  @Provide()
  nAA: any = null

  @Provide()
  isInit = false

  @Provide()
  isError = false

  @Provide()
  id?: string

  async onLoad (options: any) {
    const { id} = options
    this.id=id
    this.isInit = false
    this.$nextTick(() => {
      this.loadDetail(id)
    })
  }

  async loadDetail (id: string) {
    const detail = await Footprints.detail(id)
    console.log(detail.openId)
    const nAA = await Users.nameAndAvatar(detail.openId)
    console.log(nAA)
    this.isInit = true
    if (detail !== -1) {
      this.detail = detail
      this.nAA=nAA[0]
      uni.setNavigationBarTitle({
        title: decodeURIComponent(await this.getName()+'的情况')
      })
    } else {
      this.isError = true
    }
  }
  /**
   * 获取名字
   */
  async getName () {
    const detail = await Cats.detail(this.detail.catId)
    return detail.name
  }

}
</script>

<style lang="scss">
.cat-detail {
  .item-info-photo {
      width: 96rpx;
      height: 96rpx;

      image {
        width: 100%;
        height: 100%;
        border-radius: 10rpx;
      }
    }
  .item-photo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 30rpx 0;

    image {
      width: calc(100vw - 60rpx);
      height: calc(80vw - 60rpx);
      border-radius: 10rpx;
    }
  }



}
</style>
