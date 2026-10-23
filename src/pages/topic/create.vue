<script lang="ts" setup>
import type { TopicPayload } from '@/service/cnode/topic'
import type { PublishTab } from '@/service/cnode/types'

import Navbar from '@/components/Navbar.vue'
import TopicForm from '@/components/TopicForm.vue'
import { PUBLISH_TABS } from '@/enums/CnodeEnum'
import { PageEnum } from '@/enums/PageEnum'
import { createTopic } from '@/service/cnode'

const submitting = ref(false)
const defaultTab = ref<PublishTab>('share')

async function onSubmit(payload: TopicPayload) {
  if (submitting.value) return
  submitting.value = true
  try {
    const res = await createTopic(payload)
    uni.showToast({ icon: 'none', title: '发布成功' })
    setTimeout(() => {
      uni.redirectTo({ url: `${PageEnum.TOPIC_DETAIL_PATH}?id=${res.topic_id}` })
    }, 400)
  } catch {
    // 接口层已提示失败
  } finally {
    submitting.value = false
  }
}

onLoad((options) => {
  const tab = options?.tab as PublishTab | undefined
  if (tab && PUBLISH_TABS.some((item) => item.key === tab)) {
    defaultTab.value = tab
  }
})
</script>

<template>
  <view class="min-h-screen bg-[#F5F7FB]">
    <Navbar showBackIcon title="发布话题" />
    <view class="px-3 pt-3">
      <TopicForm :defaultTab="defaultTab" :submitting="submitting" @submit="onSubmit" />
    </view>
  </view>
</template>

<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '发布话题',
  },
  needLogin: true,
}
</route>
