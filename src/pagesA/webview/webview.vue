<script lang="ts" setup>
const url = ref('')

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

onLoad((query) => {
  const raw = String(query?.url || '')
  if (!raw) return

  const target = safeDecode(raw)
  // 仅允许 http(s) 链接，避免加载 javascript: 等非法地址
  if (!/^https?:\/\//i.test(target)) {
    uni.showToast({ icon: 'none', title: '链接不合法' })
    return
  }
  url.value = target
})
</script>

<template>
  <view>
    <web-view v-if="url" :src="url" />
  </view>
</template>

<style lang="scss" scoped>
//
</style>

<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: 'webview',
  },
}
</route>
