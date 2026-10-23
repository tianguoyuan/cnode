<script lang="ts" setup>
// import { useUniAppSystemRectInfo } from '@tuniao/tnui-vue3-uniapp'
import TnIcon from '@tuniao/tnui-vue3-uniapp/components/icon/src/icon.vue'
import TnNavbar from '@tuniao/tnui-vue3-uniapp/components/navbar/src/navbar.vue'

import { PageEnum } from '@/enums/PageEnum'
// const { navBarInfo } = useUniAppSystemRectInfo()

const props = withDefaults(
  defineProps<{
    bgColor?: string
    bottomShadow?: boolean
    clickBackIcon?: () => void
    clickHomeIcon?: () => void
    frosted?: boolean
    opacity?: number
    placeholder?: boolean
    showBackIcon?: boolean
    showBorder?: boolean
    showHomeIcon?: boolean
    textColor?: string
    title: string
  }>(),
  {
    bgColor: 'white',
    bottomShadow: true,
    clickBackIcon: undefined,
    clickHomeIcon: undefined,
    frosted: false,
    opacity: 1,
    placeholder: true,
    showBackIcon: false,
    showBorder: false,
    showHomeIcon: false,
    textColor: 'black',
    title: '',
  },
)

const showLeftBox = computed(() => props.showBackIcon || props.showHomeIcon)

function handleClickBackIcon() {
  if (props.clickBackIcon) {
    props.clickBackIcon()
  } else {
    if (getCurrentPages().length <= 1) {
      uni.reLaunch({ url: PageEnum.HOME_PATH })
    } else {
      uni.navigateBack({
        fail: () => {
          uni.reLaunch({ url: PageEnum.HOME_PATH })
        },
      })
    }
  }
}

function handleClickHomeIcon() {
  if (props.clickHomeIcon) {
    props.clickHomeIcon()
  } else {
    uni.reLaunch({ url: PageEnum.HOME_PATH })
  }
}
</script>

<template>
  <TnNavbar
    :bgColor="props.bgColor"
    :bottomShadow="props.bottomShadow"
    fixed
    :frosted="props.frosted"
    :opacity="props.opacity"
    :placeholder="props.placeholder"
    :textColor="props.textColor"
  >
    <!-- :status-height="navBarInfo.statusHeight"
    height="90rpx" -->
    <view class="text-3.5">
      <slot name="title" />
      {{ props.title }}

      <view class="absolute bottom-0 right-3 top-0 w-21.75 flex items-center justify-end">
        <slot name="right" />
      </view>
    </view>

    <!-- border -->
    <view
      v-if="props.showBorder"
      class="absolute bottom-0 left-0 right-0 h-[1px] scale-y-50 bg-#efefef"
    />
    <template #back>
      <view
        v-if="showLeftBox"
        class="relative box-border h-8 flex items-center justify-center rounded-full bg-[rgba(28,32,35,0.06)] text-3.75 ring-1 ring-[rgba(28,32,35,0.04)] will-change-transform active:scale-95 active:opacity-80"
        :class="[props.showBackIcon && props.showHomeIcon ? 'w-16' : 'w-8']"
      >
        <view
          v-if="props.showBackIcon"
          class="h-full flex flex-1 items-center justify-center"
          @click="handleClickBackIcon"
        >
          <TnIcon color="#1C2023" name="left-arrow" />
        </view>
        <view
          v-if="props.showBackIcon && props.showHomeIcon"
          class="h-4 w-1px flex-shrink-0 bg-[rgba(28,32,35,0.12)]"
        />
        <view
          v-if="props.showHomeIcon"
          class="h-full flex flex-1 items-center justify-center"
          @click="handleClickHomeIcon"
        >
          <TnIcon color="#1C2023" name="home-capsule-fill" />
        </view>
      </view>
    </template>
  </TnNavbar>
</template>

<style lang="scss" scoped>
//
</style>
