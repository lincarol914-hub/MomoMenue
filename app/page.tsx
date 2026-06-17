import { CustomerApp } from '@/src/CustomerApp'
import { MerchantApp } from '@/src/MerchantApp'

// Query-param routing: ?table=01 opens the customer ordering page for that
// table (this is what each table's QR code points to); otherwise we render the
// merchant back office.
export default function Page({ searchParams }: { searchParams: { table?: string } }) {
  const table = searchParams?.table
  return table ? <CustomerApp table={table} /> : <MerchantApp />
}
