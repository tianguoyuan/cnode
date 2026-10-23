import type { CnodeUser } from '@/service/cnode/types'

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    /** CNode accesstoken，所有需要登录的接口都靠它鉴权 */
    const accesstoken = ref('')
    /** 当前登录用户信息 */
    const userInfo = ref<CnodeUser | null>(null)

    const isLogin = computed(() => {
      return !!accesstoken.value
    })

    /** 当前用户是否被禁言 */
    const isMuted = computed(() => {
      return !!userInfo.value?.is_muted
    })

    /** 当前用户是否被封禁 */
    const isBlock = computed(() => {
      return !!userInfo.value?.is_block
    })

    function setAccesstoken(v: string) {
      accesstoken.value = v
    }

    function setUserInfo(v: CnodeUser | null) {
      userInfo.value = v
    }

    function clearUserInfo() {
      accesstoken.value = ''
      userInfo.value = null
    }

    return {
      accesstoken,
      clearUserInfo,
      isBlock,
      isLogin,
      isMuted,
      setAccesstoken,
      setUserInfo,
      userInfo,
    }
  },
  {
    persist: true,
  },
)
