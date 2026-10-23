<script lang="ts" setup>
import type { UserDetail } from '@/service/cnode/types'

import TnIcon from '@tuniao/tnui-vue3-uniapp/components/icon/src/icon.vue'

import Navbar from '@/components/Navbar.vue'
import Tabbar from '@/components/Tabbar.vue'
import { IDENTITY_LABEL } from '@/enums/CnodeEnum'
import { PageEnum } from '@/enums/PageEnum'
import { getUserDetail } from '@/service/cnode'
import { logout } from '@/service/cnode/session'
import { useUserStore } from '@/store'
import { formatDate } from '@/utils/format'
import { goLogin, goUserDetail, goUserList } from '@/utils/nav'

const userStore = useUserStore()
const detail = ref<UserDetail | null>(null)

const loginname = computed(() => detail.value?.loginname || userStore.userInfo?.loginname || '')
const avatar = computed(() => detail.value?.avatar_url || userStore.userInfo?.avatar_url || '')

const identityText = computed(() => {
  const list = detail.value?.identities || []
  return list.map((item) => IDENTITY_LABEL[item] || item)
})

const joinText = computed(() => {
  if (!detail.value?.create_at) return ''
  return `加入于 ${formatDate(detail.value.create_at, false)}`
})

const menus = [
  { action: () => goUserList(loginname.value, 'topics'), icon: 'topics', label: '我的话题' },
  { action: () => goUserList(loginname.value, 'replies'), icon: 'message', label: '我的回复' },
  { action: () => goUserList(loginname.value, 'collections'), icon: 'star', label: '我的收藏' },
  {
    action: () => uni.navigateTo({ url: PageEnum.USER_SETTING_PATH }),
    icon: 'set',
    label: '编辑资料',
  },
  {
    action: () => uni.navigateTo({ url: PageEnum.USER_PASSWORD_PATH }),
    icon: 'password',
    label: '修改密码',
  },
  {
    action: () => uni.navigateTo({ url: `${PageEnum.USER_RANK_PATH}?type=top100` }),
    icon: 'trophy',
    label: '社区达人',
  },
  {
    action: () =>
      uni.navigateTo({
        url: `/pagesA/webview/webview?url=${encodeURIComponent('https://cnodejs.org')}`,
      }),
    icon: 'github',
    label: '关于 CNode',
  },
]

async function loadDetail() {
  if (!userStore.isLogin || !userStore.userInfo?.loginname) {
    detail.value = null
    return
  }
  try {
    const res = await getUserDetail(userStore.userInfo.loginname)
    detail.value = res.data
  } catch {
    detail.value = null
  }
}

function goSignup() {
  uni.navigateTo({ url: PageEnum.SIGNUP_PATH })
}

function onLogout() {
  uni.showModal({
    content: '确定要退出当前账号吗？',
    success: async (res) => {
      if (!res.confirm) return
      await logout()
      detail.value = null
      uni.showToast({ icon: 'none', title: '已退出登录' })
    },
    title: '退出登录',
  })
}

onShow(() => {
  loadDetail()
})
</script>

