<script lang="ts" setup>
import type { MessageItem } from '@/service/cnode/types'

import EmptyState from '@/components/EmptyState.vue'
import MessageItemCard from '@/components/MessageItem.vue'
import Navbar from '@/components/Navbar.vue'
import Tabbar from '@/components/Tabbar.vue'
import { PageEnum } from '@/enums/PageEnum'
import { getMessages, markAllMessagesRead, markMessageRead } from '@/service/cnode'
import { useUserStore } from '@/store'
import { goLogin, goTopicDetail } from '@/utils/nav'

const userStore = useUserStore()

const readMessages = ref<MessageItem[]>([])
const unreadMessages = ref<MessageItem[]>([])
const loading = ref(false)
const markingAll = ref(false)

const unreadCount = computed(() => unreadMessages.value.length)

async function loadMessages() {
  if (!userStore.isLogin) {
    readMessages.value = []
    unreadMessages.value = []
    return
  }

  loading.value = true
  try {
    const res = await getMessages()
    readMessages.value = res.data?.has_read_messages || []
    unreadMessages.value = res.data?.hasnot_read_messages || []
  } finally {
    loading.value = false
  }
}

async function openMessage(message: MessageItem) {
  if (!message.has_read) {
    try {
      await markMessageRead(message.id)
      const index = unreadMessages.value.findIndex((item) => item.id === message.id)
      if (index >= 0) {
        const [item] = unreadMessages.value.splice(index, 1)
        item.has_read = true
        readMessages.value.unshift(item)
      }
    } catch {
      // 标记失败也继续跳转
    }
  }
  goTopicDetail(message.topic.id)
}

function markAllRead() {
  if (!unreadMessages.value.length || markingAll.value) return

  uni.showModal({
    content: '确定将全部未读消息标记为已读吗？',
    success: async (res) => {
      if (!res.confirm) return
      markingAll.value = true
      try {
        await markAllMessagesRead()
        const items = unreadMessages.value.map((item) => ({ ...item, has_read: true }))
        readMessages.value = [...items, ...readMessages.value]
        unreadMessages.value = []
        uni.showToast({ icon: 'none', title: '已全部标记为已读' })
      } finally {
        markingAll.value = false
      }
    },
    title: '提示',
  })
}

onShow(() => {
  loadMessages()
})

onPullDownRefresh(async () => {
  await loadMessages()
  uni.stopPullDownRefresh()
})
</script>

<template>
  <view class="min-h-screen bg-[#F5F7FB]">
    <Navbar title="消息">
      <template #right>
        <view
          v-if="userStore.isLogin && unreadCount > 0"
          class="text-2.75 active:opacity-60"
          :class="markingAll ? 'text-[#C8CDD2]' : 'text-[#49B9AD]'"
          @click="markAllRead"
        >
          全部已读
        </view>
      </template>
    </Navbar>

    <view v-if="!userStore.isLogin" class="mx-3 mt-6 rounded-4 bg-white px-6 py-10">
      <view class="flex flex-col items-center">
        <view class="h-14 w-14 flex items-center justify-center rounded-full bg-[#EAF7F5]">
          <text class="text-5">💬</text>
        </view>
        <view class="mt-3 text-3.5 text-[#1C2023] font-bold">登录后查看消息</view>
        <view class="mt-1 text-2.75 text-[#9AA0A6]">回复、@ 提醒都会出现在这里</view>
        <view
          class="mt-5 h-10 w-32 flex items-center justify-center rounded-full bg-[#49B9AD] text-3 text-white active:opacity-80"
          @click="goLogin()"
        >
          去登录
        </view>
      </view>
    </view>

    <template v-else>
      <view class="flex items-center px-4 pb-1 pt-3">
        <text class="text-3.25 text-[#1C2023] font-bold">未读消息</text>
        <view v-if="unreadCount" class="ml-2 rounded-full bg-[#FF5A5F] px-1.5 text-2.25 text-white">
          {{ unreadCount }}
        </view>
      </view>

      <view class="px-3 pt-2">
        <MessageItemCard
          v-for="message in unreadMessages"
          :key="message.id"
          :message="message"
          unread
          @click="openMessage"
        />

        <EmptyState v-if="!loading && !unreadCount" :image="false" text="没有未读消息" />
      </view>

      <template v-if="readMessages.length">
        <view class="flex items-center px-4 pb-1 pt-3">
          <text class="text-3.25 text-[#1C2023] font-bold">已读消息</text>
        </view>

        <view class="px-3 pb-28 pt-2">
          <MessageItemCard
            v-for="message in readMessages"
            :key="message.id"
            :message="message"
            @click="openMessage"
          />
        </view>
      </template>

      <view v-else-if="!loading && readMessages.length === 0 && unreadCount === 0" class="pb-28" />
    </template>

    <Tabbar :placeholder="false" :tabbarPath="PageEnum.MESSAGE_PATH" />
  </view>
</template>

<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '消息',
    enablePullDownRefresh: true,
    backgroundTextStyle: 'dark',
  },
  needLogin: false,
}
</route>
