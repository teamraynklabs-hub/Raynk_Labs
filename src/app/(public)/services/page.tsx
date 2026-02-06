'use client'

import dynamic from 'next/dynamic'

const ServicesCard = dynamic(() => import('@/components/cards/ServiceCard'))

export default function Services() {
  return (
    <div>
      <ServicesCard />
    </div>
  )
}
