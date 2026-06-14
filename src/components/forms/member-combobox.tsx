'use client'

import type { ReactNode } from 'react'

import type { User } from '@/common/groups/types'
import { userLabel } from '@/common/groups/utils'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

type MemberComboboxProps = {
  disabled?: boolean
  emptyLabel?: ReactNode
  id?: string
  onBlur?: () => void
  onValueChange: (value: string) => void
  placeholder?: string
  users: User[]
  value: string
}

export function MemberCombobox({
  disabled,
  emptyLabel = 'No members found.',
  id,
  onBlur,
  onValueChange,
  placeholder = 'Search members',
  users,
  value,
}: MemberComboboxProps) {
  const selectedUser = users.find((user) => user.id === value) ?? null
  const allowedValueChangeReasons = new Set(['itemPress', 'clearPress', 'inputClear'])

  return (
    <Combobox<User>
      items={users}
      value={selectedUser}
      itemToStringLabel={userLabel}
      itemToStringValue={(user) => user.id}
      isItemEqualToValue={(item, selected) => item.id === selected.id}
      filter={(user, query) => userLabel(user).toLowerCase().includes(query.toLowerCase())}
      onValueChange={(user, eventDetails) => {
        if (!allowedValueChangeReasons.has(eventDetails.reason)) {
          return
        }

        onValueChange(user?.id ?? '')
      }}
    >
      <ComboboxInput
        id={id}
        className="w-full"
        disabled={disabled}
        placeholder={placeholder}
        showClear
        onBlur={onBlur}
      />
      <ComboboxContent>
        <ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
        <ComboboxList>
          {users.map((user) => (
            <ComboboxItem key={user.id} value={user}>
              {userLabel(user)}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export function ControlledMemberCombobox({
  className,
  errors,
  label,
  ...props
}: MemberComboboxProps & {
  className?: string
  errors?: Array<{ message?: string } | undefined>
  label: ReactNode
}) {
  return (
    <Field className={className}>
      {props.id ? <FieldLabel htmlFor={props.id}>{label}</FieldLabel> : <FieldLabel>{label}</FieldLabel>}
      <MemberCombobox {...props} />
      <FieldError errors={errors} />
    </Field>
  )
}
