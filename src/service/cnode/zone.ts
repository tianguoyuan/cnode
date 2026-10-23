import type { CnodeEnvelope, JobCard, JobFacets, SidebarHome, TabInfo, Zone } from './types'

import { cnodeRequest } from './request'

/** 招聘列表查询参数 */
export interface JobsQuery {
  limit?: number | string
  location?: string
  page?: number | string
  remote?: string
  salary_min?: number | string
  tags?: string
}

/** 招聘列表响应 */
export interface JobsResponse extends CnodeEnvelope {
  data: JobCard[]
  success: true
  total: number
}

/** 招聘 facet 响应 */
export interface JobFacetsResponse extends CnodeEnvelope {
  data: JobFacets
  success: true
}

/** 公开专区响应 */
export interface ZonesResponse extends CnodeEnvelope {
  data: Zone[]
  success: true
}

/** 社区 tab 响应 */
export interface TabsResponse extends CnodeEnvelope {
  data: TabInfo[]
  success: true
}

/** 首页侧边栏响应 */
export interface SidebarHomeResponse extends CnodeEnvelope {
  data: SidebarHome
  success: true
}

/** 获取招聘专区列表 */
export function getJobs(query: JobsQuery = {}) {
  return cnodeRequest<JobsResponse>({
    method: 'GET',
    query: { ...query },
    url: '/zone/jobs',
  })
}

/** 获取招聘专区 facet 聚合 */
export function getJobFacets(options: { toast?: boolean } = {}) {
  return cnodeRequest<JobFacetsResponse>({
    method: 'GET',
    url: '/zone/jobs/facets',
    ...options,
  })
}

/** 获取公开专区列表 */
export function getZones() {
  return cnodeRequest<ZonesResponse>({
    method: 'GET',
    url: '/zones',
  })
}

/** 获取社区 tab 列表 */
export function getTabs(options: { toast?: boolean } = {}) {
  return cnodeRequest<TabsResponse>({
    method: 'GET',
    url: '/tabs',
    ...options,
  })
}

/** 获取首页侧边栏数据 */
export function getSidebarHome() {
  return cnodeRequest<SidebarHomeResponse>({
    method: 'GET',
    url: '/sidebar/home',
  })
}
