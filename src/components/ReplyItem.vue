<script lang="ts" setup>
import type { Reply } from '@/service/cnode/types'

import TnIcon from '@tuniao/tnui-vue3-uniapp/components/icon/src/icon.vue'

import { formatRelativeTime } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    reply: Reply
    /** 当前登录用户 loginname */
    currentLoginname?: string
    /** 当前用户是否管理员 */
    isAdmin?: boolean
  }>(),
  {
    currentLoginname: '',
    isAdmin: false,
  },
)

const emit = defineEmits<{
  (e: 'reply', reply: Reply): void
  (e: 'up', reply: Reply): void
  (e: 'edit', reply: Reply): void
  (e: 'delete', reply: Reply): void
}>()

const canManage = computed(
  () =>
    props.isAdmin ||
    (!!props.currentLoginname && props.currentLoginname === props.reply.author?.loginname),
)

const upCount = computed(() => props.reply.ups?.length || 0)

function onMore() {
  const actions: { label: string; run: () => void }[] = [
    { label: '回复', run: () => emit('reply', props.reply) },
  ]
  if (canManage.value) {
    actions.push({ label: '编辑', run: () => emit('edit', props.reply) })
    actions.push({ label: '删除', run: () => emit('delete', props.reply) })
  }
  uni.showActionSheet({
    itemList: actions.map((item) => item.label),
    success(res) {
      actions[res.tapIndex]?.run()
    },
  })
}
</script>

<template>
  <view class="border-b border-[#F0F2F4] bg-white px-3 py-3">
    <view class="flex items-center">
      <image
        class="mr-2 h-7 w-7 flex-shrink-0 rounded-full bg-[#eef0f2]"
        mode="aspectFill"
        :src="reply.author?.avatar_url"
      />
      <view class="min-w-0 flex-1">
        <view class="truncate text-3 text-[#1C2023]">{{ reply.author?.loginname }}</view>
        <view class="text-2.25 text-[#9AA0A6]">{{ formatRelativeTime(reply.create_at) }}</view>
      </view>
      <view class="flex items-center text-2.75 text-[#9AA0A6] active:opacity-60" @click="onMore">
        <TnIcon name="more-fill" />
      </view>
    </view>

    <view
      v-if="reply.reply_to"
      class="mt-2 border-l-2 border-[#49B9AD] bg-[#F7FAFA] px-2 py-1 text-2.5 text-[#7B8188]"
    >
      <text class="text-[#49B9AD]">@{{ reply.reply_to.author?.loginname }}</text>
      <text class="ml-1">
        {{ reply.reply_to.deleted ? '该回复已删除' : reply.reply_to.content_excerpt }}
      </text>
    </view>

    <rich-text
      class="reply-content mt-2 block text-3 text-[#333] leading-relaxed"
      :nodes="reply.content"
    />

    <view class="mt-2 flex items-center">
      <view
        class="flex items-center rounded-full px-2 py-0.5 text-2.5 active:opacity-60"
        :class="reply.is_uped ? 'bg-[#EAF7F5] text-[#49B9AD]' : 'bg-[#F5F6F7] text-[#7B8188]'"
        @click="emit('up', reply)"
      >
        <TnIcon class="mr-1" name="praise-fill" />
        <text>{{ upCount > 0 ? upCount : '赞' }}</text>
      </view>
      <view
        class="ml-2 flex items-center rounded-full bg-[#F5F6F7] px-2 py-0.5 text-2.5 text-[#7B8188] active:opacity-60"
        @click="emit('reply', reply)"
      >
        <TnIcon class="mr-1" name="message-fill" />
        <text>回复</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.reply-content {
  word-break: break-word;

  :deep(img) {
    max-width: 100%;
    height: auto;
  }

  :deep(a) {
    color: #49b9ad;
  }
}
</style>
