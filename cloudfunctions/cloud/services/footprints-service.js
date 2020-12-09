/* eslint-disable @typescript-eslint/no-var-requires */
const BaseService = require('./base-service')
const { v4: uuidv4 } = require('uuid')
const moment = require('moment')

/**
 * 提交相关接口
 */
class FootprintsService extends BaseService {
  /**
   * 查询上报列表
   * @param {*} data
   * @param {*} context
   */
  async list(data, context) {
    const { catId, pageIndex, pageSize } = data
    let collection = global.db.collection('footprints')
    var where={}
    if (catId === ''){
      where={
        isHide: global._.neq(true),
        isDelete: global._.neq(true)
      }
    }else{
      where={
        isHide: global._.neq(true),
        isDelete: global._.neq(true),
        catId: catId
      }
    }
    
    
    if (pageSize && pageSize !== -1) {
      collection = collection
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
    }

    const result = await collection
      .where(where)
      .field({
        _id: true,
        type: true,
        desc: true,
        photo: true,
        catId: true,
        name: true,
        location: true
      })
      .orderBy('updateTime', 'desc')
      .get()
      .then(result => this.success(result.data))
      .catch(() => this.fail([]))

    if (pageSize && pageSize !== -1) {
      const total = await collection
        .where(where)
        .count()
        .then(result => { return result.total })
        .catch(() => { return -1 })

      result.total = total
    }
    return { data: result }
  }

  /**
   * 查询上报目击或喂养详细
   * @param {*} data
   */
  async detail(data) {
    const { id } = data
    const collection = global.db.collection('footprints')
    var result = await collection
      .doc(id)
      .get()
      .then(result => this.success(result.data))
      .catch(() => this.fail({}))
    return { data: result }
  }

  /**
   * 上报目击足迹或喂食信息
   * @param {*} data
   * @param {*} context
   */
  async create(data, context) {
    const { photo } = data
    // 保存照片
    data.photo = await this.saveFile(photo, `cats/footprints/${uuidv4()}.jpg`)

    const collection = global.db.collection('footprints')
    const result = await collection
      .add({
        data: {
          ...data,
          status: 0,
          openId: context.OPENID,
          ...this.defaultValue()
        }
      })
      .then(result => this.success(result._id))
      .catch(() => this.fail({}))

    return { data: result }
  }

  /**
   * 保存图片
   * @param {*} url
   * @param {*} cloudPath
   */
  async saveFile(url, cloudPath) {
    if (url.indexOf('cloud://') !== -1) {
      return url
    }
    // 下载文件
    const buffer = await this.downloadFile(url)
    return (await global.cloud.uploadFile({
      cloudPath: cloudPath,
      fileContent: buffer
    })).fileID
  }

}

module.exports = FootprintsService
