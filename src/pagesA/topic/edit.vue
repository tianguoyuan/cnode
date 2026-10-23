<script lang="ts" setup>
import type { TopicPayload } from '@/service/cnode/topic'
import type { TopicDetail } from '@/service/cnode/types'

import TnIcon from '@tuniao/tnui-vue3-uniapp/components/icon/src/icon.vue'

import Navbar from '@/components/Navbar.vue'
import TopicForm from '@/components/TopicForm.vue'
import { PageEnum } from '@/enums/PageEnum'
import { getTopicDetail, updateTopic } from '@/service/cnode'

const topicId = ref('')
const topic = ref<TopicDetail | null>(null)
const loading = ref(true)
const submitting = ref(false)

async function loadTopic() {
  if (!topicId.value) return
  loading.value = true
  try {
    // 编辑需要原始 Markdown 内容
    const res = await getTopicDetail(topicId.value, { mdrender: false })
    topic.value = res.data
  } catch {
    topic.value = null
  } finally {
    loading.value = false
  }
}

async function onSubmit(payload: TopicPayload) {
  if (submitting.value) return
  submitting.value = true
  try {
    await updateTopic({ ...payload, topic_id: topicId.value })
    uni.showToast({ icon: 'none', title: '保存成功' })
    setTimeout(() => {
      if (getCurrentPages().length > 1) {
        uni.navigateBack()
      } else {
        uni.redirectTo({ url: `${PageEnum.TOPIC_DETAIL_PATH}?id=${topicId.value}` })
      }
    }, 400)
  } catch {
    // 接口层已提示失败
  } finally {
    submitting.value = false
  }
}

onLoad((options) => {
  topicId.value = options?.id || ''
  loadTopic()
})
</script>

<template>
  <view class="min-h-screen bg-[#F5F7FB]">
    <Navbar showBackIcon title="编辑话题" />

    <view v-if="loading" class="flex flex-col items-center py-24">
      <TnIcon class="text-[#9AA0A6]" name="loading" />
      <text class="mt-2 text-3 text-[#9AA0A6]">加载中...</text>
    </view>

    <view v-else-if="!topic" class="px-3 pt-4">
      <view class="rounded-3 bg-white px-4 py-10 text-center text-3 text-[#9AA0A6]">
        话题不存在或无权编辑
      </view>
    </view>

    <view v-else class="px-3 pt-3">
      <TopicForm submitText="保存修改" :submitting="submitting" :topic="topic" @submit="onSubmit" />
    </view>
  </view>
</template>

<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '编辑话题',
  },
  needLogin: true,
}
</route>
