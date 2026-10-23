<script lang="ts" setup>
import TnIcon from '@tuniao/tnui-vue3-uniapp/components/icon/src/icon.vue'

withDefaults(
  defineProps<{
    loading?: boolean
    finished?: boolean
    /** 列表是否为空，为空时不显示「没有更多」 */
    empty?: boolean
    finishedText?: string
  }>(),
  {
    empty: false,
    finished: false,
    finishedText: '没有更多了',
    loading: false,
  },
)
</script>

<template>
  <view class="flex items-center justify-center py-4 text-2.75 text-[#9AA0A6]">
    <template v-if="loading">
      <TnIcon class="mr-1" name="loading" />
      <text>加载中...</text>
    </template>
    <template v-else-if="finished && !empty">
      <text>{{ finishedText }}</text>
    </template>
  </view>
</template>
