<script lang="ts" setup>
import type { UserDetail } from '@/service/cnode/types'

import TnIcon from '@tuniao/tnui-vue3-uniapp/components/icon/src/icon.vue'

import Navbar from '@/components/Navbar.vue'
import { IDENTITY_LABEL } from '@/enums/CnodeEnum'
import { PageEnum } from '@/enums/PageEnum'
import { getUserDetail } from '@/service/cnode'
import { useUserStore } from '@/store'
import { formatDate, formatRelativeTime } from '@/utils/format'
import { goTopicDetail, goUserList } from '@/utils/nav'

const userStore = useUserStore()

const loginname = ref('')
const detail = ref<UserDetail | null>(null)
const loading = ref(true)

const isSelf = computed(
  () => !!detail.value && detail.value.loginname === userStore.userInfo?.loginname,
)

const identityText = computed(() => {
  return (detail.value?.identities || []).map((item) => IDENTITY_LABEL[item] || item)
})

const joinText = computed(() => {
  if (!detail.value?.create_at) return ''
  return `加入于 ${formatDate(detail.value.create_at, false)}`
})

async function loadDetail() {
  if (!loginname.value) return
  loading.value = true
  try {
    const res = await getUserDetail(loginname.value)
    detail.value = res.data
  } catch {
    detail.value = null
  } finally {
    loading.value = false
  }
}

function goSetting() {
  uni.navigateTo({ url: PageEnum.USER_SETTING_PATH })
}

let firstShow = true
onShow(() => {
  if (firstShow) {
    firstShow = false
    return
  }
  if (loginname.value) loadDetail()
})

onLoad((options) => {
  loginname.value = options?.loginname || ''
  loadDetail()
})
</script>

