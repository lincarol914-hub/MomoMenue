import { CustomerApp } from '@/src/CustomerApp'
import { MerchantApp } from '@/src/MerchantApp'
import { MerchantEntry } from '@/src/MerchantEntry'
import { OnboardingPhone } from '@/src/components/OnboardingPhone'

// Query-param routing:
//   ?table=01     → customer ordering page for that table (the QR target)
//   ?onboarding=1 → force the onboarding flow (e.g. replay)
//   ?view=home    → merchant back office opened straight at the dashboard
//   (default)     → first visit shows onboarding, then remembers and goes
//                   straight to the dashboard on return (see MerchantEntry)
export default function Page({ searchParams }: { searchParams: { table?: string; onboarding?: string; view?: string } }) {
  if (searchParams?.table) return <CustomerApp table={searchParams.table} />
  if (searchParams?.onboarding) {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <OnboardingPhone />
      </div>
    )
  }
  if (searchParams?.view === 'home') return <MerchantApp initialScreen="home" />
  return <MerchantEntry />
}
