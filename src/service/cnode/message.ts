import type { CnodeEnvelope, MessageItem, MessageList } from './types'

import { cnodeRequest } from './request'

/** 消息列表响应 */
export interface MessagesResponse extends CnodeEnvelope {
  data: MessageList
  success: true
}

/** 未读消息数响应 */
export interface MessageCountResponse extends CnodeEnvelope {
  data: number
  success: true
}

/** 全部标记已读响应 */
export interface MarkAllResponse extends CnodeEnvelope {
  marked_msgs: { id: string }[]
  success: true
}

/** 单条标记已读响应 */
export interface MarkOneResponse extends CnodeEnvelope {
  marked_msg_id: string
  success: true
}

/** 获取消息列表 */
export function getMessages(query: { mdrender?: boolean } = {}) {
  return cnodeRequest<MessagesResponse>({
    method: 'GET',
    query: { ...query },
    url: '/messages',
  })
}

/** 获取未读消息数 */
export function getMessageCount() {
  return cnodeRequest<MessageCountResponse>({
    method: 'GET',
    url: '/message/count',
  })
}

/** 标记全部消息已读 */
export function markAllMessagesRead() {
  return cnodeRequest<MarkAllResponse>({
    data: {},
    method: 'POST',
    url: '/message/mark_all',
  })
}

/** 标记单条消息已读 */
export function markMessageRead(msgId: string) {
  return cnodeRequest<MarkOneResponse>({
    data: {},
    method: 'POST',
    url: `/message/mark_one/${msgId}`,
  })
}
