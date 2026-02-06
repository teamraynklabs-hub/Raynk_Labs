'use client'

import dynamic from 'next/dynamic'

const ProjectsCard = dynamic(() => import('@/components/cards/ProjectCard'))

export default function ProjectsPage() {
  return <ProjectsCard />
}
