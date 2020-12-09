<template>
    <view class="container">
        <view v-if="!isError">
            <scroll-view :scroll-y="true" style="height: calc(100vh - 140rpx - env(safe-area-inset-bottom));">
                <!-- 足迹类型 -->
                <view class="cu-form-group toptype">
                    <view class="title">类型</view>
                    <picker :value="typeIndex" :range="types" @change="typeChange">
                        <view class="picker">
                            {{ typeIndex >-1 ? types[typeIndex] : '选择类型' }}
                        </view>
                    </picker>
                </view>
                <!-- 位置 -->
                <view class="cu-form-group">
                    <view class="title">位置</view>
                    <input class="location" placeholder="为了保护流浪猫 位置信息仅对管理员可见" :disabled="true" :value="location.name" @click="changeLocation" />
                    <text class='cuIcon-locationfill text-orange' @click="changeLocation" />
                </view>
                <!-- 描述 -->
                <view class="cu-form-group margin-top">
                    <textarea placeholder="简单描述一下你看到的情况或投喂情况" :value="desc" @input="descInput" />
                    </view>
        <!-- 照片 -->
        <view class="cu-bar bg-white margin-top bar-border">
          <view class="action">照片</view>
        </view>
        <view class="cu-form-group photo-view" @click="checkphoto">
          <img :src="photo" mode="scaleToFill"/>
          <view v-if="photo.length === 0" class="photo-edit cuIcon-cameraadd"/>
        </view>
      </scroll-view>

      <!-- 提交按钮 -->
      <view class="buttons padding">
        <button class="cu-btn block bg-orange lg" open-type="getUserInfo" @click="submitFootprint">上报情况</button>
      </view>
    </view>
    <page-status v-if="isError" :status="1" message="喵星信号中断 请重试"/>
  </view>
</template>


<script lang="ts">
import { Component, Provide, Vue } from 'vue-property-decorator'
import PageStatus from '@/components/page-status/page-status.vue'
import ImageCropper from '@/components/image-cropper/image-cropper.vue'
import AttributeModal from '@/components/attribute-modal/attribute-modal.vue'
import { Categories, Security, Footprints, Cats, Users } from '@/api'

@Component({
  name: 'AddFootprint',
  components: { PageStatus, ImageCropper, AttributeModal }
})
export default class AddFootprint extends Vue {
  @Provide()
  isError = false

  @Provide()
  id = ''

  // 分类下标
  @Provide()
  typeIndex = -1

  // 分类名称
  @Provide()
  type = ''

  // 位置
  @Provide()
  location: any = {}

  // 纬度
  @Provide()
  latitude!: number

  // 经度
  @Provide()
  longitude!: number

  // 描述
  @Provide()
  desc = ''

  // 照片
  @Provide()
  photo = ''

  @Provide()
  submitStatus = false

  // 分类列表
  get types () {
    return this.$store.state.footprintTypes.map((type: any) => {
      return type.name
    })
  }

