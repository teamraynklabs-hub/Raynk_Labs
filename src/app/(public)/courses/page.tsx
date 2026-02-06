'use client'

import dynamic from 'next/dynamic'

const CourseCard = dynamic(() => import('@/components/cards/CourseCard'))

export default function Courses() {
  return (
    <div>
      <CourseCard />
    </div>
  )
}
