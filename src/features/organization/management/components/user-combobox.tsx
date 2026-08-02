'use client'

import { useState } from 'react'
import type { UserDisplayOption } from '@/features/organization/core/labels'
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
  value,
  onValueChange,
}: {
  id: string
  name: string
  users: UserDisplayOption[]
  invalid?: boolean
  value?: string
  onValueChange?: (value: string) => void
}) {
  const options: UserOption[] = users.map((user) => ({
    value: user.user.id,
    label: user.label,
  }))
  const [internalValue, setInternalValue] = useState<UserOption | null>(null)
  const selectedValue = value === undefined ? internalValue : (options.find((option) => option.value === value) ?? null)

  function handleValueChange(option: UserOption | null) {
    if (value === undefined) setInternalValue(option)
    onValueChange?.(option?.value ?? '')
  }

  return (
    <>
      <Combobox
        items={options}
        value={selectedValue}
        onValueChange={handleValueChange}
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
      <input name={name} type="hidden" value={selectedValue?.value ?? ''} />
    </>
  )
}
