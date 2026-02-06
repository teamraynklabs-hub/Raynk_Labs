'use client'

import dynamic from 'next/dynamic'

const SoftwareCard = dynamic(() => import('@/components/cards/SoftwareCard'))

export default function AITools() {
  return (
    <div>
      <SoftwareCard />
    </div>
  )
}
