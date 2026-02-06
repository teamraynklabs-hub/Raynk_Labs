'use client'

import dynamic from 'next/dynamic'

const TeamCard = dynamic(() => import('@/components/cards/TeamCard'))

export default function Team() {
  return (
    <div>
      <TeamCard />
    </div>
  )
}
