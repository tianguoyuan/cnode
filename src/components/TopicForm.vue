<script lang="ts" setup>
import type { TopicPayload } from '@/service/cnode/topic'
import type { JobMeta, PublishTab, TopicDetail } from '@/service/cnode/types'

import TnIcon from '@tuniao/tnui-vue3-uniapp/components/icon/src/icon.vue'

import { PUBLISH_TABS, REMOTE_OPTIONS } from '@/enums/CnodeEnum'

const props = withDefaults(
  defineProps<{
    /** 编辑时传入的原始话题（内容为 Markdown） */
    topic?: TopicDetail | null
    submitting?: boolean
    submitText?: string
    /** 新建时的默认分类 */
    defaultTab?: PublishTab
  }>(),
  {
    defaultTab: 'share',
    submitText: '发布话题',
    submitting: false,
    topic: null,
  },
)

const emit = defineEmits<{ (e: 'submit', payload: TopicPayload): void }>()

const title = ref('')
const tab = ref<PublishTab>(props.defaultTab)
const content = ref('')

const job = reactive({
  company: '',
  company_logo: '',
  contact: '',
  experience: '',
  location: '',
  position: '',
  remote: 'on-site' as JobMeta['remote'],
  salary_max: '',
  salary_min: '',
  tech_tags: '',
})

const currentTabLabel = computed(
  () => PUBLISH_TABS.find((item) => item.key === tab.value)?.label || '请选择分类',
)
const currentRemoteLabel = computed(
  () => REMOTE_OPTIONS.find((item) => item.key === job.remote)?.label || '请选择',
)

function toast(title: string) {
  uni.showToast({ icon: 'none', title })
}

/** 回填编辑数据 */
watch(
  () => props.topic,
  (topic) => {
    if (!topic) return
    title.value = topic.title || ''
    tab.value = (topic.tab as PublishTab) || 'share'
    content.value = topic.content || ''

    const meta = topic.job_meta
    if (!meta) return
    job.company = meta.company || ''
    job.company_logo = meta.company_logo || ''
    job.position = meta.position || ''
    job.location = meta.location || ''
    job.remote = meta.remote || 'on-site'
    job.salary_min = meta.salary_min == null ? '' : String(meta.salary_min)
    job.salary_max = meta.salary_max == null ? '' : String(meta.salary_max)
    job.experience = meta.experience || ''
    job.tech_tags = (meta.tech_tags || []).join(', ')
    job.contact = meta.contact || ''
  },
  { immediate: true },
)

function chooseTab() {
  uni.showActionSheet({
    itemList: PUBLISH_TABS.map((item) => item.label),
    success(res) {
      const item = PUBLISH_TABS[res.tapIndex]
      if (item) tab.value = item.key as PublishTab
    },
  })
}

function chooseRemote() {
  uni.showActionSheet({
    itemList: REMOTE_OPTIONS.map((item) => item.label),
    success(res) {
      const item = REMOTE_OPTIONS[res.tapIndex]
      if (item) job.remote = item.key
    },
  })
}

