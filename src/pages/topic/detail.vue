<script lang="ts" setup>
import type { Reply, TopicDetail } from '@/service/cnode/types'

import TnIcon from '@tuniao/tnui-vue3-uniapp/components/icon/src/icon.vue'

import EmptyState from '@/components/EmptyState.vue'
import Navbar from '@/components/Navbar.vue'
import ReplyItem from '@/components/ReplyItem.vue'
import TopicDetailSkeleton from '@/components/TopicDetailSkeleton.vue'
import { REMOTE_LABEL, REPORT_TYPES, TOPIC_TAB_LABEL } from '@/enums/CnodeEnum'
import { PageEnum } from '@/enums/PageEnum'
import {
  collectTopic,
  createReply,
  createReport,
  deCollectTopic,
  deleteReply,
  getTopicDetail,
  toggleReplyUp,
} from '@/service/cnode'
import { useUserStore } from '@/store'
import { formatDate, formatRelativeTime, formatSalary } from '@/utils/format'
import { goUserDetail, requireLogin } from '@/utils/nav'

const userStore = useUserStore()

const topicId = ref('')
const topic = ref<TopicDetail | null>(null)
const loading = ref(false)
const collecting = ref(false)

const replyVisible = ref(false)
const replyContent = ref('')
const replyTarget = ref<Reply | null>(null)
const sending = ref(false)

const isLogin = computed(() => userStore.isLogin)
const currentLoginname = computed(() => userStore.userInfo?.loginname || '')
const isAuthor = computed(
  () => !!topic.value && currentLoginname.value === topic.value.author?.loginname,
)
const tabLabel = computed(() => {
  const tab = topic.value?.tab || ''
  return TOPIC_TAB_LABEL[tab] || tab
})
const collectCount = computed(() => topic.value?.collect_count || 0)
const job = computed(() => topic.value?.job_meta || null)

function toast(title: string) {
  uni.showToast({ icon: 'none', title })
}

async function loadTopic(showLoading = true) {
  if (!topicId.value) return
  if (showLoading) loading.value = true
  try {
    const res = await getTopicDetail(topicId.value)
    topic.value = res.data
  } catch {
    if (showLoading) topic.value = null
  } finally {
    loading.value = false
  }
}

function copyText(text: string) {
  uni.setClipboardData({
    data: text,
    success() {
      uni.showToast({ icon: 'none', title: '已复制' })
    },
  })
}

async function toggleCollect() {
  if (!topic.value) return
  if (!requireLogin()) return
  if (collecting.value) return

  collecting.value = true
  try {
    if (topic.value.is_collect) {
      await deCollectTopic(topic.value.id)
      topic.value.is_collect = false
      topic.value.collect_count = Math.max(0, (topic.value.collect_count || 1) - 1)
      toast('已取消收藏')
    } else {
      await collectTopic(topic.value.id)
      topic.value.is_collect = true
      topic.value.collect_count = (topic.value.collect_count || 0) + 1
      toast('收藏成功')
    }
  } finally {
    collecting.value = false
  }
}

function openReply(reply?: Reply) {
  if (!requireLogin()) return
  if (userStore.isMuted) {
    toast('你当前处于禁言状态，暂时无法回复')
    return
  }
  replyTarget.value = reply || null
  replyVisible.value = true
}

function closeReply() {
  if (sending.value) return
  replyVisible.value = false
  replyTarget.value = null
}

async function sendReply() {
  if (sending.value) return
  const content = replyContent.value.trim()
  if (!content) {
    toast('请输入回复内容')
    return
  }

  sending.value = true
  try {
    await createReply(topicId.value, {
      content,
      reply_id: replyTarget.value?.id,
    })
    replyVisible.value = false
    replyContent.value = ''
    replyTarget.value = null
    uni.showToast({ icon: 'none', title: '回复成功' })
    await loadTopic(false)
  } finally {
    sending.value = false
  }
}

async function onReplyUp(reply: Reply) {
  if (!requireLogin()) return
  try {
    const res = await toggleReplyUp(reply.id)
    const loginname = currentLoginname.value
    if (res.action === 'up') {
      reply.is_uped = true
      if (loginname && !reply.ups.includes(loginname)) reply.ups.push(loginname)
    } else {
      reply.is_uped = false
      reply.ups = reply.ups.filter((item) => item !== loginname)
    }
  } catch {
    // 接口层已提示失败
  }
}

function goEditReply(reply: Reply) {
  uni.navigateTo({ url: `${PageEnum.REPLY_EDIT_PATH}?id=${reply.id}` })
}

function onDeleteReply(reply: Reply) {
  uni.showModal({
    content: '删除后无法恢复，确定删除该回复吗？',
    success: async (res) => {
      if (!res.confirm) return
      try {
        await deleteReply(reply.id)
        uni.showToast({ icon: 'none', title: '已删除' })
        await loadTopic(false)
      } catch {
        // 接口层已提示失败
      }
    },
    title: '删除回复',
  })
}

