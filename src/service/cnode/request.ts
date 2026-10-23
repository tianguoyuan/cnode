import type { CnodeEnvelope } from './types'

import qs from 'qs'

import { PageEnum } from '@/enums/PageEnum'
import { useUserStore } from '@/store'

/** 默认接口地址，可通过环境变量 VITE_CNODE_BASEURL 覆盖 */
const DEFAULT_BASE_URL = 'https://api.cnodejs.org/api/v1'

/** 请求超时时间 */
const TIMEOUT = 30 * 1000

/** 接口错误 */
export class ApiError extends Error {
  /** HTTP 状态码 */
  readonly statusCode: number
  /** 业务错误码 */
  readonly errorCode?: string

  constructor(message: string, statusCode: number, errorCode?: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errorCode = errorCode
  }
}

export interface CnodeRequestOptions {
  /** 是否自动注入 accesstoken，默认 true */
  auth?: boolean
  /** body 参数 */
  data?: Record<string, any>
  /** 是否展示 loading，默认 false */
  loading?: boolean
  /** 请求方法，默认 GET */
  method?: 'GET' | 'POST'
  /** query 参数 */
  query?: Record<string, any>
  /** 401 时是否跳转登录页，默认 true */
  redirect?: boolean
  /** 失败时是否弹 toast，默认 true */
  toast?: boolean
  /** 接口路径，如 /topics */
  url: string
}

/** 获取接口基础地址 */
export function getCnodeBaseUrl() {
  const baseUrl = ''
  return baseUrl.replace(/\/+$/, '')
}

/** 过滤掉空值后拼接 query */
function buildQueryString(query?: Record<string, any>) {
  if (!query) return ''
  const filtered: Record<string, any> = {}
  Object.keys(query).forEach((key) => {
    const value = query[key]
    if (value === undefined || value === null || value === '') return
    filtered[key] = value
  })
  const queryStr = qs.stringify(filtered, { arrayFormat: 'repeat' })
  return queryStr ? `?${queryStr}` : ''
}

/** 是否已经在登录页 */
function isOnLoginPage() {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  return !!current?.route && current.route.includes('login')
}

/**
 * CNode 请求封装
 * - 统一处理 { success, data, error_code, error_msg } 响应信封
 * - 自动注入 accesstoken（GET 走 query，POST 走 body）
 * - 401 自动清理登录态并跳转登录页
 */
export function cnodeRequest<T extends CnodeEnvelope = CnodeEnvelope>(
  options: CnodeRequestOptions,
): Promise<T> {
  const {
    auth = true,
    data,
    loading = false,
    method = 'GET',
    query,
    redirect = true,
    toast = true,
    url,
  } = options

  const userStore = useUserStore()
  const accesstoken = userStore.accesstoken

  const finalQuery: Record<string, any> = { ...(query || {}) }
  const finalData: Record<string, any> = { ...(data || {}) }

  if (auth && accesstoken) {
    if (method === 'GET') {
      if (finalQuery.accesstoken === undefined) finalQuery.accesstoken = accesstoken
    } else if (finalData.accesstoken === undefined) {
      finalData.accesstoken = accesstoken
    }
  }

  const fullUrl = getCnodeBaseUrl() + url + buildQueryString(finalQuery)
  console.log('fullUrl', fullUrl)
  if (loading) {
    uni.showLoading({ mask: true, title: '加载中...' })
  }

  return new Promise<T>((resolve, reject) => {
    uni.request({
      complete() {
        if (loading) {
          uni.hideLoading()
        }
      },
      data: method === 'GET' ? undefined : finalData,
      fail(err) {
        const error = new ApiError('网络错误，换个网络试试', -1)
        if (toast) {
          uni.showToast({ duration: 2000, icon: 'none', title: '网络错误，换个网络试试' })
        }
        reject(error || err)
      },
      header: {
        'Content-Type': 'application/json',
      },
      method,
      success(res) {
        const statusCode = res.statusCode
        const body = (res.data || {}) as CnodeEnvelope

        if (statusCode >= 200 && statusCode < 300 && body.success !== false) {
          resolve(body as T)
          return
        }

        const message = body.error_msg || body.message || `请求失败（${statusCode}）`
        const error = new ApiError(message, statusCode, body.error_code)

        if (statusCode === 401) {
          userStore.clearUserInfo()
          if (toast) {
            uni.showToast({ duration: 2000, icon: 'none', title: '登录已过期，请重新登录' })
          }
          if (redirect && !isOnLoginPage()) {
            uni.navigateTo({ url: PageEnum.LOGIN_PATH })
          }
          reject(error)
          return
        }

        if (toast) {
          uni.showToast({ duration: 2000, icon: 'none', title: message })
        }
        reject(error)
      },
      timeout: TIMEOUT,
      url: fullUrl,
    })
  })
}

export default cnodeRequest
