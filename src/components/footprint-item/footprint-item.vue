<template>
  <view class="item" hover-class="item-hover" @click="goFootprintDetail">
    <view class="item-title">
      <view class="item-title-type">{{ getType() }}</view>
    </view>
    <view class="item-info">
      <view class="item-info-photo">
        <image :src="item.photo"/>
      </view>
      <view class="item-info-content">
        <view class="item-name">{{ item.name }}</view>
        <view class="item-desc">{{ item.desc }}</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'vue-property-decorator'

@Component({
  name: 'FootprintItem'
})
export default class FootprintItem extends Vue {
  @Prop({ type: Object })
  item!: any

  /**
   * 获取目击类别
   */
  getType () {
    for(let onetype of this.$store.state.footprintTypes){
      if(this.item.type === onetype.code){
        return onetype.name
      }
    }
    return '未知上报' + this.item.type
  }

  goFootprintDetail () {
    if (this.item.id) {
      uni.navigateTo({
        url: `/pages/footprint-detail/footprint-detail?id=${this.item.id}`
      })
    }
  }

}
</script>

<style lang="scss">
.item {
  background: #FFFFFF;
  margin-bottom: 10rpx;
  border-radius: 8rpx;

  &.item-hover {
    background: #FAFAFA;
  }

  .item-title {
    position: relative;
    width: 100%;
    height: 88rpx;
    border-bottom: 2rpx solid #F2F3FA;

    .item-title-type {
      position: absolute;
      top: 50%;
      right: 32rpx;
      padding: 0 14rpx;
      height: 44rpx;
      background: rgba(255, 165, 63, 0.3);
      border-radius: 8rpx;
      font-size: 24rpx;
      font-weight: 400;
      color: rgba(255, 165, 63, 1);
      line-height: 44rpx;
      transform: translateY(-50%);
    }
  }

  .item-info {
    position: relative;
    padding: 20rpx 30rpx;
    width: 100%;
    height: 136rpx;

    .item-info-photo {
      position: absolute;
      top: 50%;
      left: 30rpx;
      width: 96rpx;
      height: 96rpx;
      transform: translateY(-50%);

      image {
        width: 100%;
        height: 100%;
        border-radius: 10rpx;
      }
    }

    .item-info-content {
      position: absolute;
      top: 50%;
      right: 30rpx;
      width: calc(100% - 186rpx);
      height: 96rpx;
      transform: translateY(-50%);

      .item-name {
        font-size: 30rpx;
      }

      .item-desc {
        font-size: 26rpx;
        margin-top: 12rpx;
        color: #B2B2B2;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .item-buttons {
    text-align: right;
    padding: 20rpx 30rpx;

    .item-button {
      width: 142rpx;
      height: 64rpx;
      margin-left: 16rpx;
      border-radius: 64rpx;
    }
  }
}
</style>
