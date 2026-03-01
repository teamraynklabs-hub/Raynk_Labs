'use client'

import dynamic from 'next/dynamic'

const Meetups = dynamic(() => import('@/components/cards/Meetups'))

export default function MeetupsPage() {
  return (
    <div>
      <Meetups />
    </div>
  )
}