function goEditTopic() {
  uni.navigateTo({ url: `${PageEnum.TOPIC_EDIT_PATH}?id=${topicId.value}` })
}

function reportTopic() {
  if (!requireLogin()) return
  const targetId = Number(topicId.value)
  if (!Number.isFinite(targetId)) {
    toast('当前话题暂不支持举报')
    return
  }

  uni.showActionSheet({
    itemList: REPORT_TYPES.map((item) => item.label),
    success: async (res) => {
      const type = REPORT_TYPES[res.tapIndex]?.key || 'other'
      try {
        await createReport({ targetId, targetType: 'topic', type })
        uni.showToast({ icon: 'none', title: '举报已提交' })
      } catch {
        // 接口层已提示失败
      }
    },
  })
}

function onMore() {
  const actions: { label: string; run: () => void }[] = []
  if (isAuthor.value) {
    actions.push({ label: '编辑话题', run: goEditTopic })
  }
  actions.push({ label: '举报话题', run: reportTopic })

  uni.showActionSheet({
    itemList: actions.map((item) => item.label),
    success(res) {
      actions[res.tapIndex]?.run()
    },
  })
}

let firstShow = true
onShow(() => {
  if (firstShow) {
    firstShow = false
    return
  }
  if (topicId.value) loadTopic(false)
})

onLoad((options) => {
  topicId.value = options?.id || ''
  if (!topicId.value) {
    toast('缺少话题 ID')
    return
  }
  loadTopic()
})
</script>

