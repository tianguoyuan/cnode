<script lang="ts" setup>
import Navbar from '@/components/Navbar.vue'
import { PageEnum } from '@/enums/PageEnum'
import { resetPass, searchPass } from '@/service/cnode'

const key = ref('')
const email = ref('')
const psw = ref('')
const confirmPsw = ref('')
const loading = ref(false)

const isReset = computed(() => !!key.value)

function toast(title: string) {
  uni.showToast({ icon: 'none', title })
}

function goLogin() {
  uni.redirectTo({ url: PageEnum.LOGIN_PATH })
}

async function onSearch() {
  if (loading.value) return
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    toast('请输入正确的邮箱地址')
    return
  }

  loading.value = true
  try {
    const res = await searchPass({ email: email.value.trim() })
    uni.showModal({
      content: res.message || '重置密码邮件已发送，请前往邮箱查收。',
      showCancel: false,
      success: () => {
        uni.navigateBack({ fail: () => goLogin() })
      },
      title: '邮件已发送',
    })
  } catch {
    // 接口层已提示错误
  } finally {
    loading.value = false
  }
}

async function onReset() {
  if (loading.value) return
  if (psw.value.length < 8 || !/[a-zA-Z]/.test(psw.value)) {
    toast('新密码至少 8 位，且需包含字母')
    return
  }
  if (psw.value !== confirmPsw.value) {
    toast('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    const res = await resetPass({ key: key.value, psw: psw.value })
    uni.showModal({
      content: res.message || '密码重置成功，请使用新密码登录。',
      showCancel: false,
      success: () => {
        goLogin()
      },
      title: '重置成功',
    })
  } catch {
    // 接口层已提示错误
  } finally {
    loading.value = false
  }
}

onLoad((options) => {
  key.value = String(options?.key || '')
})
</script>

<template>
  <view class="min-h-screen bg-[#F5F7FB]">
    <Navbar showBackIcon showHomeIcon :title="isReset ? '重置密码' : '找回密码'" />

    <view class="px-3 pt-3">
      <view class="rounded-4 bg-white p-4">
        <template v-if="isReset">
          <view class="text-4.25 text-[#1C2023] font-bold">设置新密码</view>
          <view class="mt-1 text-2.75 text-[#9AA0A6]">请设置一个新密码用于登录</view>

          <view class="mt-5 text-2.75 text-[#1C2023] font-bold">新密码</view>
          <input
            v-model="psw"
            class="mt-2 h-11 w-full rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
            password
            placeholder="至少 8 位，需包含字母"
          />

          <view class="mt-4 text-2.75 text-[#1C2023] font-bold">确认新密码</view>
          <input
            v-model="confirmPsw"
            class="mt-2 h-11 w-full rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
            password
            placeholder="请再次输入新密码"
          />

          <view
            class="mt-6 h-11 flex items-center justify-center rounded-full text-3.5 text-white active:opacity-80"
            :class="loading ? 'bg-[#9ED8D2]' : 'bg-[#49B9AD]'"
            @click="onReset"
          >
            {{ loading ? '提交中...' : '重置密码' }}
          </view>
        </template>

        <template v-else>
          <view class="text-4.25 text-[#1C2023] font-bold">找回密码</view>
          <view class="mt-1 text-2.75 text-[#9AA0A6]">输入注册邮箱，我们会发送重置密码链接</view>

          <view class="mt-5 text-2.75 text-[#1C2023] font-bold">注册邮箱</view>
          <input
            v-model="email"
            class="mt-2 h-11 w-full rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
            placeholder="请输入注册邮箱"
            type="text"
          />

          <view
            class="mt-6 h-11 flex items-center justify-center rounded-full text-3.5 text-white active:opacity-80"
            :class="loading ? 'bg-[#9ED8D2]' : 'bg-[#49B9AD]'"
            @click="onSearch"
          >
            {{ loading ? '发送中...' : '发送重置邮件' }}
          </view>

          <view class="mt-4 flex items-center justify-center text-2.75">
            <text class="text-[#9AA0A6]">想起密码了？</text>
            <text class="text-[#49B9AD]" @click="goLogin">去登录</text>
          </view>
        </template>
      </view>

      <view class="mt-4 rounded-2 bg-[#F7FAFA] px-3 py-2.5 text-2.5 text-[#7B8188] leading-relaxed">
        <template v-if="isReset">
          重置链接有时效限制，若提示链接无效或已过期，请重新发起找回密码。
        </template>
        <template v-else>若长时间未收到邮件，请检查垃圾邮件箱，或稍后重新发送。</template>
      </view>
    </view>
  </view>
</template>

<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '找回密码',
  },
  needLogin: false,
}
</route>
