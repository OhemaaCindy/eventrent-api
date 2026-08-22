import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FaqItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "When do I get my deposit back?",
    answer:
      "Your deposit is refunded automatically once the owner confirms the item came back undamaged. If nobody takes action, it's released automatically — deposits are checked hourly and released once 48 hours have passed since the return was confirmed.",
  },
  {
    question: "What if I need the item longer than planned?",
    answer:
      "If you need more time, contact the owner directly through your booking's message thread to arrange an extension before your rental period ends.",
  },
  {
    question: "What happens if something gets damaged?",
    answer:
      "The owner can dispute the return within the deposit hold window and upload evidence photos. EventRent's admin team reviews the case and resolves it by refunding you in full, retaining the deposit for the owner, or splitting it 50/50 — whichever the evidence supports.",
  },
  {
    question: "Can I pick up instead of having it delivered?",
    answer:
      "It depends on the listing — each one specifies whether it offers delivery, pickup, or both. You'll see the fulfillment option on the listing page before you book.",
  },
  {
    question: "Is my payment secure?",
    answer:
      "Yes. Payments are processed through Paystack, and EventRent never stores your card details. Your rental fee and deposit are charged together as one secure transaction when you book.",
  },
]

export function FaqSection() {
  return (
    <section className="mx-auto w-full max-w-2xl px-8 py-16">
      <h2 className="mb-8 text-center font-heading text-3xl font-semibold">
        Frequently Asked Questions
      </h2>

      <Accordion>
        {FAQ_ITEMS.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">{item.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
