import Navigation from "@/components/Navigation/Navigation"
import Hero from "@/components/Hero/Hero"
import About from "@/components/About/About"
import Projects from "@/components/Projects/Projects"
import Contact from "@/components/Contact/Contact"
import Footer from "@/components/Footer/Footer"
import Preloader from "@/components/Preloader/Preloader"
import CommandPalette from "@/components/CommandPalette/CommandPalette"

export default function HomePage() {
  return (
    <>
      <Preloader />
      <div className="bg-surface min-h-screen">
        <Navigation />
        <main>
          <Hero />
          <About />
          <Projects />
          <Contact />
        </main>
        <Footer />
      </div>
      <CommandPalette />
    </>
  )
}
