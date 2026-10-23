<script lang="ts" setup>
import type { Topic } from '@/service/cnode/types'

import { TOPIC_TAB_LABEL } from '@/enums/CnodeEnum'
import { formatRelativeTime, plainText } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    topic: Topic
    /** 是否展示作者头像 */
    showAvatar?: boolean
    /** 是否展示话题摘要 */
    showExcerpt?: boolean
  }>(),
  {
    showAvatar: true,
    showExcerpt: false,
  },
)

const emit = defineEmits<{ (e: 'click', topic: Topic): void }>()

const tabLabel = computed(() => TOPIC_TAB_LABEL[props.topic.tab] || props.topic.tab)
</script>

<template>
  <view
    class="mb-2.5 rounded-3 bg-white p-3 transition-all duration-150 active:scale-[0.995] active:bg-[#f7f8f9]"
    @click="emit('click', topic)"
  >
    <view v-if="showAvatar" class="flex items-center">
      <image
        class="mr-2 h-5 w-5 flex-shrink-0 rounded-full bg-[#eef0f2]"
        mode="aspectFill"
        :src="topic.author?.avatar_url"
      />
      <view class="min-w-0 flex-1 truncate text-2.75 text-[#7B8188]">
        <text>{{ topic.author?.loginname }}</text>
        <text class="mx-1 text-[#C8CDD2]">·</text>
        <text>{{ formatRelativeTime(topic.create_at) }}</text>
      </view>
      <view
        class="ml-2 flex-shrink-0 rounded-1 bg-[#EAF7F5] px-1.5 py-0.5 text-2.25 text-[#49B9AD]"
      >
        {{ tabLabel }}
      </view>
    </view>

    <view class="text-3.25 text-[#1C2023] font-bold leading-snug" :class="showAvatar ? 'mt-2' : ''">
      <text v-if="topic.top" class="mr-1 rounded-0.5 bg-[#49B9AD] px-1 text-2.25 text-white">
        置顶
      </text>
      <text v-if="topic.good" class="mr-1 rounded-0.5 bg-[#FFB020] px-1 text-2.25 text-white">
        精华
      </text>
      <text>{{ topic.title }}</text>
    </view>

    <view
      v-if="showExcerpt && topic.content"
      class="line-clamp-2 mt-1.5 text-2.75 text-[#7B8188] leading-relaxed"
    >
      {{ plainText(topic.content, 120) }}
    </view>

    <view class="mt-2 flex items-center text-2.5 text-[#9AA0A6]">
      <text>{{ topic.reply_count }} 回复</text>
      <text class="mx-2 text-[#D8DCE0]">·</text>
      <text>{{ topic.visit_count }} 浏览</text>
      <view class="flex-1" />
      <text v-if="topic.last_reply_at">最后回复 {{ formatRelativeTime(topic.last_reply_at) }}</text>
    </view>
  </view>
</template>
