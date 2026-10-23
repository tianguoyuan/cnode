<script lang="ts" setup>
import type { MessageItem as MessageItemType } from '@/service/cnode/types'

import { MESSAGE_TYPE_LABEL } from '@/enums/CnodeEnum'
import { formatRelativeTime, plainText } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    message: MessageItemType
    /** 是否未读（影响红点与文字层级） */
    unread?: boolean
  }>(),
  {
    unread: false,
  },
)

const emit = defineEmits<{ (e: 'click', message: MessageItemType): void }>()

const typeLabel = computed(() => MESSAGE_TYPE_LABEL[props.message.type] || '通知')
const excerpt = computed(() => plainText(props.message.reply?.content, 100))
</script>

<template>
  <view
    class="mb-2.5 rounded-3 bg-white p-3 transition-colors duration-150 active:bg-[#F7F8F9]"
    :class="unread ? '' : 'opacity-80'"
    @click="emit('click', message)"
  >
    <view class="flex items-center">
      <image
        class="mr-2 h-7 w-7 flex-shrink-0 rounded-full bg-[#eef0f2]"
        mode="aspectFill"
        :src="message.author?.avatar_url"
      />
      <view class="min-w-0 flex-1">
        <view class="flex items-center">
          <text class="truncate text-3 text-[#1C2023]" :class="unread ? 'font-bold' : ''">
            {{ message.author?.loginname }}
          </text>
          <text class="ml-1.5 flex-shrink-0 text-2.5 text-[#9AA0A6]">{{ typeLabel }}</text>
        </view>
        <view class="text-2.25 text-[#9AA0A6]">
          {{ formatRelativeTime(message.create_at) }}
        </view>
      </view>
      <view v-if="unread" class="h-2 w-2 flex-shrink-0 rounded-full bg-[#FF5A5F]" />
    </view>

    <view
      class="mt-2 text-3 leading-snug"
      :class="unread ? 'text-[#1C2023] font-bold' : 'text-[#7B8188] font-bold'"
    >
      {{ message.topic?.title }}
    </view>
    <view
      class="line-clamp-2 mt-1 text-2.75 leading-relaxed"
      :class="unread ? 'text-[#7B8188]' : 'text-[#9AA0A6]'"
    >
      {{ excerpt }}
    </view>
  </view>
</template>
