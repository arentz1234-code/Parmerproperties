'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { generateMonthlyCharges } from '@/lib/actions/payment-actions'
import { Zap } from 'lucide-react'

export function GenerateChargesButton() {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await generateMonthlyCharges()
      if (result.success) {
        alert(`Generated ${result.data.length} charge(s) for this month.`)
      } else {
        alert(`Failed to generate charges: ${result.error}`)
      }
    })
  }

  return (
    <Button onClick={handleClick} variant="outline" disabled={isPending}>
      <Zap size={16} className="mr-2" />
      {isPending ? 'Generating...' : 'Generate Monthly Charges'}
    </Button>
  )
}
