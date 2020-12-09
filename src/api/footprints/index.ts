import BaseService from '@/api/base'

/**
 * 提交相关接口
 */
export default class FootprintsService extends BaseService {
  /**
   * 查询上报列表
   */
  async list({ catId, pageIndex, pageSize }: any) {
    const result: any = await this.callFunction('footprints', 'list', { catId, pageIndex, pageSize })
    if (result.code === 0) {
      return result.data.map((footprint: any) => {
        return this.parseItem(footprint)
      })
    }
    return -1
  }

  /**
   * 上报猫咪
   */
  async create(data: any) {
    const result: any = await this.callFunction('footprints', 'create', data)
    if (result.code === 0) {
      return result.data
    }
    return -1
  }

  /**
   * 获取上报详情
   */
  async detail(id: string) {
    const result: any = await this.callFunction('footprints', 'detail', { id })
    if (result.code === 0) {
      return this.parseItem(result.data)
    }
    return -1
  }

}
