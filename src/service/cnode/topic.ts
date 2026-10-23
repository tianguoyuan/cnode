import type { CnodeEnvelope, JobMeta, PublishTab, Topic, TopicDetail, TopicTab } from './types'

import { cnodeRequest } from './request'

/** 话题列表查询参数 */
export interface TopicsQuery {
  limit?: number
  mdrender?: boolean
  page?: number
  tab?: TopicTab
}

/** 话题列表响应 */
export interface TopicsResponse extends CnodeEnvelope {
  data: Topic[]
  success: true
  total: number
}

/** 话题详情响应 */
export interface TopicDetailResponse extends CnodeEnvelope {
  data: TopicDetail
  success: true
}

/** 创建/编辑话题的公共字段 */
export interface TopicPayload {
  content: string
  /** tab 为 job 时必填 */
  job_meta?: JobMeta
  tab: PublishTab
  title: string
  /** 新用户人机验证 token */
  turnstileToken?: string
}

/** 创建话题响应 */
export interface CreateTopicResponse extends CnodeEnvelope {
  success: true
  topic_id: string
}

/** 编辑话题响应 */
export interface UpdateTopicResponse extends CnodeEnvelope {
  success: true
  topic_id: string
}

/** 创建回复响应 */
export interface CreateReplyResponse extends CnodeEnvelope {
  reply_id: string
  success: true
}

/** 获取话题列表 */
export function getTopics(query: TopicsQuery = {}) {
  return cnodeRequest<TopicsResponse>({
    method: 'GET',
    query: { ...query },
    url: '/topics',
  })
}

/** 创建话题 */
export function createTopic(payload: TopicPayload) {
  return cnodeRequest<CreateTopicResponse>({
    data: { ...payload },
    method: 'POST',
    url: '/topics',
  })
}

/** 获取话题详情 */
export function getTopicDetail(topicId: string, query: { mdrender?: boolean } = {}) {
  return cnodeRequest<TopicDetailResponse>({
    method: 'GET',
    query: { ...query },
    url: `/topic/${topicId}`,
  })
}

/** 编辑话题 */
export function updateTopic(payload: TopicPayload & { topic_id: string }) {
  return cnodeRequest<UpdateTopicResponse>({
    data: { ...payload },
    method: 'POST',
    url: '/topics/update',
  })
}

/** 创建回复 */
export function createReply(
  topicId: string,
  payload: { content: string; reply_id?: string; turnstileToken?: string },
) {
  return cnodeRequest<CreateReplyResponse>({
    data: { ...payload },
    method: 'POST',
    url: `/topic/${topicId}/replies`,
  })
}
