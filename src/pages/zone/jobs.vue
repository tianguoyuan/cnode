<script lang="ts" setup>
import type { JobCard } from '@/service/cnode/types'

import TnIcon from '@tuniao/tnui-vue3-uniapp/components/icon/src/icon.vue'

import EmptyState from '@/components/EmptyState.vue'
import JobItem from '@/components/JobItem.vue'
import LoadMore from '@/components/LoadMore.vue'
import Navbar from '@/components/Navbar.vue'
import Tabbar from '@/components/Tabbar.vue'
import { REMOTE_LABEL, REMOTE_OPTIONS } from '@/enums/CnodeEnum'
import { PageEnum } from '@/enums/PageEnum'
import { getJobFacets, getJobs } from '@/service/cnode'
import { goTopicDetail, requireLogin } from '@/utils/nav'

type SheetType = '' | 'location' | 'remote' | 'salary'

const location = ref('')
const remote = ref('')
const salaryMin = ref('')
const locations = ref<string[]>([])
const remoteOptions = ref<string[]>(REMOTE_OPTIONS.map((item) => item.key))
const filterSheet = ref<SheetType>('')

const salaryOptions = [
  { label: '不限薪资', value: '' },
  { label: '10K 以上', value: '10' },
  { label: '20K 以上', value: '20' },
  { label: '30K 以上', value: '30' },
  { label: '50K 以上', value: '50' },
]

const { finished, list, loading, loadMore, refresh } = useList<JobCard>(
  async ({ limit, page }) => {
    const res = await getJobs({
      limit,
      location,
      page,
      remote: remote.value || undefined,
      salary_min: salaryMin.value || undefined,
    })
    return { list: res.data, total: res.total }
  },
  { pageSize: 10 },
)

const locationLabel = computed(() => location.value || '全部城市')
const remoteLabel = computed(() => {
  if (!remote.value) return '办公方式'
  return REMOTE_LABEL[remote.value] || remote.value
})
const salaryLabel = computed(() => {
  if (!salaryMin.value) return '薪资要求'
  return `${salaryMin.value}K 以上`
})
const hasFilter = computed(() => !!location.value || !!remote.value || !!salaryMin.value)

const sheetTitle = computed(() => {
  if (filterSheet.value === 'location') return '选择城市'
  if (filterSheet.value === 'remote') return '办公方式'
  return '薪资要求'
})

const sheetOptions = computed(() => {
  if (filterSheet.value === 'location') {
    return [
      { label: '全部城市', value: '' },
      ...locations.value.map((item) => ({ label: item, value: item })),
    ]
  }
  if (filterSheet.value === 'remote') {
    return [
      { label: '全部方式', value: '' },
      ...remoteOptions.value.map((item) => ({
        label: REMOTE_LABEL[item] || item,
        value: item,
      })),
    ]
  }
  return salaryOptions
})

const currentSheetValue = computed(() => {
  if (filterSheet.value === 'location') return location.value
  if (filterSheet.value === 'remote') return remote.value
  return salaryMin.value
})

function openSheet(type: SheetType) {
  filterSheet.value = type
}

function selectFilter(value: string) {
  if (filterSheet.value === 'location') location.value = value
  if (filterSheet.value === 'remote') remote.value = value
  if (filterSheet.value === 'salary') salaryMin.value = value
  filterSheet.value = ''
  refresh()
}

function resetFilter() {
  location.value = ''
  remote.value = ''
  salaryMin.value = ''
  refresh()
}

async function loadFacets() {
  try {
    const res = await getJobFacets({ toast: false })
    if (res.data?.locations?.length) locations.value = res.data.locations
    if (res.data?.remote_options?.length) remoteOptions.value = res.data.remote_options
  } catch {
    // 筛选数据加载失败时保留默认值
  }
}

function onCreateJob() {
  if (!requireLogin()) return
  uni.navigateTo({ url: `${PageEnum.TOPIC_CREATE_PATH}?tab=job` })
}

let firstShow = true
onShow(() => {
  if (firstShow) {
    firstShow = false
    return
  }
  refresh()
})

onLoad(() => {
  loadFacets()
  refresh()
})

onPullDownRefresh(async () => {
  await refresh()
  uni.stopPullDownRefresh()
})

onReachBottom(() => {
  loadMore()
})
</script>

