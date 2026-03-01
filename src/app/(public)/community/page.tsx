'use client'

import dynamic from 'next/dynamic'

const Community = dynamic(() => import('@/components/cards/Community'))

export default function CommunityPage() {
  return (
    <div>
      <Community />
    </div>
  )
}
