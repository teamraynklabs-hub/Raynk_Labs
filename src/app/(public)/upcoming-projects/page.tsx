'use client'

import dynamic from 'next/dynamic'

const UpcomingProject = dynamic(() => import('@/components/cards/UpcomingProject'))

export default function UpcomingProjectsPage() {
  return (
    <div>
      <UpcomingProject />
    </div>
  )
}
