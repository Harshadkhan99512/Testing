import Hero3D from '@/components/3d/Hero3D'
import { Button } from '@/components/ui/button'

export default function Page() {
  return (
    <main className="container space-y-8 py-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Welcome to your 3D Portfolio</h1>
        <p className="text-white/70">
          Next.js 14 + React Three Fiber + TailwindCSS + Framer Motion + Zustand
        </p>
        <div className="flex gap-3">
          <Button>Get Started</Button>
          <Button variant="secondary">View Projects</Button>
        </div>
      </section>
      <Hero3D />
    </main>
  )
}