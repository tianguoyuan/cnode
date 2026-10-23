<script lang="ts" setup>
interface Props {
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 4,
})
</script>

<template>
  <view>
    <view
      v-for="i in props.count"
      :key="i"
      class="mb-3 animate-pulse rounded-4 bg-white p-3 shadow-[0_6px_20px_rgba(73,185,173,0.06)]"
    >
      <view class="flex items-center">
        <view class="h-10 w-10 rounded-full bg-[#EEF3F7]" />
        <view class="ml-2.5 flex-1">
          <view class="h-3 w-24 rounded-full bg-[#EEF3F7]" />
          <view class="mt-2 h-2.5 w-16 rounded-full bg-[#F1F5F9]" />
        </view>
        <view class="h-5 w-10 rounded-full bg-[#F1F5F9]" />
      </view>
      <view class="mt-3 h-4 w-4/5 rounded-full bg-[#EEF3F7]" />
      <view class="mt-2 h-3 w-full rounded-full bg-[#F6F8FA]" />
      <view class="mt-2 h-3 w-2/3 rounded-full bg-[#F6F8FA]" />
      <view class="mt-3 flex items-center justify-between">
        <view class="h-2.5 w-20 rounded-full bg-[#F1F5F9]" />
        <view class="flex items-center gap-2">
          <view class="h-2.5 w-8 rounded-full bg-[#F1F5F9]" />
          <view class="h-2.5 w-8 rounded-full bg-[#F1F5F9]" />
        </view>
      </view>
    </view>
  </view>
</template>
