import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import CVBuilderPage from '@/app/cv-builder/page'

describe('CV Builder page', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the editor without crashing', () => {
    render(<CVBuilderPage />)

    expect(screen.getByRole('heading', { name: /Pembuat CV ATS Instan/i })).toBeInTheDocument()
    expect(screen.getByText(/Kesiapan ATS/i)).toBeInTheDocument()
  })
})
