// app/(auth)/login/page.tsx
import { Suspense } from 'react'
import LoginPage from '@/components/login'   // your client component

// optional — if you want data‑fetching on every request
export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  )
}
