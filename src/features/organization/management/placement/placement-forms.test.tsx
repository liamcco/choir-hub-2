import { beforeEach, describe, expect, mock, test } from 'bun:test'

mock.module('@/features/organization/management/placement/actions', () => ({
  transferPlacementAction: mock(async () => ({})),
  updatePlacementStatusAction: mock(async () => ({})),
}))

const { cleanup, render, screen } = await import('@testing-library/react')
const userEvent = (await import('@testing-library/user-event')).default
const { TransferPlacementForm } = await import('./placement-forms')

beforeEach(() => cleanup())

describe('TransferPlacementForm', () => {
  test('uses short choir names and offers every final voice in the selected choir', async () => {
    const user = userEvent.setup()
    render(
      <TransferPlacementForm
        userId="user-1"
        currentChoir="kk"
        currentSection="kk-b"
        currentVoice="B1"
        onCancel={() => {}}
        onSuccess={() => {}}
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Home Choir' }).textContent).toContain('KK')

    await user.click(screen.getByRole('combobox', { name: 'Section' }))

    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'No Section for now',
      'S1',
      'S2',
      'A1',
      'A2',
      'T1',
      'T2',
      'B1',
      'B2',
    ])

    await user.click(screen.getByRole('option', { name: 'B2' }))

    expect(screen.getByRole('combobox', { name: 'Section' }).textContent).toContain('B2')
    expect((document.querySelector('input[name="sectionId"]') as HTMLInputElement).value).toBe('kk-b')
    expect((document.querySelector('input[name="voice"]') as HTMLInputElement).value).toBe('B2')
  })
})
