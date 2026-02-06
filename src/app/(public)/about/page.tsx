'use client'

import dynamic from 'next/dynamic'

const AboutPage = dynamic(() => import('@/components/cards/About'))

export default function About() {
  return (
    <div>
      <AboutPage />
    </div>
  )
}
