import { PlayerState, UserStatus } from '@/lib/types/message'
import { UserInfo } from '@/lib/types/user'
import { atom } from 'nanostores'

export const $userStatus = atom<UserStatus[]>([])
export const $userInfo = atom<UserInfo | undefined>()
// 已成功发起加入的房间，用于断线重连后自动重新加入
export const $joinedRoom = atom<{ room: string; username: string } | undefined>()
export const $playerState = atom<PlayerState | undefined>()