<template>
  <view class="min-h-screen bg-[#F5F7FB]">
    <Navbar showBackIcon showHomeIcon title="话题详情">
      <template #right>
        <TnIcon class="text-[#1C2023]" name="more-horizontal" @click="onMore" />
      </template>
    </Navbar>

    <TopicDetailSkeleton v-if="loading && !topic" />

    <view v-else-if="!topic" class="px-3 pt-4">
      <EmptyState text="话题不存在或已被删除" />
    </view>

    <template v-else>
      <view class="px-3 pt-3">
        <view class="rounded-3 bg-white p-4">
          <view class="text-4.25 text-[#1C2023] font-bold leading-snug">{{ topic.title }}</view>

          <view class="mt-3 flex items-center">
            <image
              class="mr-2.5 h-9 w-9 flex-shrink-0 rounded-full bg-[#eef0f2]"
              mode="aspectFill"
              :src="topic.author?.avatar_url"
              @click="goUserDetail(topic.author?.loginname)"
            />
            <view class="min-w-0 flex-1" @click="goUserDetail(topic.author?.loginname)">
              <view class="truncate text-3 text-[#1C2023] font-bold">
                {{ topic.author?.loginname }}
              </view>
              <view class="text-2.25 text-[#9AA0A6]">
                {{ formatDate(topic.create_at) }} · {{ topic.visit_count }} 浏览
              </view>
            </view>
            <view
              class="ml-2 flex-shrink-0 rounded-1 bg-[#EAF7F5] px-1.5 py-0.5 text-2.25 text-[#49B9AD]"
            >
              {{ tabLabel }}
            </view>
          </view>

          <view class="mt-3 border-t border-[#F3F5F6] pt-3">
            <rich-text class="topic-content block" :nodes="topic.content" />
          </view>
        </view>

        <view v-if="job" class="mt-3 rounded-3 bg-white p-4">
          <view class="flex items-start">
            <image
              v-if="job.company_logo"
              class="mr-3 h-11 w-11 flex-shrink-0 rounded-2 bg-[#f2f4f6]"
              mode="aspectFill"
              :src="job.company_logo"
            />
            <view
              v-else
              class="mr-3 h-11 w-11 flex flex-shrink-0 items-center justify-center rounded-2 bg-[#EAF7F5] text-4 text-[#49B9AD]"
            >
              {{ job.company?.slice(0, 1) }}
            </view>
            <view class="min-w-0 flex-1">
              <view class="text-3.25 text-[#1C2023] font-bold">{{ job.position }}</view>
              <view class="mt-0.5 text-2.75 text-[#7B8188]">
                {{ job.company }} · {{ job.location }} ·
                {{ REMOTE_LABEL[job.remote] || job.remote }}
              </view>
              <view class="mt-1 text-3.25 text-[#FF7A45] font-bold">
                {{ formatSalary(job.salary_min, job.salary_max) }}
              </view>
            </view>
          </view>

          <view v-if="job.experience" class="mt-3 text-2.75 text-[#7B8188]">
            经验要求：{{ job.experience }}
          </view>

          <view v-if="job.tech_tags?.length" class="mt-2 flex flex-wrap">
            <view
              v-for="tag in job.tech_tags"
              :key="tag"
              class="mb-1.5 mr-1.5 rounded-1 bg-[#F5F6F7] px-1.5 py-0.5 text-2.25 text-[#7B8188]"
            >
              {{ tag }}
            </view>
          </view>

          <view
            class="mt-3 flex items-center rounded-2 bg-[#F7FAFA] px-3 py-2 text-2.75 text-[#7B8188] active:opacity-70"
            @click="copyText(job.contact)"
          >
            <TnIcon class="mr-1.5 text-[#49B9AD]" name="email" />
            <text class="flex-1 truncate">{{ job.contact }}</text>
            <text class="ml-2 flex-shrink-0 text-[#49B9AD]">复制</text>
          </view>
        </view>

        <view class="mb-1 mt-4 flex items-center px-1">
          <text class="text-3.25 text-[#1C2023] font-bold">全部回复</text>
          <text class="ml-1.5 text-2.75 text-[#9AA0A6]">{{ topic.reply_count }}</text>
        </view>

        <view class="overflow-hidden rounded-3 bg-white">
          <ReplyItem
            v-for="reply in topic.replies"
            :key="reply.id"
            :currentLoginname="currentLoginname"
            :reply="reply"
            @delete="onDeleteReply"
            @edit="goEditReply"
            @reply="openReply"
            @up="onReplyUp"
          />
          <EmptyState v-if="!topic.replies?.length" :image="false" text="还没有回复，来抢沙发吧" />
        </view>

        <view class="mt-3 text-center text-2.25 text-[#B8BDC2]">
          最后回复 {{ topic.last_reply_at ? formatRelativeTime(topic.last_reply_at) : '暂无' }}
        </view>
      </view>

      <view class="h-24" />

      <view class="fixed bottom-0 left-0 right-0 z-40">
        <view class="mx-auto max-w-[500px] border-t border-[#F0F2F4] bg-white px-3 pt-2 pb-safe">
          <view class="flex items-center">
            <view class="flex flex-col items-center active:opacity-60" @click="toggleCollect">
              <TnIcon
                :color="topic.is_collect ? '#49B9AD' : '#7B8188'"
                :name="topic.is_collect ? 'star-fill' : 'star'"
                size="20"
              />
              <text
                class="mt-0.5 text-2.25"
                :class="topic.is_collect ? 'text-[#49B9AD]' : 'text-[#7B8188]'"
              >
                {{ topic.is_collect ? '已收藏' : '收藏'
                }}{{ collectCount ? ` ${collectCount}` : '' }}
              </text>
            </view>

            <view
              class="ml-3 h-9 flex flex-1 items-center rounded-full bg-[#F5F6F7] px-3 text-2.75 text-[#9AA0A6] active:opacity-70"
              @click="openReply()"
            >
              {{ isLogin ? '写下你的回复...' : '登录后参与讨论' }}
            </view>

            <view
              class="ml-2 h-9 w-11 flex items-center justify-center rounded-full bg-[#49B9AD] text-white active:opacity-80"
              @click="openReply()"
            >
              <TnIcon name="edit" />
            </view>
          </view>
        </view>
      </view>

      <view v-if="replyVisible" class="fixed inset-0 z-50 bg-[rgba(0,0,0,0.4)]" @click="closeReply">
        <view
          class="absolute bottom-0 left-0 right-0 mx-auto max-w-[500px] rounded-t-4 bg-white p-3 pb-safe"
          @click.stop
        >
          <view class="flex items-center justify-between">
            <text class="text-3.25 text-[#1C2023] font-bold">
              {{ replyTarget ? `回复 @${replyTarget.author?.loginname}` : '发表回复' }}
            </text>
            <TnIcon class="text-[#9AA0A6]" name="close" @click="closeReply" />
          </view>

          <view
            v-if="replyTarget"
            class="mt-2 rounded-2 bg-[#F7FAFA] px-2.5 py-2 text-2.5 text-[#7B8188]"
          >
            {{ replyTarget.content?.replace(/<[^>]+>/g, '').slice(0, 80) }}
          </view>

          <textarea
            v-model="replyContent"
            class="mt-3 h-32 w-full rounded-2 bg-[#F5F6F7] p-3 text-3 text-[#1C2023] leading-relaxed"
            :maxlength="-1"
            placeholder="友善发言，支持 Markdown..."
          />

          <view
            class="mt-3 h-11 flex items-center justify-center rounded-full text-3.5 text-white active:opacity-80"
            :class="sending ? 'bg-[#9ED8D2]' : 'bg-[#49B9AD]'"
            @click="sendReply"
          >
            {{ sending ? '发送中...' : '发送' }}
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.topic-content {
  font-size: 14px;
  line-height: 1.8;
  color: #333;
  word-break: break-word;

  :deep(img) {
    max-width: 100%;
    height: auto;
  }

  :deep(a) {
    color: #49b9ad;
  }

  :deep(p) {
    margin: 0 0 10px;
  }

  :deep(pre) {
    padding: 10px;
    overflow-x: auto;
    font-size: 12px;
    background: #f5f6f7;
    border-radius: 8px;
  }

  :deep(blockquote) {
    padding-left: 10px;
    margin: 8px 0;
    color: #7b8188;
    border-left: 3px solid #e5e8ea;
  }
}
</style>

<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '话题详情',
  },
  needLogin: false,
}
</route>
