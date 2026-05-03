export type CurrentUserResponseData = ApiResponseData<{
  id: string
  email: string
  nickName: string
  points: number
  stats: {
    favorites: number
    history: number
  }
  createdAt: string
  roles?: string[]
  permissions?: string[]
}>
