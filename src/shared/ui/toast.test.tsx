import { beforeEach, describe, expect, test } from 'bun:test'

const { act, cleanup, render, screen, waitFor } = await import('@testing-library/react')
const { Dialog, DialogContent, DialogTrigger } = await import('./dialog')
const { Toaster, createToastManager } = await import('./toast')

beforeEach(() => {
  cleanup()
})

describe('toasts and modal layers', () => {
  test('keeps the toast viewport above an open dialog backdrop', async () => {
    const toastManager = createToastManager()

    render(
      <>
        <Dialog defaultOpen>
          <DialogTrigger>Open dialog</DialogTrigger>
          <DialogContent>Dialog content</DialogContent>
        </Dialog>
        <Toaster toastManager={toastManager} />
      </>,
    )

    await act(async () => {
      toastManager.add({ title: 'Saved', type: 'success' })
    })

    await waitFor(() => expect(screen.getByText('Saved')).toBeTruthy())

    const viewport = document.querySelector('[data-slot="toast-viewport"]')
    const backdrop = document.querySelector('[data-slot="dialog-overlay"]')

    expect(viewport).toBeTruthy()
    expect(backdrop).toBeTruthy()
    expect(viewport?.classList.contains('z-[60]')).toBe(true)
    expect(backdrop?.classList.contains('z-50')).toBe(true)
  })
})
