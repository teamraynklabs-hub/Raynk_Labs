'use client'

import dynamic from 'next/dynamic'

const ContactCard = dynamic(() => import('@/components/cards/ContactCard'))

export default function Contact() {
  return (
    <div>
      <ContactCard />
    </div>
  )
}
