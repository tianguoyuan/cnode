<script lang="ts" setup>
import type { Topic, TopicTab } from '@/service/cnode/types'

import TnIcon from '@tuniao/tnui-vue3-uniapp/components/icon/src/icon.vue'
import { useUniAppSystemRectInfo } from '@tuniao/tnui-vue3-uniapp/hooks'

import EmptyState from '@/components/EmptyState.vue'
import LoadMore from '@/components/LoadMore.vue'
import Tabbar from '@/components/Tabbar.vue'
import TopicItem from '@/components/TopicItem.vue'
import TopicSkeleton from '@/components/TopicSkeleton.vue'
import { TOPIC_TABS } from '@/enums/CnodeEnum'
import { PageEnum } from '@/enums/PageEnum'
import { getTabs, getTopics } from '@/service/cnode'
import { goTopicDetail, requireLogin } from '@/utils/nav'

const { navBarInfo } = useUniAppSystemRectInfo()

interface TabItem {
  key: string
  label: string
}

const tabs = ref<TabItem[]>(TOPIC_TABS.map((item) => ({ key: item.key, label: item.label })))
const activeTab = ref<string>('all')
const switching = ref(false)

const { finished, list, loading, loadMore, refresh } = useList<Topic>(
  async ({ limit, page }) => {
    const res = await getTopics({ limit, page, tab: activeTab.value as TopicTab })
    return { list: res.data, total: res.total }
  },
  { pageSize: 20 },
)

/** 优先使用服务端下发的 tab 配置 */
async function loadTabs() {
  try {
    const res = await getTabs({ toast: false })
    const data = (res.data || [])
      .filter((item) => item.visible && item.scope !== 'admin')
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({ key: item.key, label: item.label }))

    if (!data.length) return
    if (!data.some((item) => item.key === 'all')) {
      data.unshift({ key: 'all', label: '全部' })
    }
    tabs.value = data
    if (!data.some((item) => item.key === activeTab.value)) {
      activeTab.value = data[0].key
    }
  } catch {
    // 使用本地内置 tab 作为兜底
  }
}

async function changeTab(key: string) {
  if (activeTab.value === key) return
  activeTab.value = key
  switching.value = true
  try {
    await refresh()
  } finally {
    switching.value = false
  }
}

function onCreate() {
  if (!requireLogin()) return
  uni.navigateTo({ url: PageEnum.TOPIC_CREATE_PATH })
}

let firstShow = true
onShow(() => {
  if (firstShow) {
    firstShow = false
    return
  }
  refresh()
})

onLoad(() => {
  loadTabs()
  refresh()
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
    <view
      class="relative overflow-hidden bg-[radial-gradient(120%_120%_at_50%_0%,#E9FBF8_0%,#FFFFFF_70%)] pb-2"
    >
      <view
        class="pointer-events-none absolute h-40 w-40 rounded-full bg-[#49B9AD]/10 blur-3xl -right-10 -top-16"
      />
      <view
        class="pointer-events-none absolute h-32 w-32 rounded-full bg-[#7C3FFF]/8 blur-3xl -left-8 -top-10"
      />
      <view class="relative">
        <view :style="{ height: navBarInfo.height + 'px' }">
          <view :style="{ height: navBarInfo.statusHeight + 'px' }" />
          <view
            class="flex items-center justify-center"
            :style="{ height: navBarInfo.height - navBarInfo.statusHeight + 'px' }"
          >
            <view class="text-4.25 text-[#1C2023] font-bold tracking-wide">CNode 社区</view>
          </view>
        </view>

        <scroll-view class="whitespace-nowrap px-3" scrollX :showScrollbar="false">
          <view
            v-for="item in tabs"
            :key="item.key"
            class="mr-2 inline-block rounded-full px-3.5 py-1.5 text-3 transition-all duration-200 active:scale-95 active:opacity-80"
            :class="
              activeTab === item.key
                ? 'bg-gradient-to-r from-[#49B9AD] to-[#22D3EE] font-bold text-white shadow-[0_8px_20px_rgba(34,211,238,0.18)]'
                : 'bg-white/90 text-[#5F6B75] shadow-[0_4px_12px_rgba(15,23,42,0.02)] ring-1 ring-black/2'
            "
            @click="changeTab(item.key)"
          >
            {{ item.label }}
          </view>
        </scroll-view>
      </view>
    </view>

    <view class="relative px-3 pb-28 pt-3">
      <view v-if="(loading && !list.length) || switching" class="transition-all duration-200">
        <TopicSkeleton />
      </view>

      <view v-else class="transition-all duration-200">
        <TopicItem
          v-for="topic in list"
          :key="topic.id"
          showExcerpt
          :topic="topic"
          @click="goTopicDetail(topic.id)"
        />

        <EmptyState v-if="!loading && !list.length" text="还没有话题，来发布第一篇吧" />
        <LoadMore :empty="!list.length" :finished="finished" :loading="loading" />
      </view>
    </view>

    <view
      class="fixed bottom-22 right-4 z-40 h-12 w-12 flex items-center justify-center rounded-full from-[#49B9AD] to-[#22D3EE] bg-gradient-to-br text-white shadow-[0_12px_30px_rgba(34,211,238,0.25)] transition-all duration-150 active:scale-95 active:opacity-80"
      @click="onCreate"
    >
      <TnIcon name="add" size="26" />
    </view>

    <Tabbar :placeholder="false" :tabbarPath="PageEnum.HOME_PATH" />
  </view>
</template>

<route lang="json5" type="home">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: 'CNode 社区',
    enablePullDownRefresh: true,
    backgroundTextStyle: 'dark',
  },
  needLogin: false,
}
</route>
