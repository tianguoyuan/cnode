import { ref } from 'vue'

export interface UseListOptions {
  /** 是否在创建后立即加载 */
  immediate?: boolean
  /** 每页数量，默认 20 */
  pageSize?: number
}

/**
 * 分页列表通用逻辑
 * @param fetcher 分页数据加载器，返回 { list, total }
 */
export function useList<T>(
  fetcher: (params: { page: number; limit: number }) => Promise<{ list: T[]; total: number }>,
  options: UseListOptions = {},
) {
  const pageSize = options.pageSize ?? 20

  const list = ref([]) as Ref<T[]>
  const page = ref(1)
  const total = ref(0)
  const loading = ref(false)
  const finished = ref(false)
  const error = ref<unknown>(null)

  /** 请求序号，用于丢弃过期响应（如快速切换 tab 时的旧请求） */
  let requestId = 0
  /** 当前有效的请求序号 */
  function isLatest(id: number) {
    return id === requestId
  }

  async function load(reset = false) {
    // 加载更多时避免重复触发；refresh 允许打断进行中的请求
    if (!reset && (loading.value || finished.value)) return

    const currentId = ++requestId
    loading.value = true
    if (reset) {
      page.value = 1
      finished.value = false
    }

    try {
      const res = await fetcher({ limit: pageSize, page: page.value })
      if (!isLatest(currentId)) return

      const items = res.list || []
      total.value = res.total || 0
      list.value = reset ? items : [...list.value, ...items]
      finished.value = list.value.length >= total.value || items.length < pageSize
      if (!finished.value) {
        page.value += 1
      }
      error.value = null
    } catch (err) {
      if (isLatest(currentId)) error.value = err
    } finally {
      if (isLatest(currentId)) loading.value = false
    }
  }

  /** 重新加载第一页 */
  function refresh() {
    return load(true)
  }

  /** 加载下一页 */
  function loadMore() {
    return load(false)
  }

  /** 清空列表，并作废进行中的请求 */
  function clear() {
    requestId += 1
    list.value = []
    total.value = 0
    page.value = 1
    finished.value = false
    loading.value = false
  }

  if (options.immediate) {
    refresh()
  }

  return {
    clear,
    error,
    finished,
    list,
    loading,
    loadMore,
    page,
    refresh,
    total,
  }
}
