"use client"

import { BookOpenText, FileText, HelpCircle, MessageSquareText, SlidersHorizontal } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpecTable } from "./spec-table"
import { DocumentCard } from "./document-card"
import { ReviewSection } from "./review-section"
import { FAQSection } from "./faq-section"

interface ProductTabsProps {
  fullSpecs: { label: string; value: string }[]
  description: string
  documents: { name: string; type: string; size: string }[]
  reviews: {
    id: number
    author: string
    role: string
    rating: number
    date: string
    comment: string
    helpful: number
  }[]
  faqs: { question: string; answer: string }[]
  averageRating: number
  totalReviews: number
}

const tabClassName = "gap-2 rounded-xl px-4 py-3 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm sm:text-sm"

export function ProductTabs({ fullSpecs, description, documents, reviews, faqs, averageRating, totalReviews }: ProductTabsProps) {
  return (
    <Tabs defaultValue="specs" className="w-full">
      <div className="mb-5 border-b border-border pb-5">
        <p className="text-xs font-bold text-primary">اطلاعات کامل محصول</p>
        <h2 className="mt-1 text-xl font-black text-foreground">بررسی مشخصات و جزئیات فنی</h2>
      </div>

      <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-2 rounded-2xl bg-muted/50 p-2">
        <TabsTrigger value="specs" className={tabClassName}><SlidersHorizontal className="h-4 w-4" />مشخصات فنی</TabsTrigger>
        <TabsTrigger value="description" className={tabClassName}><BookOpenText className="h-4 w-4" />توضیحات</TabsTrigger>
        <TabsTrigger value="documents" className={tabClassName}><FileText className="h-4 w-4" />مستندات</TabsTrigger>
        <TabsTrigger value="reviews" className={tabClassName}><MessageSquareText className="h-4 w-4" />نظرات</TabsTrigger>
        <TabsTrigger value="faq" className={tabClassName}><HelpCircle className="h-4 w-4" />سوالات متداول</TabsTrigger>
      </TabsList>

      <TabsContent value="specs" className="mt-0"><SpecTable specs={fullSpecs} /></TabsContent>

      <TabsContent value="description" className="mt-0">
        <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm leading-8 text-muted-foreground sm:p-5 sm:text-base">
          {description ? description.split("\n\n").map((paragraph, index) => <p key={index} className="mb-4 whitespace-pre-line last:mb-0">{paragraph}</p>) : <p>توضیحات تکمیلی این محصول در حال آماده‌سازی است.</p>}
        </div>
      </TabsContent>

      <TabsContent value="documents" className="mt-0"><div className="space-y-3">{documents.map((doc, index) => <DocumentCard key={index} name={doc.name} type={doc.type} size={doc.size} />)}</div></TabsContent>
      <TabsContent value="reviews" className="mt-0"><ReviewSection reviews={reviews} averageRating={averageRating} totalReviews={totalReviews} /></TabsContent>
      <TabsContent value="faq" className="mt-0"><FAQSection faqs={faqs} /></TabsContent>
    </Tabs>
  )
}