<template>
  <view class="min-h-screen bg-[#F5F7FB]">
    <Navbar title="我的" />

    <view v-if="!userStore.isLogin" class="mx-3 mt-4 rounded-4 bg-white px-6 py-10">
      <view class="flex flex-col items-center">
        <view class="h-20 w-20 flex items-center justify-center rounded-full bg-[#EAF7F5]">
          <TnIcon color="#49B9AD" name="my" size="40" />
        </view>
        <view class="mt-3 text-3.5 text-[#1C2023] font-bold">欢迎来到 CNode</view>
        <view class="mt-1 text-2.75 text-[#9AA0A6]">登录后参与讨论、收藏与消息提醒</view>
        <view class="mt-5 flex">
          <view
            class="h-10 w-28 flex items-center justify-center rounded-full bg-[#49B9AD] text-3 text-white active:opacity-80"
            @click="goLogin()"
          >
            登录
          </view>
          <view
            class="ml-3 h-10 w-28 flex items-center justify-center border border-[#49B9AD] rounded-full text-3 text-[#49B9AD] active:opacity-80"
            @click="goSignup"
          >
            注册
          </view>
        </view>
      </view>
    </view>

    <template v-else>
      <view
        class="mx-3 mt-3 overflow-hidden rounded-4 bg-[linear-gradient(135deg,#49B9AD_0%,#2E8F86_100%)] p-4"
        @click="goUserDetail(loginname)"
      >
        <view class="flex items-center">
          <image
            class="h-16 w-16 flex-shrink-0 border-2 border-white/50 rounded-full bg-[#d9efec]"
            mode="aspectFill"
            :src="avatar"
          />
          <view class="ml-3 min-w-0 flex-1">
            <view class="flex flex-wrap items-center">
              <text class="truncate text-4.25 text-white font-bold">{{ loginname }}</text>
              <view
                v-for="text in identityText"
                :key="text"
                class="ml-1.5 rounded-1 bg-white/20 px-1.5 py-0.5 text-2.25 text-white"
              >
                {{ text }}
              </view>
            </view>
            <view class="line-clamp-2 mt-1 text-2.75 text-white/80">
              {{ detail?.signature || '这个人很懒，还没有留下签名~' }}
            </view>
            <view v-if="joinText" class="mt-1 text-2.25 text-white/70">{{ joinText }}</view>
          </view>
          <TnIcon color="#ffffff" name="right" />
        </view>
      </view>

      <view class="mx-3 mt-3 flex rounded-3 bg-white py-3">
        <view
          class="flex flex-1 flex-col items-center active:opacity-60"
          @click="goUserList(loginname, 'topics')"
        >
          <text class="text-4 text-[#1C2023] font-bold">{{ detail?.topic_count ?? 0 }}</text>
          <text class="mt-0.5 text-2.5 text-[#9AA0A6]">话题</text>
        </view>
        <view
          class="flex flex-1 flex-col items-center active:opacity-60"
          @click="goUserList(loginname, 'replies')"
        >
          <text class="text-4 text-[#1C2023] font-bold">{{ detail?.reply_count ?? 0 }}</text>
          <text class="mt-0.5 text-2.5 text-[#9AA0A6]">回复</text>
        </view>
        <view
          class="flex flex-1 flex-col items-center active:opacity-60"
          @click="goUserList(loginname, 'collections')"
        >
          <text class="text-4 text-[#1C2023] font-bold">
            {{ detail?.collect_topic_count ?? 0 }}
          </text>
          <text class="mt-0.5 text-2.5 text-[#9AA0A6]">收藏</text>
        </view>
        <view class="flex flex-1 flex-col items-center">
          <text class="text-4 text-[#1C2023] font-bold">{{ detail?.score ?? 0 }}</text>
          <text class="mt-0.5 text-2.5 text-[#9AA0A6]">积分</text>
        </view>
      </view>

      <view
        v-if="detail?.is_muted || detail?.is_block"
        class="mx-3 mt-3 rounded-2 bg-[#FFF4E5] px-3 py-2 text-2.75 text-[#B26A00]"
      >
        {{
          detail?.is_block
            ? '账号已被封禁，如有疑问请联系管理员。'
            : '账号当前处于禁言状态，暂时无法发言。'
        }}
      </view>

      <view class="mx-3 mt-3 overflow-hidden rounded-3 bg-white">
        <view
          v-for="(item, index) in menus"
          :key="item.label"
          class="flex items-center px-3.5 py-3.5 active:bg-[#F7F8F9]"
          :class="index !== menus.length - 1 ? 'border-b border-[#F3F5F6]' : ''"
          @click="item.action()"
        >
          <view class="mr-3 h-8 w-8 flex items-center justify-center rounded-2 bg-[#EAF7F5]">
            <TnIcon color="#49B9AD" :name="item.icon" />
          </view>
          <text class="flex-1 text-3 text-[#1C2023]">{{ item.label }}</text>
          <TnIcon class="text-[#C8CDD2]" name="right" />
        </view>
      </view>

      <view
        class="mx-3 mt-3 h-11 flex items-center justify-center rounded-3 bg-white text-3 text-[#FF5A5F] active:bg-[#FFF5F5]"
        @click="onLogout"
      >
        退出登录
      </view>
    </template>

    <view class="pb-28" />
    <Tabbar :placeholder="false" :tabbarPath="PageEnum.MINE_PATH" />
  </view>
</template>

<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '我的',
  },
  needLogin: false,
}
</route>
