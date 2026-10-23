<template>
  <view class="px-3 pt-3">
    <view class="animate-pulse rounded-3 bg-white p-4">
      <view class="h-6 w-4/5 rounded-full bg-[#EEF3F7]" />
      <view class="mt-2 h-6 w-2/3 rounded-full bg-[#EEF3F7]" />
      <view class="mt-4 flex items-center">
        <view class="h-9 w-9 rounded-full bg-[#EEF3F7]" />
        <view class="ml-2.5 flex-1">
          <view class="h-3 w-20 rounded-full bg-[#EEF3F7]" />
          <view class="mt-2 h-2.5 w-24 rounded-full bg-[#F1F5F9]" />
        </view>
        <view class="h-5 w-10 rounded-full bg-[#F1F5F9]" />
      </view>
      <view class="mt-4 space-y-2">
        <view class="h-3 w-full rounded-full bg-[#F6F8FA]" />
        <view class="h-3 w-full rounded-full bg-[#F6F8FA]" />
        <view class="h-3 w-5/6 rounded-full bg-[#F6F8FA]" />
        <view class="h-3 w-4/6 rounded-full bg-[#F6F8FA]" />
        <view class="h-3 w-3/5 rounded-full bg-[#F6F8FA]" />
      </view>
    </view>

    <view class="mb-1 mt-4 flex items-center px-1">
      <view class="h-4 w-16 rounded-full bg-[#E6EBF0]" />
      <view class="ml-2 h-3 w-6 rounded-full bg-[#F1F5F9]" />
    </view>

    <view class="overflow-hidden rounded-3 bg-white">
      <view v-for="i in 3" :key="i" class="border-b border-[#F7F8F9] p-3 last:border-0">
        <view class="flex items-center">
          <view class="h-8 w-8 rounded-full bg-[#EEF3F7]" />
          <view class="ml-2 flex-1">
            <view class="h-2.5 w-16 rounded-full bg-[#EEF3F7]" />
            <view class="mt-1 h-2 w-12 rounded-full bg-[#F1F5F9]" />
          </view>
        </view>
        <view class="mt-2 space-y-1.5">
          <view class="h-2.5 w-full rounded-full bg-[#F6F8FA]" />
          <view class="h-2.5 w-11/12 rounded-full bg-[#F6F8FA]" />
          <view class="h-2.5 w-4/5 rounded-full bg-[#F6F8FA]" />
        </view>
      </view>
    </view>
  </view>
</template>
