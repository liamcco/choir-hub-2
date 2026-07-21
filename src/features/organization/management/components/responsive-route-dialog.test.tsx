import { beforeEach, describe, expect, mock, test } from 'bun:test'

const routerBack = mock(() => {})
const { cleanup, render, screen } = await import('@testing-library/react')
const userEvent = (await import('@testing-library/user-event')).default
const { ResponsiveRouteDialog } = await import('./responsive-route-dialog')

beforeEach(() => {
  cleanup()
  routerBack.mockClear()
})

describe('responsive route dialog', () => {
  test('provides named dialog semantics, one content region, and an obvious Close action', async () => {
    const user = userEvent.setup()
    render(
      <ResponsiveRouteDialog
        title="Ada Lovelace"
        description="Member detail"
        contentLabel="Member detail content"
        onClose={routerBack}
      >
        <p>Current relationships</p>
      </ResponsiveRouteDialog>,
    )

    expect(screen.getByRole('dialog', { name: 'Ada Lovelace' })).toBeTruthy()
    expect(screen.getAllByRole('region', { name: 'Member detail content' })).toHaveLength(1)

    const closeButton = screen.getByRole('button', { name: 'Close' })
    closeButton.focus()
    await user.tab()
    expect(document.activeElement).toBe(closeButton)
    await user.click(closeButton)
    expect(routerBack).toHaveBeenCalledTimes(1)

    routerBack.mockClear()
    await user.keyboard('{Escape}')
    expect(routerBack).toHaveBeenCalledTimes(1)
  })
})
