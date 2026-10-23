import { PageEnum } from '@/enums/PageEnum'
import { useUserStore } from '@/store'

/** 跳转话题详情 */
export function goTopicDetail(id: string) {
  if (!id) return
  uni.navigateTo({ url: `${PageEnum.TOPIC_DETAIL_PATH}?id=${id}` })
}

/** 跳转用户主页 */
export function goUserDetail(loginname?: string) {
  if (!loginname) return
  uni.navigateTo({ url: `${PageEnum.USER_DETAIL_PATH}?loginname=${encodeURIComponent(loginname)}` })
}

/** 跳转用户内容列表 */
export function goUserList(loginname: string, type: 'topics' | 'replies' | 'collections') {
  uni.navigateTo({
    url: `${PageEnum.USER_LIST_PATH}?loginname=${encodeURIComponent(loginname)}&type=${type}`,
  })
}

/** 跳转登录页 */
export function goLogin(redirect?: string) {
  const query = redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''
  uni.navigateTo({ url: `${PageEnum.LOGIN_PATH}${query}` })
}

/**
 * 需要登录的操作前置校验
 * @returns 是否已登录
 */
export function requireLogin(): boolean {
  const userStore = useUserStore()
  if (userStore.isLogin) return true

  uni.showModal({
    cancelText: '再逛逛',
    confirmText: '去登录',
    content: '该操作需要登录后才能继续',
    success(res) {
      if (res.confirm) goLogin()
    },
    title: '提示',
  })
  return false
}
