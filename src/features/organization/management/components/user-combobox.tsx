'use client'

import { useState } from 'react'
import type { UserLabel } from '@/features/organization/core/labels'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/ui/combobox'

type UserOption = { value: string; label: string }

export function UserCombobox({
  id,
  name,
  users,
  invalid = false,
}: {
  id: string
  name: string
  users: UserLabel[]
  invalid?: boolean
}) {
  const options: UserOption[] = users.map((user) => ({
    value: user.user.id,
    label: user.label,
  }))
  const [value, setValue] = useState<UserOption | null>(null)

  return (
    <>
      <Combobox
        items={options}
        value={value}
        onValueChange={setValue}
        itemToStringLabel={(option) => option?.label ?? ''}
      >
        <ComboboxInput aria-invalid={invalid} className="w-full" id={id} placeholder="Choose User" required showClear />
        <ComboboxContent>
          <ComboboxEmpty>No users found</ComboboxEmpty>
          <ComboboxList>
            {(option: UserOption) => (
              <ComboboxItem key={option.value} value={option}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <input name={name} type="hidden" value={value?.value ?? ''} />
    </>
  )
}
