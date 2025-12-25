'use client'

/* =======================
   SECTION IMPORTS
======================= */
import Hero from '@/components/cards/Hero'
import AboutPage from '@/components/cards/About'
import ServiceCard from '@/components/cards/ServiceCard'
import SoftwareCard from '@/components/cards/SoftwareCard'
import Community from '@/components/cards/Community'
import TeamCard from '@/components/cards/TeamCard'
import Meetups from '@/components/cards/Meetups'
import UpcomingProject from '@/components/cards/UpcomingProject'
import ContactCard from '@/components/cards/ContactCard'
import CourseCard from '@/components/cards/CourseCard'
import ProjectsCard from '@/components/cards/ProjectCard'

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
      {/* ================= HERO ================= */}
      <Hero />

      {/* ================= ABOUT ================= */}
      <AboutPage />

      {/* ================= SERVICES ================= */}
      <ServiceCard />

      {/* ================= COURSES ================= */}
      <CourseCard />

      {/* ================= SOFTWARE / TOOLS ================= */}
      <SoftwareCard />

      {/* ================= TURNING POINT ================= */}
      <UpcomingProject />

      {/* ================= COMMUNITY ================= */}
      <Community />

      {/* ================= PROJECTS ================= */}
      <ProjectsCard />


      {/* ================= MEETUPS / EVENTS ================= */}
      {/* <Meetups /> */}

      {/* ================= TEAM ================= */}
      <TeamCard />

      {/* ================= CONTACT ================= */}
      <ContactCard />
    </main>
  )
}
