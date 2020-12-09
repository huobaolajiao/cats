import BaseService from '@/api/base'

/**
 * 用户相关接口
 */
export default class UsersService extends BaseService {
  /**
   * 登录
   */
  async login(data: any) {
    const { code, nickName, avatar } = data
    const result: any = await this.callFunction('users', 'login', { code, nickName, avatar })
    if (result.code === 0) {
      return result.data
    }
    return -1
  }
  
  /**
   * 查昵称和头像
   */
  async nameAndAvatar(id: string){
    const result: any = await this.callFunction('users', 'nameAndAvatar', { id })
    console.log(result)
    if (result.code === 0) {
      return this.parseItem(result.data)
    }
    return -1
  }
}
