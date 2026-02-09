import { z } from 'zod'

export const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, t('login.emailRequired'))
      .email(t('login.emailInvalid')),
    password: z.string().min(1, t('login.passwordRequired')),
  })

export type LoginFormData = {
  email: string
  password: string
}

