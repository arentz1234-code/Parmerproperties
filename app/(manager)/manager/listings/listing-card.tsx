'use client'

import { useState } from 'react'
import { Bed, Bath, Square, ClipboardCopy, FileText, Check } from 'lucide-react'
import Link from 'next/link'
import { Unit } from '@/types'

interface ListingCardProps {
  unit: Unit
  propertyName: string
}

export function ListingCard({ unit, propertyName }: ListingCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopyLink() {
    const url = `${window.location.origin}/apply?unit=${unit.id}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden flex flex-col">
      {/* Property banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-0.5">
          {propertyName}
        </p>
        <p className="text-xl font-bold text-white">Unit {unit.unitNumber}</p>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 space-y-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {unit.bedrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bed size={14} className="text-gray-400" />
              {unit.bedrooms} BD
            </span>
          )}
          {unit.bathrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bath size={14} className="text-gray-400" />
              {unit.bathrooms} BA
            </span>
          )}
          {unit.sqft && (
            <span className="flex items-center gap-1.5">
              <Square size={14} className="text-gray-400" />
              {unit.sqft.toLocaleString()} sqft
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900">
            ${unit.rentAmount.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">/mo</span>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700">
          <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
          Now Leasing · Fall 2027
        </div>

        {unit.deposit && (
          <p className="text-xs text-gray-400">
            Security deposit: ${unit.deposit.toLocaleString()}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-2">
        <button
          onClick={handleCopyLink}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <ClipboardCopy size={14} />
              Copy Link
            </>
          )}
        </button>
        <Link
          href={`/applications?unitId=${unit.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <FileText size={14} />
          Applications
        </Link>
      </div>
    </div>
  )
}
