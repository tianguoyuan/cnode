<script lang="ts" setup>
import { useUniAppSystemRectInfo } from '@tuniao/tnui-vue3-uniapp'

import Navbar from '@/components/Navbar.vue'
import { PageEnum } from '@/enums/PageEnum'
import { loginByPassword, loginByToken } from '@/service/cnode/session'
import { useUserStore } from '@/store'

type LoginMode = 'password' | 'token'

const { navBarInfo } = useUniAppSystemRectInfo()
const userStore = useUserStore()

const mode = ref<LoginMode>('password')
const name = ref('')
const pass = ref('')
const accesstoken = ref('')
const loading = ref(false)
const redirect = ref('')

function toast(title: string) {
  uni.showToast({ icon: 'none', title })
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function switchMode(value: LoginMode) {
  mode.value = value
}

function showError(error: unknown) {
  toast(error instanceof Error ? error.message : '操作失败，请稍后重试')
}

function goHome() {
  uni.switchTab({ url: PageEnum.HOME_PATH })
}

function afterLogin() {
  uni.showToast({ icon: 'success', title: '登录成功' })
  setTimeout(() => {
    const target = redirect.value
    if (target && !target.includes('/login')) {
      uni.reLaunch({ url: target })
      return
    }
    goHome()
  }, 400)
}

async function submitPassword() {
  if (loading.value) return
  if (!name.value.trim()) {
    toast('请输入用户名')
    return
  }
  if (!pass.value) {
    toast('请输入密码')
    return
  }

  loading.value = true
  try {
    await loginByPassword(name.value.trim(), pass.value)
    afterLogin()
  } catch (error) {
    showError(error)
  } finally {
    loading.value = false
  }
}

async function submitToken() {
  if (loading.value) return
  if (!accesstoken.value.trim()) {
    toast('请输入 accessToken')
    return
  }

  loading.value = true
  try {
    await loginByToken(accesstoken.value.trim())
    afterLogin()
  } catch (error) {
    showError(error)
  } finally {
    loading.value = false
  }
}

function goSignup() {
  uni.navigateTo({ url: PageEnum.SIGNUP_PATH })
}

function goReset() {
  uni.navigateTo({ url: PageEnum.RESET_PASSWORD_PATH })
}

onLoad((options) => {
  if (options?.redirect) redirect.value = safeDecode(String(options.redirect))
})
</script>

<template>
  <view class="min-h-screen bg-[#F5F7FB]">
    <view
      class="relative overflow-hidden bg-[linear-gradient(160deg,#49B9AD_0%,#2E8F86_100%)] pb-10"
    >
      <view class="absolute h-32 w-32 rounded-full bg-white/10 -right-8 -top-6" />
      <view class="absolute left-10 h-24 w-24 rounded-full bg-white/10 -bottom-10" />

      <Navbar
        bgColor="transparent"
        :bottomShadow="false"
        iconColor="#FFFFFF"
        showBackIcon
        showHomeIcon
        textColor="#FFFFFF"
        title=""
      />

      <view class="relative z-1 px-5 pt-2">
        <view class="text-6 text-white font-bold">登录</view>
        <view class="mt-1 text-3 text-white/80">和 Node.js 开发者一起交流</view>
      </view>
    </view>

    <view class="relative rounded-t-6 bg-[#F5F7FB] px-3 pt-3 -mt-6">
      <view v-if="userStore.isLogin" class="mb-3 flex items-center rounded-3 bg-white p-3">
        <image
          class="mr-2.5 h-9 w-9 flex-shrink-0 rounded-full bg-[#eef0f2]"
          mode="aspectFill"
          :src="userStore.userInfo?.avatar_url"
        />
        <view class="min-w-0 flex-1">
          <view class="text-2.5 text-[#9AA0A6]">当前已登录</view>
          <view class="truncate text-3 text-[#1C2023] font-bold">
            {{ userStore.userInfo?.loginname }}
          </view>
        </view>
        <view class="text-2.75 text-[#49B9AD]" @click="goHome">返回首页</view>
      </view>

      <view class="rounded-4 bg-white p-4">
        <view class="flex rounded-full bg-[#F5F6F7] p-1">
          <view
            class="h-8 flex flex-1 items-center justify-center rounded-full text-3 transition-all"
            :class="
              mode === 'password' ? 'bg-white font-bold text-[#1C2023] shadow-sm' : 'text-[#7B8188]'
            "
            @click="switchMode('password')"
          >
            账号登录
          </view>
          <view
            class="h-8 flex flex-1 items-center justify-center rounded-full text-3 transition-all"
            :class="
              mode === 'token' ? 'bg-white font-bold text-[#1C2023] shadow-sm' : 'text-[#7B8188]'
            "
            @click="switchMode('token')"
          >
            Token 登录
          </view>
        </view>

        <template v-if="mode === 'password'">
          <view class="mt-5 text-2.75 text-[#1C2023] font-bold">用户名</view>
          <input
            v-model="name"
            class="mt-2 h-11 w-full rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
            placeholder="请输入用户名"
          />

          <view class="mt-4 text-2.75 text-[#1C2023] font-bold">密码</view>
          <input
            v-model="pass"
            class="mt-2 h-11 w-full rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
            password
            placeholder="请输入密码"
          />

          <view
            class="mt-3 rounded-2 bg-[#F7FAFA] px-3 py-2 text-2.5 text-[#7B8188] leading-relaxed"
          >
            账号登录依赖浏览器 Cookie。若登录后无法获取 accessToken，请改用 Token 登录。
          </view>

          <view
            class="mt-5 h-11 flex items-center justify-center rounded-full text-3.5 text-white active:opacity-80"
            :class="loading ? 'bg-[#9ED8D2]' : 'bg-[#49B9AD]'"
            @click="submitPassword"
          >
            {{ loading ? '登录中...' : '登录' }}
          </view>
        </template>

        <template v-else>
          <view class="mt-5 text-2.75 text-[#1C2023] font-bold">accessToken</view>
          <input
            v-model="accesstoken"
            class="mt-2 h-11 w-full rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
            placeholder="请输入 accesstoken"
          />

          <view
            class="mt-3 rounded-2 bg-[#F7FAFA] px-3 py-2 text-2.5 text-[#7B8188] leading-relaxed"
          >
            在 CNode 网站登录后，可在设置页面的 accesstoken 一栏获取。Token 只保存在本地。
          </view>

          <view
            class="mt-5 h-11 flex items-center justify-center rounded-full text-3.5 text-white active:opacity-80"
            :class="loading ? 'bg-[#9ED8D2]' : 'bg-[#49B9AD]'"
            @click="submitToken"
          >
            {{ loading ? '验证中...' : '验证并登录' }}
          </view>
        </template>

        <view class="mt-5 flex items-center justify-center text-2.75">
          <text class="text-[#9AA0A6]">还没有账号？</text>
          <text class="text-[#49B9AD]" @click="goSignup">立即注册</text>
          <text class="mx-2 text-[#D8DCE0]">|</text>
          <text class="text-[#49B9AD]" @click="goReset">忘记密码</text>
        </view>
      </view>

      <view class="mt-4 text-center text-2.5 text-[#9AA0A6]">登录即表示同意社区规范与隐私政策</view>
    </view>
  </view>
</template>

<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '登录',
  },
  needLogin: false,
}
</route>
