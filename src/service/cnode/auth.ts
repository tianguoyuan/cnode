import type { CnodeEnvelope, CnodeUser } from './types'

import { cnodeRequest } from './request'

/** 登录请求 */
export interface LoginPayload {
  name: string
  pass: string
}

/** 注册请求 */
export interface SignupPayload {
  email: string
  loginname: string
  pass: string
  turnstileToken?: string
}

/** 账号激活 */
export interface ActiveAccountPayload {
  name: string
  pass: string
  turnstileToken?: string
}

/** 找回密码 */
export interface SearchPassPayload {
  email: string
  turnstileToken?: string
}

/** 重置密码 */
export interface ResetPassPayload {
  key: string
  psw: string
}

/** 更新资料 */
export interface UpdateProfilePayload {
  location?: string
  receive_at_mail?: boolean
  receive_reply_mail?: boolean
  signature?: string
  url?: string
  weibo?: string
}

/** 修改密码 */
export interface ChangePassPayload {
  newPass: string
  oldPass: string
}

/** GitHub 注册/关联 */
export interface GithubCreatePayload {
  isnew?: boolean
  name?: string
  pass?: string
}

/** 上传预签名 */
export interface UploadPresignPayload {
  contentType?: string
  filename: string
}

/** 通用成功响应 */
export interface SuccessResponse extends CnodeEnvelope {
  success: true
}

/** 登录响应 */
export interface LoginResponse extends CnodeEnvelope {
  /** 部分部署会直接下发 accesstoken */
  accesstoken?: string
  success: true
}

/** 刷新 token 响应 */
export interface RefreshTokenResponse extends CnodeEnvelope {
  accessToken: string
  success: true
}

/** 校验 accesstoken 响应 */
export interface VerifyTokenResponse extends CnodeEnvelope {
  avatar_url: string
  id: string
  is_block: boolean
  is_muted: boolean
  loginname: string
  success: true
}

/** 当前用户响应 */
export interface CurrentUserResponse extends CnodeEnvelope {
  data?: CnodeUser | null
  success: boolean
}

/** 认证配置 */
export interface AuthConfigResponse extends CnodeEnvelope {
  data: {
    allow_signup: boolean
  }
  success: true
}

/** GitHub pending profile */
export interface GithubPendingResponse extends CnodeEnvelope {
  data: {
    loginname: string
    email: string
    avatar_url: string
    email_exists: boolean
  }
  success: true
}

/** 上传预签名响应 */
export interface UploadPresignResponse extends CnodeEnvelope {
  filename: string
  headers: Record<string, string>
  method: string
  success: true
  upload_url: string
  url: string
}

/** 本地登录 */
export function login(payload: LoginPayload, options: { toast?: boolean } = {}) {
  return cnodeRequest<LoginResponse>({
    auth: false,
    data: { ...payload },
    method: 'POST',
    url: '/auth/local/login',
    ...options,
  })
}

/** 本地注册 */
export function signup(payload: SignupPayload) {
  return cnodeRequest<SuccessResponse>({
    auth: false,
    data: { ...payload },
    method: 'POST',
    url: '/auth/local/signup',
  })
}

/** 获取公开认证配置 */
export function getAuthConfig(options: { toast?: boolean } = {}) {
  return cnodeRequest<AuthConfigResponse>({
    auth: false,
    method: 'GET',
    url: '/auth/config',
    ...options,
  })
}

/** 重新发送激活邮件 */
export function resendActivation(payload: ActiveAccountPayload) {
  return cnodeRequest<SuccessResponse>({
    auth: false,
    data: { ...payload },
    method: 'POST',
    url: '/auth/local/resend_activation',
  })
}

/** 激活账号 */
export function activeAccount(key: string) {
  return cnodeRequest<SuccessResponse>({
    auth: false,
    method: 'GET',
    query: { key },
    url: '/auth/local/active_account',
  })
}

/** 找回密码 */
export function searchPass(payload: SearchPassPayload) {
  return cnodeRequest<SuccessResponse>({
    auth: false,
    data: { ...payload },
    method: 'POST',
    url: '/auth/local/search_pass',
  })
}

/** 重置密码 */
export function resetPass(payload: ResetPassPayload) {
  return cnodeRequest<SuccessResponse>({
    auth: false,
    data: { ...payload },
    method: 'POST',
    url: '/auth/local/reset_pass',
  })
}

/** 校验 accesstoken */
export function verifyAccesstoken(
  accesstoken: string,
  options: { toast?: boolean; redirect?: boolean } = {},
) {
  return cnodeRequest<VerifyTokenResponse>({
    auth: false,
    data: { accesstoken },
    method: 'POST',
    url: '/accesstoken',
    ...options,
  })
}

/** 刷新 accesstoken */
export function refreshAccesstoken(options: { toast?: boolean; redirect?: boolean } = {}) {
  return cnodeRequest<RefreshTokenResponse>({
    auth: false,
    data: {},
    method: 'POST',
    url: '/user/refresh_token',
    ...options,
  })
}

/** 获取当前登录用户 */
export function getCurrentUser() {
  return cnodeRequest<CurrentUserResponse>({
    method: 'GET',
    url: '/auth/me',
  })
}

/** 退出登录 */
export function signout() {
  return cnodeRequest<SuccessResponse>({
    data: {},
    method: 'POST',
    url: '/auth/signout',
  })
}

/** 更新个人资料 */
export function updateProfile(payload: UpdateProfilePayload) {
  return cnodeRequest<SuccessResponse>({
    data: { ...payload },
    method: 'POST',
    url: '/auth/local/setting',
  })
}

/** 修改密码 */
export function changePass(payload: ChangePassPayload) {
  return cnodeRequest<SuccessResponse>({
    data: { ...payload },
    method: 'POST',
    url: '/auth/local/change_pass',
  })
}

/** 获取 GitHub pending profile */
export function getGithubPending() {
  return cnodeRequest<GithubPendingResponse>({
    method: 'GET',
    url: '/auth/github/pending',
  })
}

/** GitHub 注册或关联 */
export function githubCreate(payload: GithubCreatePayload) {
  return cnodeRequest<SuccessResponse>({
    data: { ...payload },
    method: 'POST',
    url: '/auth/github/create',
  })
}

/** 解绑 GitHub */
export function githubUnbind(password: string) {
  return cnodeRequest<SuccessResponse>({
    data: { password },
    method: 'POST',
    url: '/auth/github/unbind',
  })
}

/** 获取图片上传预签名 URL */
export function getUploadPresign(payload: UploadPresignPayload) {
  return cnodeRequest<UploadPresignResponse>({
    data: { ...payload },
    method: 'POST',
    url: '/upload/presign',
  })
}
