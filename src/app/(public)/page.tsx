'use client'

import dynamic from 'next/dynamic'
import Hero from '@/components/cards/Hero'
import LazySection from '@/components/LazySection'

/* =======================
   LAZY SECTION IMPORTS
   — bundles only load when the user scrolls near each section
======================= */
const AboutPage = dynamic(() => import('@/components/cards/About'))
const ServiceCard = dynamic(() => import('@/components/cards/ServiceCard'))
const CourseCard = dynamic(() => import('@/components/cards/CourseCard'))
const SoftwareCard = dynamic(() => import('@/components/cards/SoftwareCard'))
const UpcomingProject = dynamic(() => import('@/components/cards/UpcomingProject'))
const Community = dynamic(() => import('@/components/cards/Community'))
const ProjectsCard = dynamic(() => import('@/components/cards/ProjectCard'))
const Meetups = dynamic(() => import('@/components/cards/Meetups'))
const TeamCard = dynamic(() => import('@/components/cards/TeamCard'))
const ContactCard = dynamic(() => import('@/components/cards/ContactCard'))

/* =======================
   HOME PAGE
======================= */
export default function Home() {
  return (
    <main
      className="
        min-h-screen
        w-full
        bg-background
        text-foreground
      "
    >
      {/* ================= HERO (eager — above the fold) ================= */}
      <Hero />

      {/* ================= ABOUT ================= */}
      <LazySection minHeight="400px">
        <AboutPage />
      </LazySection>

      {/* ================= SERVICES ================= */}
      <LazySection minHeight="400px">
        <ServiceCard />
      </LazySection>

      {/* ================= COURSES ================= */}
      <LazySection minHeight="400px">
        <CourseCard />
      </LazySection>

      {/* ================= SOFTWARE / TOOLS ================= */}
      <LazySection minHeight="400px">
        <SoftwareCard />
      </LazySection>

      {/* ================= TURNING POINT ================= */}
      <LazySection minHeight="400px">
        <UpcomingProject />
      </LazySection>

      {/* ================= COMMUNITY ================= */}
      <LazySection minHeight="400px">
        <Community />
      </LazySection>

      {/* ================= PROJECTS ================= */}
      <LazySection minHeight="400px">
        <ProjectsCard />
      </LazySection>

      {/* ================= MEETUPS / EVENTS ================= */}
      <LazySection minHeight="400px">
        <Meetups />
      </LazySection>

      {/* ================= TEAM ================= */}
      <LazySection minHeight="400px">
        <TeamCard />
      </LazySection>

      {/* ================= CONTACT ================= */}
      <LazySection minHeight="400px">
        <ContactCard />
      </LazySection>
    </main>
  )
}
