import { postJson } from "./api-client"
import { routes } from "./routes"

type RegisterPayload = {
  organizationName: string
  adminName: string
  adminPhone: string
  adminEmail: string
  password: string
}

type LoginPayload = {
  email?: string
  phone?: string
  password: string
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    postJson(routes.auth.register, payload),
  login: (payload: LoginPayload) =>
    postJson(routes.auth.login, payload),
}

