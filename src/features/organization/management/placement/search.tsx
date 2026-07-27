'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/ui/combobox'
import type { PlacementUser } from './query'

export function PlacementSearch({ users }: { users: PlacementUser[] }) {
  const router = useRouter()
  const [value, setValue] = useState<(PlacementUser & { label: string }) | null>(null)
  const options = users.map((user) => ({ ...user, label: `${user.name} · ${user.email}` }))
  return (
    <Combobox
      items={options}
      value={value}
      onValueChange={(next) => {
        setValue(next)
        if (next) router.push(`/admin/placement?detail=${encodeURIComponent(next.id)}`, { scroll: false })
      }}
      itemToStringLabel={(item) => item?.label ?? ''}
    >
      <ComboboxInput aria-label="Search Users" className="max-w-xl" placeholder="Search for a User" showClear />
      <ComboboxContent>
        <ComboboxEmpty>No User found</ComboboxEmpty>
        <ComboboxList>
          {(option: (typeof options)[number]) => (
            <ComboboxItem key={option.id} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
