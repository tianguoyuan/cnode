import type { CnodeEnvelope } from './types'

import { cnodeRequest } from './request'

/** 举报目标类型 */
export type ReportTargetType = 'topic' | 'reply'

/** 举报请求 */
export interface ReportPayload {
  /** 补充说明 */
  description?: string
  targetId: number
  targetType: ReportTargetType
  /** 举报原因分类，默认 other */
  type?: string
}

/** 举报响应 */
export interface ReportResponse extends CnodeEnvelope {
  success: true
}

/** 创建举报 */
export function createReport(payload: ReportPayload) {
  return cnodeRequest<ReportResponse>({
    data: { ...payload },
    method: 'POST',
    url: '/admin/reports',
  })
}
