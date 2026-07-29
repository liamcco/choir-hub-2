export function focusField(id: string) {
  const field = document.getElementById(id)
  if (field instanceof HTMLElement) field.focus()
}
