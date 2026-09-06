'use client'

import { useState } from 'react'
import {
  CreditCard,
  Building2,
  CheckCircle2,
  Download,
  ChevronDown,
  ChevronUp,
  Landmark,
  Zap,
} from 'lucide-react'
import { cn } from 'cn'
import { formatCurrency, formatDate } from '@/lib/utils'

// Mock tenant payment data (in production, fetched server-side or via API)
const MOCK_BALANCE = {
  rent: 1550,
  lateFee: 0,
  total: 1550,
  dueDate: new Date('2026-10-01'),
}

const PAYMENT_HISTORY = [
  { id: 'pay_001_sep', date: new Date('2026-08-31'), amount: 1550, method: 'Online', status: 'PAID', ref: 'REF-0901-001' },
  { id: 'pay_001_aug', date: new Date('2026-07-31'), amount: 1550, method: 'Online', status: 'PAID', ref: 'REF-0801-001' },
  { id: 'pay_001_jul', date: new Date('2026-06-30'), amount: 1550, method: 'Online', status: 'PAID', ref: 'REF-0701-001' },
  { id: 'pay_001_jun', date: new Date('2026-05-31'), amount: 1550, method: 'ACH',    status: 'PAID', ref: 'REF-0601-001' },
  { id: 'pay_001_may', date: new Date('2026-04-30'), amount: 1550, method: 'Online', status: 'PAID', ref: 'REF-0501-001' },
  { id: 'pay_001_apr', date: new Date('2026-03-31'), amount: 1550, method: 'ACH',    status: 'PAID', ref: 'REF-0401-001' },
]

type PaymentMethod = 'ach' | 'credit' | 'debit'

interface PaymentMethodOption {
  id: PaymentMethod
  label: string
  description: string
  icon: React.ReactNode
  fee?: string
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'ach',
    label: 'Bank Transfer (ACH)',
    description: 'Connect your bank account — free, 2–3 business days',
    icon: <Landmark size={20} />,
  },
  {
    id: 'credit',
    label: 'Credit Card',
    description: 'Visa, Mastercard, Amex',
    icon: <CreditCard size={20} />,
    fee: '2.9% + $0.30',
  },
  {
    id: 'debit',
    label: 'Debit Card',
    description: 'Instant payment from your checking account',
    icon: <Zap size={20} />,
    fee: '1.5%',
  },
]

export default function PayRentPage() {
  const [amount, setAmount] = useState(MOCK_BALANCE.total.toFixed(2))
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('ach')
  const [autoPay, setAutoPay] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const selectedMethodObj = PAYMENT_METHODS.find((m) => m.id === selectedMethod)!
  const parsedAmount = parseFloat(amount) || 0
  const processingFee =
    selectedMethod === 'credit'
      ? Math.round((parsedAmount * 0.029 + 0.3) * 100) / 100
      : selectedMethod === 'debit'
      ? Math.round(parsedAmount * 0.015 * 100) / 100
      : 0
  const totalCharged = parsedAmount + processingFee

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (parsedAmount <= 0) return
    setIsSubmitting(true)
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 1800))
    setIsSubmitting(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center py-16 gap-6 text-center">
        <div className="size-20 rounded-full bg-[#2d9d5c]/10 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-[#2d9d5c]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Submitted!</h1>
          <p className="text-gray-500 mt-2">
            Your payment of{' '}
            <span className="font-semibold text-gray-800">{formatCurrency(totalCharged)}</span> has
            been submitted successfully.
          </p>
          <p className="text-gray-400 text-sm mt-1">
            You'll receive a confirmation email shortly.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setSuccess(false)}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Pay Rent
          </button>
          <button className="rounded-xl bg-[#2d9d5c] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#238a4e] transition-colors flex items-center gap-2">
            <Download size={14} />
            Download Receipt
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Balance card */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="bg-gradient-to-br from-[#2d9d5c] to-[#238a4e] p-6 text-white">
          <p className="text-sm font-medium text-white/80">Current Balance</p>
          <p className="text-4xl font-bold mt-1">{formatCurrency(MOCK_BALANCE.total)}</p>
          <p className="text-sm text-white/70 mt-1">
            Due on {formatDate(MOCK_BALANCE.dueDate)}
          </p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Monthly Rent</span>
            <span className="font-medium text-gray-800">{formatCurrency(MOCK_BALANCE.rent)}</span>
          </div>
          {MOCK_BALANCE.lateFee > 0 && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-red-500">Late Fee</span>
              <span className="font-medium text-red-600">{formatCurrency(MOCK_BALANCE.lateFee)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment form */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Make a Payment</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Payment Amount
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-gray-200 pl-8 pr-4 py-3 text-gray-900 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c]"
                placeholder="0.00"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => setAmount(MOCK_BALANCE.total.toFixed(2))}
              className="mt-1.5 text-xs text-[#2d9d5c] hover:underline font-medium"
            >
              Pay full balance ({formatCurrency(MOCK_BALANCE.total)})
            </button>
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                    selectedMethod === method.id
                      ? 'border-[#2d9d5c] bg-[#2d9d5c]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span
                    className={cn(
                      'shrink-0',
                      selectedMethod === method.id ? 'text-[#2d9d5c]' : 'text-gray-400'
                    )}
                  >
                    {method.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{method.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                  </div>
                  {method.fee && (
                    <span className="shrink-0 text-xs text-gray-400 font-medium">
                      {method.fee} fee
                    </span>
                  )}
                  <div
                    className={cn(
                      'shrink-0 size-4 rounded-full border-2 flex items-center justify-center',
                      selectedMethod === method.id ? 'border-[#2d9d5c]' : 'border-gray-300'
                    )}
                  >
                    {selectedMethod === method.id && (
                      <div className="size-2 rounded-full bg-[#2d9d5c]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Auto-pay toggle */}
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
            <div>
              <p className="text-sm font-medium text-gray-800">Enable Auto-Pay</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Automatically pay on the 1st of each month
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAutoPay(!autoPay)}
              className={cn(
                'relative shrink-0 h-6 w-11 rounded-full transition-colors',
                autoPay ? 'bg-[#2d9d5c]' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform',
                  autoPay ? 'translate-x-5' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>

          {/* Summary */}
          {(parsedAmount > 0) && (
            <div className="rounded-xl bg-gray-50 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payment</span>
                <span className="font-medium">{formatCurrency(parsedAmount)}</span>
              </div>
              {processingFee > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Processing fee ({selectedMethodObj.fee})</span>
                  <span className="font-medium">{formatCurrency(processingFee)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total Charged</span>
                <span className="font-bold text-gray-900">{formatCurrency(totalCharged)}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || parsedAmount <= 0}
            className={cn(
              'w-full rounded-xl py-3.5 text-base font-semibold text-white transition-all',
              isSubmitting || parsedAmount <= 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#2d9d5c] hover:bg-[#238a4e] active:scale-[0.98]'
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Processing...
              </span>
            ) : (
              `Pay ${parsedAmount > 0 ? formatCurrency(totalCharged) : 'Now'}`
            )}
          </button>
        </form>
      </div>

      {/* Transaction history */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-base font-semibold text-gray-900">Payment History</h2>
          {showHistory ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </button>

        {showHistory && (
          <div className="border-t border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Method</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {PAYMENT_HISTORY.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 text-gray-700">{formatDate(p.date)}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-gray-900">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-6 py-3.5 text-gray-500 hidden sm:table-cell">{p.method}</td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={12} />
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right hidden md:table-cell">
                        <button className="text-xs text-[#2d9d5c] hover:underline font-medium flex items-center gap-1 ml-auto">
                          <Download size={12} />
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