  async onLoad (options: any) {
    uni.setNavigationBarTitle({
      title: decodeURIComponent('情况上报')
    })
    const { id } = options
    this.id=id
    uni.getLocation({
      type: 'gcj02',
      altitude: true,
      isHighAccuracy: true,
      highAccuracyExpireTime: 3500,
      success: result => {
        this.latitude = result.latitude
        this.longitude = result.longitude
      }
    })

    uni.login({
      success: async result => {
        wx.getSetting({
          success (res){
          if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function(res) {
              wx.setStorageSync('nickName', res.userInfo.nickName);
              wx.setStorageSync('avatar', res.userInfo.avatarUrl);
            }
          })
          }else{
            wx.setStorageSync('nickName', '');
            wx.setStorageSync('avatar', '');
          }
        }
        })
        console.log({ code: result.code,nickName: wx.getStorageSync('nickName'),avatar: wx.getStorageSync('avatar')})
        const userInfo = await Users.login({ code: result.code,nickName: wx.getStorageSync('nickName'),avatar: wx.getStorageSync('avatar')})
        if (userInfo === -1) {
          this.isError = true
          return
        }
        this.$store.commit('setUserInfo', userInfo)},
      fail: () => {
        this.isError = true
      }
    })
  }

  /**
   * 分类选择
   */
  typeChange (event: any) {
    const index = event.detail.value
    this.type = this.$store.state.footprintTypes[index].code
    this.typeIndex = index
  }

  /**
   * 选择位置
   */
  changeLocation () {
    uni.chooseLocation({
      latitude: this.latitude,
      longitude: this.longitude,
      success: result => {
        this.location = result
        
      }
    })
  }

  /**
   * 描述输入
   */
  descInput (event: any) {
    this.desc = event.detail.value
  }

  /**
   * 选择照片
   */
  checkphoto () {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (result: any) => {
        this.photo = result.tempFilePaths[0]
      }
    })
  }




  /**
   * 提交初审(用户友好修改为上传)
   */
  async submitCheck () {
    // 表单校验
    if (this.validation()) {
      uni.showLoading({
        mask: true,
        title: '上传中...'
      })
      // 安全检查
      if (await this.securityCheck()) {
        this.submitStatus = true
        uni.showToast({
          icon: 'success',
          title: '上传完成',
          duration: 3000
        })
      }else{
        return false
      }
    }else{
      return false
    }
    return true
  }

  /**
   * 表单校验
   */
  validation () {

    if (this.isEmpty(this.type)) {
      this.showError('选择目击分类')
      return false
    }

    if (this.isEmpty(this.location.name)) {
      this.showError('选择一下猫咪的位置')
      return false
    }

    if (this.isEmpty(this.desc)) {
      this.showError('简单描述一下情况')
      return false
    }

    if (this.isEmpty(this.photo)) {
      this.showError('上传一个照片')
      return false
    }

    return true
  }

  /**
   * 安全检查
   */
  async securityCheck () {
    if (!await this.contentSecurityCheck(this.desc)){
        this.showError('描述不合法请修改')
        return false
     
    }

    const photoCheckResult = await this.imageSecurityCheck(this.photo)
    if (photoCheckResult === false) {
      this.showError('照片不合法请修改')
      return false
    } else if (photoCheckResult !== true) {
      this.photo = photoCheckResult
    }
     return true
  }
 /**
   * 图片安全检查
   */
  async imageSecurityCheck (image: string) {
    if (image.indexOf('cloud://') !== -1) {
      return true
    } else {
      var result = await Security.imgSecCheck(image)
      if (result.status === 0) {
        console.log('图片检查合法', result.url)
        return result.url
      } else {
        console.log('图片检查不合法', result.url)
        result = await Security.imgSecCheck(image)
        if (result.status === 0) {
          console.log('图片检查合法', result.url)
          return result.url
        } else {
          console.log('图片检查不合法', result.url)
          return false
      }
      }
    }
  }

  

  /**
   * 文本安全检查
   */
  async contentSecurityCheck (content: string) {
    const result = await Security.msgSecCheck(content)
    if (result.status === 0) {
      console.log('文本检查合法', content)
      return true
    } else {
      console.log('文本检查不合法', content)
      return false
    }
  }

  
  /**
   * 判断是否为空
   */
  isEmpty (val: string) {
    if (val === null || val === undefined || val.length === 0) {
      return true
    }
    return false
  }

  /**
   * 显示错误信息
   */
  showError (title: string) {
    uni.showToast({
      icon: 'none',
      title: title,
      duration: 3000
    })
  }

  /**
   * 提交目击猫咪信息
   */
  async submitFootprint () {
    if (await this.submitCheck() === false) return 
    uni.showLoading({
      mask: true,
      title: '提交中...'
    })
    const data = {
      catId: this.id,
      name: await this.getName(),
      type: this.type,
      location: this.location,
      desc: this.desc,
      photo: this.photo
    }
    const respone = await Footprints.create(data)
    if (respone !== -1) {
      uni.navigateBack({
        delta: 1
      })
    } else {
      this.showError('发生错误 请重试')
    }
  }
  /**
   * 获取名字
   */
  async getName () {
    const detail = await Cats.detail(this.id)
    return detail.name
  }


}
</script>

<style lang="scss">
.container {
  height: 100vh;

  .location {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .photo-view {
    padding: 30rpx;
    width: 100vw;
    height: calc(100vw * 0.8);

    image {
      width: 100%;
      height: 100%;
    }

    .photo-edit {
      display: flex;
      justify-content: center;
      align-items: center;
      width: calc(100% - 60rpx);
      height: 200rpx;
      line-height: 200rpx;
      position: absolute;
      margin: 0 auto;
      font-size: 80rpx;

      &.iconfont {
        font-size: 80rpx;
        color: #666666;
      }
    }
  }


  .bar-border {
    border-bottom: 1rpx solid #EEEEEE;
  }

  .submit-modal {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: calc(100vh - 140rpx - env(safe-area-inset-bottom));
    opacity: 0.8;
    z-index: 9999;
    background-color: #F7F2EE;
  }

  .buttons {
    z-index: 0;
  }
}
</style>
