<script lang="ts" setup>
import TnIcon from '@tuniao/tnui-vue3-uniapp/components/icon/src/icon.vue'

import Navbar from '@/components/Navbar.vue'
import { getUserDetail, githubUnbind, updateProfile } from '@/service/cnode'
import { useUserStore } from '@/store'

const userStore = useUserStore()

const loading = ref(true)
const saving = ref(false)
const githubUsername = ref('')
const showUnbind = ref(false)
const unbindPass = ref('')
const unbinding = ref(false)

const form = reactive({
  location: '',
  signature: '',
  url: '',
})

const loginname = computed(() => userStore.userInfo?.loginname || '')

function toast(title: string) {
  uni.showToast({ icon: 'none', title })
}

async function loadDetail() {
  if (!loginname.value) {
    loading.value = false
    return
  }

  loading.value = true
  try {
    const res = await getUserDetail(loginname.value)
    form.location = res.data.location || ''
    form.signature = res.data.signature || ''
    form.url = res.data.url || ''
    githubUsername.value = res.data.githubUsername || ''
  } catch {
    // 接口层已提示错误
  } finally {
    loading.value = false
  }
}

async function onSave() {
  if (saving.value || loading.value) return
  saving.value = true
  try {
    await updateProfile({
      location: form.location.trim(),
      signature: form.signature.trim(),
      url: form.url.trim(),
    })
    uni.showToast({ icon: 'success', title: '保存成功' })
    setTimeout(() => uni.navigateBack(), 500)
  } catch {
    // 接口层已提示错误
  } finally {
    saving.value = false
  }
}

function toggleUnbind() {
  showUnbind.value = !showUnbind.value
  unbindPass.value = ''
}

async function onUnbind() {
  if (unbinding.value) return
  if (!unbindPass.value) {
    toast('请输入登录密码')
    return
  }

  unbinding.value = true
  try {
    await githubUnbind(unbindPass.value)
    githubUsername.value = ''
    showUnbind.value = false
    unbindPass.value = ''
    uni.showToast({ icon: 'success', title: '已解绑 GitHub' })
  } catch {
    // 接口层已提示错误
  } finally {
    unbinding.value = false
  }
}

onLoad(() => {
  loadDetail()
})
</script>

<template>
  <view class="min-h-screen bg-[#F5F7FB]">
    <Navbar showBackIcon title="编辑资料" />

    <view v-if="loading" class="flex flex-col items-center py-24">
      <TnIcon class="text-[#9AA0A6]" name="loading" />
      <text class="mt-2 text-3 text-[#9AA0A6]">加载中...</text>
    </view>

    <view v-else class="px-3 pb-8 pt-3">
      <view class="rounded-4 bg-white p-4">
        <view class="flex items-center">
          <image
            class="mr-3 h-14 w-14 flex-shrink-0 rounded-full bg-[#eef0f2]"
            mode="aspectFill"
            :src="userStore.userInfo?.avatar_url"
          />
          <view class="min-w-0 flex-1">
            <view class="truncate text-3.5 text-[#1C2023] font-bold">{{ loginname }}</view>
            <view class="mt-0.5 text-2.5 text-[#9AA0A6]">头像与用户名暂不支持在此修改</view>
          </view>
        </view>

        <view class="mt-5 text-2.75 text-[#1C2023] font-bold">个人主页</view>
        <input
          v-model="form.url"
          class="mt-2 h-11 w-full rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
          placeholder="https://your-site.com"
        />

        <view class="mt-4 text-2.75 text-[#1C2023] font-bold">所在城市</view>
        <input
          v-model="form.location"
          class="mt-2 h-11 w-full rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
          :maxlength="50"
          placeholder="例如：杭州"
        />

        <view class="mt-4 text-2.75 text-[#1C2023] font-bold">个性签名</view>
        <textarea
          v-model="form.signature"
          class="mt-2 h-24 w-full rounded-2 bg-[#F5F6F7] p-3 text-3 text-[#1C2023] leading-relaxed"
          :maxlength="200"
          placeholder="介绍一下自己吧"
        />
        <view class="mt-1 text-right text-2.25 text-[#9AA0A6]">
          {{ form.signature.length }}/200
        </view>

        <view
          class="mt-5 h-11 flex items-center justify-center rounded-full text-3.5 text-white active:opacity-80"
          :class="saving ? 'bg-[#9ED8D2]' : 'bg-[#49B9AD]'"
          @click="onSave"
        >
          {{ saving ? '保存中...' : '保存' }}
        </view>
      </view>

      <view class="mt-3 rounded-4 bg-white p-4">
        <view class="flex items-center">
          <view class="mr-3 h-9 w-9 flex items-center justify-center rounded-2 bg-[#F5F6F7]">
            <TnIcon color="#1C2023" name="github" />
          </view>
          <view class="min-w-0 flex-1">
            <view class="text-3 text-[#1C2023] font-bold">GitHub 账号</view>
            <view class="mt-0.5 truncate text-2.5 text-[#9AA0A6]">
              {{ githubUsername ? `已绑定 ${githubUsername}` : '尚未绑定 GitHub' }}
            </view>
          </view>
          <view v-if="githubUsername" class="text-2.75 text-[#FF5A5F]" @click="toggleUnbind">
            {{ showUnbind ? '取消' : '解绑' }}
          </view>
        </view>

        <view v-if="githubUsername && showUnbind" class="mt-3">
          <input
            v-model="unbindPass"
            class="h-11 w-full rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
            password
            placeholder="请输入当前账号密码以确认解绑"
          />
          <view
            class="mt-3 h-10 flex items-center justify-center rounded-full text-3 text-white active:opacity-80"
            :class="unbinding ? 'bg-[#FFB3B5]' : 'bg-[#FF5A5F]'"
            @click="onUnbind"
          >
            {{ unbinding ? '解绑中...' : '确认解绑' }}
          </view>
        </view>

        <view
          v-if="!githubUsername"
          class="mt-3 rounded-2 bg-[#F7FAFA] px-3 py-2 text-2.5 text-[#7B8188] leading-relaxed"
        >
          绑定 GitHub 需在网页端完成，绑定后可一键登录。
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '编辑资料',
  },
  needLogin: true,
}
</route>
