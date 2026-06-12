'use client'

import { ReactNode } from 'react'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ControlledFieldSelectSection<T> = {
  items: T[]
  key: string
  label: ReactNode
}

type ControlledFieldSelectEmptyItem = {
  label: ReactNode
  value: string
}

type ControlledFieldSelectProps<T> = {
  className?: string
  disabled?: boolean
  emptyItem?: ControlledFieldSelectEmptyItem
  errors?: Array<{ message?: string } | undefined>
  getLabel: (item: T) => ReactNode
  getValue: (item: T) => string
  id: string
  items?: T[]
  label: ReactNode
  onBlur?: () => void
  onValueChange: (value: string) => void
  placeholder?: ReactNode
  sections?: ControlledFieldSelectSection<T>[]
  value: string
}

export function ControlledFieldSelect<T>({
  className,
  disabled,
  emptyItem,
  errors,
  getLabel,
  getValue,
  id,
  items = [],
  label,
  onBlur,
  onValueChange,
  placeholder = 'Select item',
  sections,
  value,
}: ControlledFieldSelectProps<T>) {
  const selectableItems = sections ? sections.flatMap((section) => section.items) : items

  return (
    <Field className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select value={value} disabled={disabled} onValueChange={(nextValue) => onValueChange(nextValue ?? '')}>
        <SelectTrigger id={id} className="w-full" onBlur={onBlur}>
          <SelectValue placeholder={placeholder}>
            {(selectedValue) => {
              if (emptyItem && selectedValue === emptyItem.value) {
                return emptyItem.label
              }

              const selectedItem = selectableItems.find((item) => getValue(item) === selectedValue)

              return selectedItem ? getLabel(selectedItem) : placeholder
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {emptyItem ? <SelectItem value={emptyItem.value}>{emptyItem.label}</SelectItem> : null}
          {sections ? (
            sections.map((section, index) => (
              <SelectGroup key={section.key}>
                {index > 0 ? <SelectSeparator /> : null}
                <SelectLabel>{section.label}</SelectLabel>
                {section.items.map((item) => (
                  <SelectItem key={getValue(item)} value={getValue(item)}>
                    {getLabel(item)}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
          ) : (
            items.map((item) => (
              <SelectItem key={getValue(item)} value={getValue(item)}>
                {getLabel(item)}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <FieldError errors={errors} />
    </Field>
  )
}
