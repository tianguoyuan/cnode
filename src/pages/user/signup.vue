<script lang="ts" setup>
import Navbar from '@/components/Navbar.vue'
import { PageEnum } from '@/enums/PageEnum'
import { getAuthConfig, signup } from '@/service/cnode'

const loginname = ref('')
const email = ref('')
const pass = ref('')
const confirmPass = ref('')
const loading = ref(false)
const allowSignup = ref(true)
const configLoaded = ref(false)

function toast(title: string) {
  uni.showToast({ icon: 'none', title })
}

async function loadConfig() {
  try {
    const res = await getAuthConfig({ toast: false })
    allowSignup.value = !!res.data?.allow_signup
  } catch {
    allowSignup.value = true
  } finally {
    configLoaded.value = true
  }
}

function validate() {
  const name = loginname.value.trim()
  if (!/^[a-zA-Z0-9\-_]{2,50}$/.test(name)) {
    toast('用户名需为 2-50 位字母、数字、下划线或横线')
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    toast('请输入正确的邮箱地址')
    return false
  }
  if (pass.value.length < 8 || !/[a-zA-Z]/.test(pass.value)) {
    toast('密码至少 8 位，且需包含字母')
    return false
  }
  if (pass.value !== confirmPass.value) {
    toast('两次输入的密码不一致')
    return false
  }
  return true
}

async function onSubmit() {
  if (loading.value || !allowSignup.value) return
  if (!validate()) return

  loading.value = true
  try {
    const res = await signup({
      email: email.value.trim(),
      loginname: loginname.value.trim(),
      pass: pass.value,
    })
    uni.showModal({
      content: res.message || '注册成功，请前往邮箱完成激活。',
      showCancel: false,
      success: () => {
        uni.redirectTo({ url: PageEnum.LOGIN_PATH })
      },
      title: '注册成功',
    })
  } catch {
    // 接口层已提示错误
  } finally {
    loading.value = false
  }
}

function goLogin() {
  uni.redirectTo({ url: PageEnum.LOGIN_PATH })
}

onLoad(() => {
  loadConfig()
})
</script>

<template>
  <view class="min-h-screen bg-[#F5F7FB]">
    <Navbar showBackIcon showHomeIcon title="注册" />

    <view class="px-3 pt-3">
      <view
        v-if="configLoaded && !allowSignup"
        class="rounded-3 bg-[#FFF4E5] px-4 py-3 text-2.75 text-[#B26A00] leading-relaxed"
      >
        当前社区已关闭注册，请稍后再试或联系管理员。
      </view>

      <view v-else class="rounded-4 bg-white p-4">
        <view class="text-4.25 text-[#1C2023] font-bold">创建账号</view>
        <view class="mt-1 text-2.75 text-[#9AA0A6]">注册后需要前往邮箱激活账号</view>

        <view class="mt-5 text-2.75 text-[#1C2023] font-bold">用户名</view>
        <input
          v-model="loginname"
          class="mt-2 h-11 w-full rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
          :maxlength="50"
          placeholder="2-50 位字母、数字、下划线或横线"
        />

        <view class="mt-4 text-2.75 text-[#1C2023] font-bold">邮箱</view>
        <input
          v-model="email"
          class="mt-2 h-11 w-full rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
          placeholder="用于接收激活邮件"
          type="text"
        />

        <view class="mt-4 text-2.75 text-[#1C2023] font-bold">密码</view>
        <input
          v-model="pass"
          class="mt-2 h-11 w-full rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
          password
          placeholder="至少 8 位，需包含字母"
        />

        <view class="mt-4 text-2.75 text-[#1C2023] font-bold">确认密码</view>
        <input
          v-model="confirmPass"
          class="mt-2 h-11 w-full rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
          password
          placeholder="请再次输入密码"
        />

        <view
          class="mt-6 h-11 flex items-center justify-center rounded-full text-3.5 text-white active:opacity-80"
          :class="loading ? 'bg-[#9ED8D2]' : 'bg-[#49B9AD]'"
          @click="onSubmit"
        >
          {{ loading ? '注册中...' : '注册' }}
        </view>

        <view class="mt-4 flex items-center justify-center text-2.75">
          <text class="text-[#9AA0A6]">已有账号？</text>
          <text class="text-[#49B9AD]" @click="goLogin">去登录</text>
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
    navigationBarTitleText: '注册',
  },
  needLogin: false,
}
</route>
