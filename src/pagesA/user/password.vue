<script lang="ts" setup>
import Navbar from '@/components/Navbar.vue'
import { changePass } from '@/service/cnode'

const oldPass = ref('')
const newPass = ref('')
const confirmPass = ref('')
const loading = ref(false)

function toast(title: string) {
  uni.showToast({ icon: 'none', title })
}

function validate() {
  if (!oldPass.value) {
    toast('请输入当前密码')
    return false
  }
  if (newPass.value.length < 8 || !/[a-zA-Z]/.test(newPass.value)) {
    toast('新密码至少 8 位，且需包含字母')
    return false
  }
  if (newPass.value === oldPass.value) {
    toast('新密码不能与当前密码相同')
    return false
  }
  if (newPass.value !== confirmPass.value) {
    toast('两次输入的新密码不一致')
    return false
  }
  return true
}

async function onSubmit() {
  if (loading.value || !validate()) return

  loading.value = true
  try {
    await changePass({ newPass: newPass.value, oldPass: oldPass.value })
    uni.showModal({
      content: '密码已更新，请使用新密码重新登录。',
      showCancel: false,
      success: () => {
        uni.navigateBack()
      },
      title: '修改成功',
    })
  } catch {
    // 接口层已提示错误
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <view class="min-h-screen bg-[#F5F7FB]">
    <Navbar showBackIcon title="修改密码" />

    <view class="px-3 pt-3">
      <view class="rounded-4 bg-white p-4">
        <view class="text-4.25 text-[#1C2023] font-bold">设置新密码</view>
        <view class="mt-1 text-2.75 text-[#9AA0A6]">为了账号安全，建议定期更换密码</view>

        <view class="mt-5 text-2.75 text-[#1C2023] font-bold">当前密码</view>
        <input
          v-model="oldPass"
          class="mt-2 h-11 w-full rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
          password
          placeholder="请输入当前密码"
        />

        <view class="mt-4 text-2.75 text-[#1C2023] font-bold">新密码</view>
        <input
          v-model="newPass"
          class="mt-2 h-11 w-full rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
          password
          placeholder="至少 8 位，需包含字母"
        />

        <view class="mt-4 text-2.75 text-[#1C2023] font-bold">确认新密码</view>
        <input
          v-model="confirmPass"
          class="mt-2 h-11 w-full rounded-2 bg-[#F5F6F7] px-3 text-3 text-[#1C2023]"
          password
          placeholder="请再次输入新密码"
        />

        <view
          class="mt-6 h-11 flex items-center justify-center rounded-full text-3.5 text-white active:opacity-80"
          :class="loading ? 'bg-[#9ED8D2]' : 'bg-[#49B9AD]'"
          @click="onSubmit"
        >
          {{ loading ? '提交中...' : '确认修改' }}
        </view>
      </view>

      <view class="mt-4 rounded-2 bg-[#F7FAFA] px-3 py-2.5 text-2.5 text-[#7B8188] leading-relaxed">
        修改成功后，其他设备上的登录状态可能会失效，需要重新登录。
      </view>
    </view>
  </view>
</template>

<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '修改密码',
  },
  needLogin: true,
}
</route>