<template>
  <view class="min-h-screen bg-[#F5F7FB]">
    <Navbar showBackIcon showHomeIcon title="用户主页" />

    <view v-if="loading" class="flex flex-col items-center py-24">
      <TnIcon class="text-[#9AA0A6]" name="loading" />
      <text class="mt-2 text-3 text-[#9AA0A6]">加载中...</text>
    </view>

    <view v-else-if="!detail" class="px-3 pt-4">
      <view class="rounded-3 bg-white px-4 py-10 text-center text-3 text-[#9AA0A6]">
        用户不存在或已注销
      </view>
    </view>

    <view v-else class="px-3 pb-8 pt-3">
      <view class="rounded-4 bg-[linear-gradient(135deg,#49B9AD_0%,#2E8F86_100%)] p-4">
        <view class="flex items-center">
          <image
            class="h-16 w-16 flex-shrink-0 border-2 border-white/50 rounded-full bg-[#d9efec]"
            mode="aspectFill"
            :src="detail.avatar_url"
          />
          <view class="ml-3 min-w-0 flex-1">
            <view class="flex flex-wrap items-center">
              <text class="truncate text-4.25 text-white font-bold">{{ detail.loginname }}</text>
              <view
                v-for="text in identityText"
                :key="text"
                class="ml-1.5 rounded-1 bg-white/20 px-1.5 py-0.5 text-2.25 text-white"
              >
                {{ text }}
              </view>
            </view>
            <view class="line-clamp-2 mt-1 text-2.75 text-white/80">
              {{ detail.signature || '这个人很懒，还没有留下签名~' }}
            </view>
            <view v-if="joinText" class="mt-1 text-2.25 text-white/70">{{ joinText }}</view>
          </view>
        </view>

        <view
          v-if="detail.location || detail.url"
          class="mt-3 flex flex-wrap text-2.5 text-white/75"
        >
          <view v-if="detail.location" class="mr-3 flex items-center">
            <TnIcon class="mr-1" name="location" />
            <text>{{ detail.location }}</text>
          </view>
          <view v-if="detail.url" class="flex items-center">
            <TnIcon class="mr-1" name="link" />
            <text class="truncate">{{ detail.url }}</text>
          </view>
        </view>
      </view>

      <view class="mt-3 flex rounded-3 bg-white py-3">
        <view
          class="flex flex-1 flex-col items-center active:opacity-60"
          @click="goUserList(detail.loginname, 'topics')"
        >
          <text class="text-4 text-[#1C2023] font-bold">{{ detail.topic_count }}</text>
          <text class="mt-0.5 text-2.5 text-[#9AA0A6]">话题</text>
        </view>
        <view
          class="flex flex-1 flex-col items-center active:opacity-60"
          @click="goUserList(detail.loginname, 'replies')"
        >
          <text class="text-4 text-[#1C2023] font-bold">{{ detail.reply_count }}</text>
          <text class="mt-0.5 text-2.5 text-[#9AA0A6]">回复</text>
        </view>
        <view
          class="flex flex-1 flex-col items-center active:opacity-60"
          @click="goUserList(detail.loginname, 'collections')"
        >
          <text class="text-4 text-[#1C2023] font-bold">{{ detail.collect_topic_count }}</text>
          <text class="mt-0.5 text-2.5 text-[#9AA0A6]">收藏</text>
        </view>
        <view class="flex flex-1 flex-col items-center">
          <text class="text-4 text-[#1C2023] font-bold">{{ detail.score }}</text>
          <text class="mt-0.5 text-2.5 text-[#9AA0A6]">积分</text>
        </view>
      </view>

      <view v-if="isSelf" class="mt-3 flex">
        <view
          class="h-10 flex flex-1 items-center justify-center rounded-3 bg-white text-3 text-[#49B9AD] active:bg-[#F7F8F9]"
          @click="goSetting"
        >
          编辑资料
        </view>
      </view>

      <view
        v-if="detail.is_block || detail.is_muted"
        class="mt-3 rounded-2 bg-[#FFF4E5] px-3 py-2 text-2.75 text-[#B26A00]"
      >
        {{ detail.is_block ? '该用户已被封禁' : '该用户当前处于禁言状态' }}
      </view>

      <view class="mt-3 rounded-3 bg-white px-3.5 py-3">
        <view class="flex items-center justify-between">
          <text class="text-3.25 text-[#1C2023] font-bold">最近发布</text>
          <text class="text-2.5 text-[#49B9AD]" @click="goUserList(detail.loginname, 'topics')">
            全部
          </text>
        </view>
        <view v-if="detail.recent_topics?.length" class="mt-2">
          <view
            v-for="item in detail.recent_topics"
            :key="item.id"
            class="border-b border-[#F3F5F6] py-2.5 last:border-b-0 active:opacity-60"
            @click="goTopicDetail(item.id)"
          >
            <view class="line-clamp-2 text-3 text-[#1C2023] leading-snug">{{ item.title }}</view>
            <view class="mt-1 text-2.25 text-[#9AA0A6]">
              最后回复 {{ item.last_reply_at ? formatRelativeTime(item.last_reply_at) : '暂无' }}
            </view>
          </view>
        </view>
        <view v-else class="py-6 text-center text-2.75 text-[#9AA0A6]">还没有发布过话题</view>
      </view>

      <view class="mt-3 rounded-3 bg-white px-3.5 py-3">
        <view class="flex items-center justify-between">
          <text class="text-3.25 text-[#1C2023] font-bold">最近回复</text>
          <text class="text-2.5 text-[#49B9AD]" @click="goUserList(detail.loginname, 'replies')">
            全部
          </text>
        </view>
        <view v-if="detail.recent_replies?.length" class="mt-2">
          <view
            v-for="item in detail.recent_replies"
            :key="item.id"
            class="border-b border-[#F3F5F6] py-2.5 last:border-b-0 active:opacity-60"
            @click="goTopicDetail(item.id)"
          >
            <view class="line-clamp-2 text-3 text-[#1C2023] leading-snug">{{ item.title }}</view>
            <view class="mt-1 text-2.25 text-[#9AA0A6]">
              最后回复 {{ item.last_reply_at ? formatRelativeTime(item.last_reply_at) : '暂无' }}
            </view>
          </view>
        </view>
        <view v-else class="py-6 text-center text-2.75 text-[#9AA0A6]">还没有回复过话题</view>
      </view>
    </view>
  </view>
</template>

<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '用户主页',
  },
  needLogin: false,
}
</route>