function toNumber(value: string) {
  if (value === '' || value === null || value === undefined) return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function buildJobMeta(): JobMeta | null {
  if (!job.company.trim()) {
    toast('请填写公司名称')
    return null
  }
  if (!job.position.trim()) {
    toast('请填写招聘职位')
    return null
  }
  if (!job.location.trim()) {
    toast('请填写工作地点')
    return null
  }
  if (!job.contact.trim()) {
    toast('请填写联系方式')
    return null
  }

  return {
    company: job.company.trim(),
    company_logo: job.company_logo.trim() || null,
    contact: job.contact.trim(),
    experience: job.experience.trim() || null,
    location: job.location.trim(),
    position: job.position.trim(),
    remote: job.remote,
    salary_max: toNumber(job.salary_max),
    salary_min: toNumber(job.salary_min),
    tech_tags: job.tech_tags
      .split(/[,，\s]+/)
      .map((item) => item.trim())
      .filter(Boolean),
  }
}

function onSubmit() {
  if (props.submitting) return

  const trimmedTitle = title.value.trim()
  if (trimmedTitle.length < 5 || trimmedTitle.length > 100) {
    toast('标题长度需为 5-100 个字符')
    return
  }
  if (!content.value.trim()) {
    toast('请输入话题内容')
    return
  }

  const payload: TopicPayload = {
    content: content.value,
    tab: tab.value,
    title: trimmedTitle,
  }

  if (tab.value === 'job') {
    const meta = buildJobMeta()
    if (!meta) return
    payload.job_meta = meta
  }

  emit('submit', payload)
}
</script>

<template>
  <view class="pb-6">
    <view class="rounded-3 bg-white p-3.5">
      <view class="text-3 text-[#1C2023] font-bold">标题</view>
      <input
        v-model="title"
        class="mt-2 h-10 w-full rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
        :maxlength="100"
        placeholder="请输入标题（5-100 个字符）"
        placeholder-class="text-[#9AA0A6]"
      />

      <view class="mt-4 text-3 text-[#1C2023] font-bold">分类</view>
      <view
        class="mt-2 h-10 flex items-center justify-between rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
        @click="chooseTab"
      >
        <text>{{ currentTabLabel }}</text>
        <TnIcon class="text-[#9AA0A6]" name="down" />
      </view>

      <view class="mt-4 flex items-center justify-between">
        <view class="text-3 text-[#1C2023] font-bold">内容</view>
        <view class="text-2.5 text-[#9AA0A6]">支持 Markdown</view>
      </view>
      <textarea
        v-model="content"
        class="mt-2 h-64 w-full rounded-2 bg-[#F5F6F7] p-3 text-3 text-[#1C2023] leading-relaxed"
        :maxlength="-1"
        placeholder="分享你的想法、问题或经验..."
        placeholder-class="text-[#9AA0A6]"
      />
    </view>

    <view v-if="tab === 'job'" class="mt-3 rounded-3 bg-white p-3.5">
      <view class="mb-3 flex items-center">
        <view class="text-3.25 text-[#1C2023] font-bold">招聘信息</view>
        <view class="ml-2 rounded-1 bg-[#EAF7F5] px-1.5 py-0.5 text-2.25 text-[#49B9AD]">必填</view>
      </view>

      <view class="form-row">
        <text class="form-label">公司名称</text>
        <input v-model="job.company" class="form-input" placeholder="请输入公司名称" />
      </view>
      <view class="form-row">
        <text class="form-label">招聘职位</text>
        <input v-model="job.position" class="form-input" placeholder="如：Node.js 后端工程师" />
      </view>
      <view class="form-row">
        <text class="form-label">工作地点</text>
        <input v-model="job.location" class="form-input" placeholder="如：北京 / 上海" />
      </view>
      <view class="form-row" @click="chooseRemote">
        <text class="form-label">办公方式</text>
        <view class="form-input flex items-center justify-between">
          <text>{{ currentRemoteLabel }}</text>
          <TnIcon class="text-[#9AA0A6]" name="down" />
        </view>
      </view>
      <view class="form-row">
        <text class="form-label">薪资范围</text>
        <view class="flex flex-1 items-center">
          <input
            v-model="job.salary_min"
            class="form-input flex-1"
            placeholder="最低（K）"
            type="number"
          />
          <text class="mx-2 text-2.75 text-[#9AA0A6]">-</text>
          <input
            v-model="job.salary_max"
            class="form-input flex-1"
            placeholder="最高（K）"
            type="number"
          />
        </view>
      </view>
      <view class="form-row">
        <text class="form-label">经验要求</text>
        <input v-model="job.experience" class="form-input" placeholder="如：3-5 年" />
      </view>
      <view class="form-row">
        <text class="form-label">技术标签</text>
        <input
          v-model="job.tech_tags"
          class="form-input"
          placeholder="用逗号分隔，如：Node.js, TypeScript"
        />
      </view>
      <view class="form-row">
        <text class="form-label">联系方式</text>
        <input v-model="job.contact" class="form-input" placeholder="邮箱 / 微信 / 链接" />
      </view>
      <view class="form-row">
        <text class="form-label">公司 Logo</text>
        <input v-model="job.company_logo" class="form-input" placeholder="图片地址（选填）" />
      </view>
    </view>

    <view
      class="mx-3.5 mt-5 h-11 flex items-center justify-center rounded-full bg-[#49B9AD] text-3.5 text-white active:opacity-80"
      @click="onSubmit"
    >
      {{ submitting ? '提交中...' : submitText }}
    </view>
    <view class="mt-2 text-center text-2.5 text-[#9AA0A6]">请遵守社区规范，友善发言</view>
  </view>
</template>

<style lang="scss" scoped>
.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.form-label {
  flex-shrink: 0;
  width: 76px;
  font-size: 13px;
  color: #1c2023;
}

.form-input {
  box-sizing: border-box;
  flex: 1;
  height: 40px;
  padding: 0 12px;
  font-size: 13px;
  color: #1c2023;
  background: #f5f6f7;
  border-radius: 8px;
}
</style>
