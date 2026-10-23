<script lang="ts" setup>
import type { Topic } from '@/service/cnode/types'

import EmptyState from '@/components/EmptyState.vue'
import LoadMore from '@/components/LoadMore.vue'
import Navbar from '@/components/Navbar.vue'
import TopicItem from '@/components/TopicItem.vue'
import { getUserCollections, getUserReplies, getUserTopics } from '@/service/cnode'
import { goTopicDetail } from '@/utils/nav'

type UserListType = 'topics' | 'replies' | 'collections'

const TABS: { key: UserListType; label: string }[] = [
  { key: 'topics', label: '话题' },
  { key: 'replies', label: '回复' },
  { key: 'collections', label: '收藏' },
]

const loginname = ref('')
const activeType = ref<UserListType>('topics')

const { clear, finished, list, loading, loadMore, refresh } = useList<Topic>(
  async ({ limit, page }) => {
    const fetcher = {
      collections: getUserCollections,
      replies: getUserReplies,
      topics: getUserTopics,
    }[activeType.value]

    const res = await fetcher(loginname.value, { limit, page })
    return { list: res.data, total: res.total }
  },
  { pageSize: 20 },
)

const activeLabel = computed(
  () => TABS.find((item) => item.key === activeType.value)?.label || '内容',
)

const title = computed(() =>
  loginname.value ? `${loginname.value} 的${activeLabel.value}` : `TA 的${activeLabel.value}`,
)

const emptyText = computed(() => {
  if (activeType.value === 'topics') return '还没有发布过话题'
  if (activeType.value === 'replies') return '还没有回复过话题'
  return '还没有收藏任何话题'
})

const showAvatar = computed(() => activeType.value !== 'collections')

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function changeType(type: UserListType) {
  if (activeType.value === type) return
  activeType.value = type
  clear()
  refresh()
}

onLoad((options) => {
  loginname.value = safeDecode(String(options?.loginname || ''))
  const type = options?.type as UserListType | undefined
  if (type && TABS.some((item) => item.key === type)) {
    activeType.value = type
  }
  if (loginname.value) refresh()
})

onPullDownRefresh(async () => {
  await refresh()
  uni.stopPullDownRefresh()
})

onReachBottom(() => {
  loadMore()
})
</script>

<template>
  <view class="min-h-screen bg-[#F5F7FB]">
    <Navbar showBackIcon showHomeIcon :title="title" />

    <view class="px-3 pb-8 pt-3">
      <view class="mb-3 flex rounded-full bg-white p-1">
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

      <TopicItem
        v-for="topic in list"
        :key="topic.id"
        :showAvatar="showAvatar"
        :topic="topic"
        @click="goTopicDetail(topic.id)"
      />

      <EmptyState v-if="!loading && !list.length" :text="emptyText" />
      <LoadMore :empty="!list.length" :finished="finished" :loading="loading" />
    </view>
  </view>
</template>

<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '用户内容',
    enablePullDownRefresh: true,
    backgroundTextStyle: 'dark',
  },
  needLogin: false,
}
</route>
