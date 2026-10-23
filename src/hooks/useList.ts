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

  async function load(reset = false) {
    if (loading.value) return
    if (!reset && finished.value) return

    loading.value = true
    if (reset) {
      page.value = 1
      finished.value = false
    }

    try {
      const res = await fetcher({ limit: pageSize, page: page.value })
      const items = res.list || []
      total.value = res.total || 0

      list.value = reset ? items : [...list.value, ...items]
      finished.value = list.value.length >= total.value || items.length < pageSize

      if (!finished.value) {
        page.value += 1
      }
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
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

  /** 清空列表 */
  function clear() {
    list.value = []
    total.value = 0
    page.value = 1
    finished.value = false
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
