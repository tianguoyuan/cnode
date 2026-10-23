import type { CnodeEnvelope, Topic, UserBrief, UserDetail } from './types'

import { cnodeRequest } from './request'

/** 列表查询参数 */
export interface UserListQuery {
  limit?: number
  page?: number
}

/** 话题列表响应（用户维度） */
export interface UserTopicsResponse extends CnodeEnvelope {
  data: Topic[]
  success: true
  total: number
  user: UserBrief
}

/** 用户详情响应 */
export interface UserDetailResponse extends CnodeEnvelope {
  data: UserDetail
  success: true
}

/** 用户列表响应 */
export interface UserBriefListResponse extends CnodeEnvelope {
  data: UserBrief[]
  success: true
}

/** 获取星标用户 */
export function getStarUsers() {
  return cnodeRequest<UserBriefListResponse>({
    method: 'GET',
    url: '/users/stars',
  })
}

/** 获取积分前 100 用户 */
export function getTop100Users() {
  return cnodeRequest<UserBriefListResponse>({
    method: 'GET',
    url: '/users/top100',
  })
}

/** 获取用户详情 */
export function getUserDetail(loginname: string) {
  return cnodeRequest<UserDetailResponse>({
    method: 'GET',
    url: `/user/${loginname}`,
  })
}

/** 获取用户发布的话题 */
export function getUserTopics(loginname: string, query: UserListQuery = {}) {
  return cnodeRequest<UserTopicsResponse>({
    method: 'GET',
    query: { ...query },
    url: `/user/${loginname}/topics`,
  })
}

/** 获取用户发布的回复 */
export function getUserReplies(loginname: string, query: UserListQuery = {}) {
  return cnodeRequest<UserTopicsResponse>({
    method: 'GET',
    query: { ...query },
    url: `/user/${loginname}/replies`,
  })
}

/** 获取用户收藏的话题 */
export function getUserCollections(loginname: string, query: UserListQuery = {}) {
  return cnodeRequest<UserTopicsResponse>({
    method: 'GET',
    query: { ...query },
    url: `/user/${loginname}/collections`,
  })
}
