import { TopBar } from "@/components/top-bar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full rounded-3xl" />
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-36 min-w-28 flex-1 rounded-2xl" />
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-80 rounded-2xl" />
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-16 min-w-[140px] rounded-xl" />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