<template>
  <view class="min-h-screen bg-[#F5F7FB]">
    <view class="bg-[linear-gradient(180deg,#E1FAF7_0.57%,#FFFFFF_100%)] pb-3">
      <Navbar bgColor="#E9FBF8" :bottomShadow="false" title="招聘专区" />
      <view class="px-4 pt-1">
        <view class="text-4.25 text-[#1C2023] font-bold">发现心仪的工作</view>
        <view class="mt-1 text-2.75 text-[#7B8188]">Node.js 技术岗位，远程 / 坐班都有</view>
      </view>
    </view>

    <view
      class="mx-3 mt-3 rounded-3 bg-white p-2.5 shadow-[#49B9AD]/5 shadow-sm transition-all duration-150"
    >
      <view class="flex items-center">
        <view
          class="mr-2 flex-1 truncate rounded-2 bg-[#F5F6F7] px-2.5 py-2 text-2.75 transition-all duration-150 active:scale-[0.98] active:opacity-70"
          :class="location ? 'text-[#49B9AD]' : 'text-[#7B8188]'"
          @click="openSheet('location')"
        >
          {{ locationLabel }}
        </view>
        <view
          class="mr-2 flex-1 truncate rounded-2 bg-[#F5F6F7] px-2.5 py-2 text-2.75 transition-all duration-150 active:scale-[0.98] active:opacity-70"
          :class="remote ? 'text-[#49B9AD]' : 'text-[#7B8188]'"
          @click="openSheet('remote')"
        >
          {{ remoteLabel }}
        </view>
        <view
          class="flex-1 truncate rounded-2 bg-[#F5F6F7] px-2.5 py-2 text-2.75 transition-all duration-150 active:scale-[0.98] active:opacity-70"
          :class="salaryMin ? 'text-[#49B9AD]' : 'text-[#7B8188]'"
          @click="openSheet('salary')"
        >
          {{ salaryLabel }}
        </view>
      </view>
      <view v-if="hasFilter" class="mt-2 flex justify-end">
        <view class="text-2.5 text-[#9AA0A6] active:opacity-60" @click="resetFilter">清除筛选</view>
      </view>
    </view>

    <view class="px-3 pb-28 pt-3">
      <JobItem v-for="job in list" :key="job.id" :job="job" @click="goTopicDetail(job.id)" />

      <EmptyState v-if="!loading && !list.length" text="暂时没有符合条件的职位" />
      <LoadMore :empty="!list.length" :finished="finished" :loading="loading" />
    </view>

    <view
      class="fixed bottom-22 right-4 z-40 h-12 w-12 flex items-center justify-center rounded-full bg-[#49B9AD] text-white shadow-lg transition-all duration-150 active:scale-95 active:opacity-80"
      @click="onCreateJob"
    >
      <TnIcon name="add" size="26" />
    </view>

    <Tabbar :placeholder="false" :tabbarPath="PageEnum.JOBS_PATH" />

    <view
      v-if="filterSheet"
      class="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-[1px] transition-opacity duration-200"
      @click="filterSheet = ''"
    >
      <view
        class="animate-slide-up absolute bottom-0 left-0 right-0 mx-auto max-w-[500px] rounded-t-4 bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.08)] pb-safe"
        @click.stop
      >
        <view class="flex items-center justify-between border-b border-[#F0F2F4] px-4 py-3">
          <text class="text-3.25 text-[#1C2023] font-bold">{{ sheetTitle }}</text>
          <TnIcon class="text-[#9AA0A6]" name="close" @click="filterSheet = ''" />
        </view>
        <scroll-view class="max-h-80" scrollY>
          <view
            v-for="option in sheetOptions"
            :key="option.value"
            class="flex items-center justify-between px-4 py-3 text-3 transition-colors duration-150 active:scale-[0.99] active:bg-[#F7F8F9]"
            :class="
              option.value === currentSheetValue ? 'font-bold text-[#49B9AD]' : 'text-[#1C2023]'
            "
            @click="selectFilter(option.value)"
          >
            <text>{{ option.label }}</text>
            <TnIcon v-if="option.value === currentSheetValue" name="check" />
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
@keyframes slide-up {
  from {
    opacity: 0.9;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 220ms ease-out;
}
</style>

<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '招聘专区',
    enablePullDownRefresh: true,
    backgroundTextStyle: 'dark',
  },
  needLogin: false,
}
</route>
