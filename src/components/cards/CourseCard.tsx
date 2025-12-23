'use client'

import { useEffect, useState } from 'react'
import FormModal from '@/components/cards/FormModal'
import {
  Code,
  Laptop,
  Brain,
  Database,
  Cpu,
  GraduationCap,
  Loader2,
} from 'lucide-react'

/* ================= TYPES ================= */
interface Course {
  _id: string
  title: string
  description: string
  badge?: string
  icon?: string
}

/* ================= ICON MAP ================= */
const iconMap: Record<string, any> = {
  code: Code,
  laptop: Laptop,
  brain: Brain,
  database: Database,
  cpu: Cpu,
  default: GraduationCap,
}

/* ================= PAGE ================= */
export default function CourseCard() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  /* ================= FETCH COURSES ================= */
  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/courses', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed')

        const data = await res.json()
        setCourses(data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  return (
    <>
      <section id="courses" className="bg-background py-24">
        <div className="mx-auto max-w-6xl px-4">
          {/* HEADER */}
          <h2 className="mb-3 text-center text-3xl font-bold text-foreground">
            Our Courses
          </h2>
          <p className="mb-16 text-center text-muted-foreground">
            Practical, student-friendly learning paths
          </p>

          {/* LOADING */}
          {loading && (
            <div className="flex justify-center">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}

          {/* ERROR */}
          {error && (
            <p className="text-center text-destructive">
              Failed to load courses
            </p>
          )}

          {/* GRID */}
          {!loading && !error && (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map(course => {
                const Icon =
                  iconMap[course.icon || ''] || iconMap.default

                return (
                  <div
                    key={course._id}
                    className="
                      group relative overflow-hidden
                      rounded-2xl border border-border bg-card p-8 text-center
                      transition-all hover:-translate-y-2 hover:border-primary/50 hover:shadow-2xl
                    "
                  >
                    {/* TOP LINE */}
                    <div
                      className="
                        absolute top-0 left-0 h-1 w-full
                        origin-left scale-x-0
                        bg-gradient-to-r from-primary to-accent
                        transition-transform duration-300
                        group-hover:scale-x-100
                      "
                    />

                    {/* BADGE */}
                    <span className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1 text-xs font-semibold text-primary-foreground">
                      {course.badge || 'Free'}
                    </span>

                    {/* ICON */}
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary transition group-hover:scale-110">
                      <Icon size={36} />
                    </div>

                    {/* CONTENT */}
                    <h3 className="mb-3 text-xl font-semibold">
                      {course.title}
                    </h3>

                    <p className="mb-6 text-sm text-muted-foreground">
                      {course.description}
                    </p>

                    {/* CTA */}
                    <button
                      onClick={() => {
                        setSelectedCourse(course)
                        setIsModalOpen(true)
                      }}
                      className="
                        w-full rounded-full
                        bg-gradient-to-r from-primary to-accent
                        py-3 font-semibold text-primary-foreground
                        transition hover:-translate-y-1 hover:shadow-xl
                      "
                    >
                      Enroll Now
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* MODAL */}
      {isModalOpen && selectedCourse && (
        <FormModal
          type="course"
          title={selectedCourse.title}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
