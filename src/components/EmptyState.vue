<script lang="ts" setup>
import { getImage } from '@/utils/imageManager'

withDefaults(
  defineProps<{
    text?: string
    image?: boolean
  }>(),
  {
    image: true,
    text: '暂无数据',
  },
)
</script>

<template>
  <view class="flex flex-col items-center justify-center py-16">
    <image
      v-if="image"
      class="h-28 w-28 opacity-80"
      mode="aspectFit"
      :src="getImage('commonEmpty')"
    />
    <view class="mt-3 text-3 text-[#9AA0A6]">{{ text }}</view>
  </view>
</template>
