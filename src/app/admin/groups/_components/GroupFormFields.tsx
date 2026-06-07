'use client'

import type { FormAsyncValidateOrFn, FormValidateOrFn, ReactFormExtendedApi } from '@tanstack/react-form'

import type { Group, GroupKind } from '@/common/groups/types'
import { FormCheckboxField, FormTextInput } from '@/common/ui/form'
import { ControlledFieldSelect } from '@/components/forms/controlled-field-select'

type GroupFormValues = {
  kindId: string
  name: string
  description?: string | null
  isContainer?: boolean
  parentGroupId?: string | null
}

type GroupFormFieldsProps<
  TFormValues extends GroupFormValues,
  TOnMount extends undefined | FormValidateOrFn<TFormValues>,
  TOnChange extends undefined | FormValidateOrFn<TFormValues>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<TFormValues>,
  TOnBlur extends undefined | FormValidateOrFn<TFormValues>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<TFormValues>,
  TOnSubmit extends undefined | FormValidateOrFn<TFormValues>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<TFormValues>,
  TOnDynamic extends undefined | FormValidateOrFn<TFormValues>,
  TOnDynamicAsync extends undefined | FormAsyncValidateOrFn<TFormValues>,
  TOnServer extends undefined | FormAsyncValidateOrFn<TFormValues>,
  TSubmitMeta,
> = {
  excludedParentGroupId?: string
  form: ReactFormExtendedApi<
    TFormValues,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnDynamic,
    TOnDynamicAsync,
    TOnServer,
    TSubmitMeta
  >
  groupKinds: GroupKind[]
  groups: Group[]
  isSaving: boolean
}

export function GroupFormFields<
  TFormValues extends GroupFormValues,
  TOnMount extends undefined | FormValidateOrFn<TFormValues>,
  TOnChange extends undefined | FormValidateOrFn<TFormValues>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<TFormValues>,
  TOnBlur extends undefined | FormValidateOrFn<TFormValues>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<TFormValues>,
  TOnSubmit extends undefined | FormValidateOrFn<TFormValues>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<TFormValues>,
  TOnDynamic extends undefined | FormValidateOrFn<TFormValues>,
  TOnDynamicAsync extends undefined | FormAsyncValidateOrFn<TFormValues>,
  TOnServer extends undefined | FormAsyncValidateOrFn<TFormValues>,
  TSubmitMeta,
>({
  excludedParentGroupId,
  form,
  groupKinds,
  groups,
  isSaving,
}: GroupFormFieldsProps<
  TFormValues,
  TOnMount,
  TOnChange,
  TOnChangeAsync,
  TOnBlur,
  TOnBlurAsync,
  TOnSubmit,
  TOnSubmitAsync,
  TOnDynamic,
  TOnDynamicAsync,
  TOnServer,
  TSubmitMeta
>) {
  const parentGroups = excludedParentGroupId ? groups.filter((group) => group.id !== excludedParentGroupId) : groups

  return (
    <>
      <form.Field name="kindId">
        {(field) => (
          <ControlledFieldSelect
            id={field.name}
            label="Kind"
            items={groupKinds}
            getValue={(kind) => kind.id}
            getLabel={(kind) => kind.name}
            placeholder="Select kind"
            value={String(field.state.value ?? '')}
            disabled={isSaving}
            onBlur={field.handleBlur}
            onValueChange={(value) => field.handleChange(value as never)}
            errors={field.state.meta.isTouched ? field.state.meta.errors : []}
          />
        )}
      </form.Field>
      <form.Field name="name">
        {(field) => (
          <FormTextInput
            id={field.name}
            label="Name"
            value={String(field.state.value ?? '')}
            disabled={isSaving}
            onBlur={field.handleBlur}
            onValueChange={(value) => field.handleChange(value as never)}
            errors={field.state.meta.isTouched ? field.state.meta.errors : []}
          />
        )}
      </form.Field>
      <form.Field name="description">
        {(field) => (
          <FormTextInput
            id={field.name}
            label="Description optional"
            value={String(field.state.value ?? '')}
            disabled={isSaving}
            onBlur={field.handleBlur}
            onValueChange={(value) => field.handleChange(value as never)}
            errors={field.state.meta.isTouched ? field.state.meta.errors : []}
          />
        )}
      </form.Field>
      <form.Field name="parentGroupId">
        {(field) => (
          <ControlledFieldSelect
            id={field.name}
            label="Parent optional"
            items={parentGroups}
            getValue={(group) => group.id}
            getLabel={(group) => group.name}
            placeholder="Root group"
            emptyItem={{ value: '', label: 'Root group' }}
            value={String(field.state.value ?? '')}
            disabled={isSaving}
            onBlur={field.handleBlur}
            onValueChange={(value) => field.handleChange((value || null) as never)}
            errors={field.state.meta.isTouched ? field.state.meta.errors : []}
          />
        )}
      </form.Field>
      <div className="flex items-center gap-6">
        <form.Field name="isContainer">
          {(field) => (
            <FormCheckboxField
              label="Container"
              checked={field.state.value === true}
              disabled={isSaving}
              onCheckedChange={(value) => field.handleChange(value as never)}
            />
          )}
        </form.Field>
      </div>
    </>
  )
}
