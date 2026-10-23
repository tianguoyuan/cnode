<script lang="ts" setup>
import TnIcon from '@tuniao/tnui-vue3-uniapp/components/icon/src/icon.vue'

import Navbar from '@/components/Navbar.vue'
import { PageEnum } from '@/enums/PageEnum'
import { editReply, getReplyDetail } from '@/service/cnode'

const replyId = ref('')
const topicId = ref('')
const content = ref('')
const loading = ref(true)
const submitting = ref(false)

function toast(title: string) {
  uni.showToast({ icon: 'none', title })
}

function goTopic() {
  if (!topicId.value) return
  uni.navigateTo({ url: `${PageEnum.TOPIC_DETAIL_PATH}?id=${topicId.value}` })
}

async function loadReply() {
  if (!replyId.value) return
  loading.value = true
  try {
    const res = await getReplyDetail(replyId.value)
    content.value = res.data?.content || ''
    topicId.value = res.data?.topic_id || ''
  } catch {
    content.value = ''
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  if (submitting.value) return
  const value = content.value.trim()
  if (!value) {
    toast('回复内容不能为空')
    return
  }

  submitting.value = true
  try {
    await editReply(replyId.value, value)
    uni.showToast({ icon: 'none', title: '保存成功' })
    setTimeout(() => {
      uni.navigateBack()
    }, 400)
  } catch {
    // 接口层已提示失败
  } finally {
    submitting.value = false
  }
}

onLoad((options) => {
  replyId.value = options?.id || ''
  loadReply()
})
</script>

<template>
  <view class="min-h-screen bg-[#F5F7FB]">
    <Navbar showBackIcon title="编辑回复" />

    <view v-if="loading" class="flex flex-col items-center py-24">
      <TnIcon class="text-[#9AA0A6]" name="loading" />
      <text class="mt-2 text-3 text-[#9AA0A6]">加载中...</text>
    </view>

    <view v-else class="px-3 pt-3">
      <view class="rounded-3 bg-white p-3.5">
        <view class="text-3 text-[#1C2023] font-bold">回复内容</view>
        <textarea
          v-model="content"
          class="mt-2 h-64 w-full rounded-2 bg-[#F5F6F7] p-3 text-3 text-[#1C2023] leading-relaxed"
          :maxlength="-1"
          placeholder="请输入回复内容"
        />
      </view>

      <view
        v-if="topicId"
        class="mt-3 rounded-2 bg-white px-3 py-2.5 text-2.75 text-[#49B9AD] active:opacity-60"
        @click="goTopic"
      >
        查看所属话题
      </view>

      <view
        class="mt-5 h-11 flex items-center justify-center rounded-full text-3.5 text-white active:opacity-80"
        :class="submitting ? 'bg-[#9ED8D2]' : 'bg-[#49B9AD]'"
        @click="onSubmit"
      >
        {{ submitting ? '保存中...' : '保存修改' }}
      </view>
    </view>
  </view>
</template>

<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '编辑回复',
  },
  needLogin: true,
}
</route>
