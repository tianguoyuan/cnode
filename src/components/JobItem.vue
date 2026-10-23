<script lang="ts" setup>
import type { JobCard } from '@/service/cnode/types'

import { REMOTE_LABEL } from '@/enums/CnodeEnum'
import { formatSalary } from '@/utils/format'

const props = defineProps<{ job: JobCard }>()
const emit = defineEmits<{ (e: 'click', job: JobCard): void }>()

const remoteLabel = computed(() => REMOTE_LABEL[props.job.remote] || props.job.remote)
</script>

<template>
  <view
    class="mb-2.5 rounded-3 bg-white p-3 transition-all duration-150 active:scale-[0.995] active:bg-[#f7f8f9]"
    @click="emit('click', job)"
  >
    <view class="flex items-start">
      <image
        v-if="job.company_logo"
        class="mr-2.5 h-9 w-9 flex-shrink-0 rounded-2 bg-[#f2f4f6]"
        mode="aspectFill"
        :src="job.company_logo"
      />
      <view
        v-else
        class="mr-2.5 h-9 w-9 flex flex-shrink-0 items-center justify-center rounded-2 bg-[#EAF7F5] text-3.5 text-[#49B9AD]"
      >
        {{ job.company?.slice(0, 1) }}
      </view>

      <view class="min-w-0 flex-1">
        <view class="flex items-center justify-between">
          <view class="truncate text-3.25 text-[#1C2023] font-bold">{{ job.position }}</view>
          <view class="ml-2 flex-shrink-0 text-3 text-[#FF7A45] font-bold">
            {{ formatSalary(job.salary_min, job.salary_max) }}
          </view>
        </view>
        <view class="mt-0.5 truncate text-2.75 text-[#7B8188]">
          {{ job.company }}
          <text class="mx-1 text-[#D8DCE0]">·</text>
          {{ job.location }}
          <text class="mx-1 text-[#D8DCE0]">·</text>
          {{ remoteLabel }}
        </view>
      </view>
    </view>

    <view v-if="job.tech_tags?.length" class="mt-2 flex flex-wrap">
      <view
        v-for="tag in job.tech_tags.slice(0, 6)"
        :key="tag"
        class="mb-1 mr-1.5 rounded-1 bg-[#F5F6F7] px-1.5 py-0.5 text-2.25 text-[#7B8188]"
      >
        {{ tag }}
      </view>
    </view>

    <view class="line-clamp-2 mt-1.5 text-2.75 text-[#9AA0A6] leading-relaxed">
      {{ job.excerpt }}
    </view>

    <view class="mt-2 flex items-center text-2.5 text-[#9AA0A6]">
      <text v-if="job.experience">经验 {{ job.experience }}</text>
      <view class="flex-1" />
      <text>{{ job.reply_count }} 回复</text>
      <text class="mx-2 text-[#D8DCE0]">·</text>
      <text>{{ job.visit_count }} 浏览</text>
    </view>
  </view>
</template>
