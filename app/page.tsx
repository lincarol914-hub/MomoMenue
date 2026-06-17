import { CustomerApp } from '@/src/CustomerApp'
import { MerchantApp } from '@/src/MerchantApp'
import { OnboardingPhone } from '@/src/components/OnboardingPhone'

// Query-param routing:
//   ?table=01    → customer ordering page for that table (the QR target)
//   ?onboarding=1 → first-run merchant onboarding (carousel + setup wizard)
//   ?view=home   → merchant back office opened straight at the dashboard
//   (default)    → merchant back office welcome screen
export default function Page({ searchParams }: { searchParams: { table?: string; onboarding?: string; view?: string } }) {
  if (searchParams?.table) return <CustomerApp table={searchParams.table} />
  if (searchParams?.onboarding) {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <OnboardingPhone />
      </div>
    )
  }
  return <MerchantApp initialScreen={searchParams?.view === 'home' ? 'home' : 'welcome'} />
}
