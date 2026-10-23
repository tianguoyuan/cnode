<script lang="ts" setup>
import type { UserBrief } from '@/service/cnode/types'

import TnIcon from '@tuniao/tnui-vue3-uniapp/components/icon/src/icon.vue'

import EmptyState from '@/components/EmptyState.vue'
import Navbar from '@/components/Navbar.vue'
import { getStarUsers, getTop100Users } from '@/service/cnode'
import { goUserDetail } from '@/utils/nav'

type RankType = 'top100' | 'stars'

const TABS: { key: RankType; label: string }[] = [
  { key: 'top100', label: '积分榜' },
  { key: 'stars', label: '星标用户' },
]

const activeType = ref<RankType>('top100')
const list = ref<UserBrief[]>([])
const loading = ref(false)

const activeLabel = computed(
  () => TABS.find((item) => item.key === activeType.value)?.label || '榜单',
)

const desc = computed(() =>
  activeType.value === 'stars' ? '由社区共同推荐的活跃开发者' : '按社区积分排名，取前 100 名',
)

async function loadList() {
  loading.value = true
  try {
    const res = activeType.value === 'stars' ? await getStarUsers() : await getTop100Users()
    list.value = res.data || []
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function changeType(type: RankType) {
  if (activeType.value === type) return
  activeType.value = type
  list.value = []
  loadList()
}

/** 前三名的奖牌配色 */
function rankStyle(index: number) {
  if (index === 0) return 'bg-[#FFB020] text-white'
  if (index === 1) return 'bg-[#B8C0CC] text-white'
  if (index === 2) return 'bg-[#D79A6B] text-white'
  return 'bg-[#F5F6F7] text-[#9AA0A6]'
}

onLoad((options) => {
  if (options?.type === 'stars') activeType.value = 'stars'
  loadList()
})

onPullDownRefresh(async () => {
  await loadList()
  uni.stopPullDownRefresh()
})
</script>

<template>
  <view class="min-h-screen bg-[#F5F7FB]">
    <Navbar showBackIcon showHomeIcon title="社区达人" />

    <view class="px-3 pb-8 pt-3">
      <view class="rounded-4 bg-[linear-gradient(135deg,#49B9AD_0%,#2E8F86_100%)] p-4">
        <view class="flex items-center">
          <view class="h-11 w-11 flex items-center justify-center rounded-full bg-white/20">
            <TnIcon color="#ffffff" name="trophy" size="24" />
          </view>
          <view class="ml-3 min-w-0 flex-1">
            <view class="text-4 text-white font-bold">{{ activeLabel }}</view>
            <view class="mt-0.5 text-2.5 text-white/75">{{ desc }}</view>
          </view>
        </view>
      </view>

      <view class="mt-3 flex rounded-full bg-white p-1">
        <view
          v-for="item in TABS"
          :key="item.key"
          class="h-8 flex flex-1 items-center justify-center rounded-full text-3 transition-all"
          :class="activeType === item.key ? 'bg-[#49B9AD] font-bold text-white' : 'text-[#7B8188]'"
          @click="changeType(item.key)"
        >
          {{ item.label }}
        </view>
      </view>

      <view v-if="loading" class="flex flex-col items-center py-20">
        <TnIcon class="text-[#9AA0A6]" name="loading" />
        <text class="mt-2 text-3 text-[#9AA0A6]">加载中...</text>
      </view>

      <template v-else>
        <view v-if="list.length" class="mt-3 overflow-hidden rounded-3 bg-white">
          <view
            v-for="(user, index) in list"
            :key="user.id"
            class="flex items-center px-3.5 py-3 active:bg-[#F7F8F9]"
            :class="index !== list.length - 1 ? 'border-b border-[#F3F5F6]' : ''"
            @click="goUserDetail(user.loginname)"
          >
            <view
              class="mr-3 h-6 w-6 flex flex-shrink-0 items-center justify-center rounded-full text-2.75 font-bold"
              :class="rankStyle(index)"
            >
              {{ index + 1 }}
            </view>

            <image
              class="mr-2.5 h-10 w-10 flex-shrink-0 rounded-full bg-[#eef0f2]"
              mode="aspectFill"
              :src="user.avatar_url"
            />

            <view class="min-w-0 flex-1">
              <view class="flex items-center">
                <text class="truncate text-3 text-[#1C2023] font-bold">{{ user.loginname }}</text>
                <view
                  v-if="user.is_star"
                  class="ml-1.5 rounded-1 bg-[#FFF6E5] px-1.5 py-0.5 text-2.25 text-[#FFB020]"
                >
                  星标
                </view>
              </view>
              <view class="mt-0.5 text-2.5 text-[#9AA0A6]">
                {{ user.topic_count }} 话题 · {{ user.reply_count }} 回复
              </view>
            </view>

            <view class="ml-2 flex-shrink-0 text-right">
              <view class="text-3 text-[#FF7A45] font-bold">{{ user.score }}</view>
              <view class="text-2.25 text-[#9AA0A6]">积分</view>
            </view>
          </view>
        </view>

        <EmptyState v-else text="榜单暂时为空" />
      </template>
    </view>
  </view>
</template>

<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '社区达人',
    enablePullDownRefresh: true,
    backgroundTextStyle: 'dark',
  },
  needLogin: false,
}
</route>
