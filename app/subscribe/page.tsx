import { SubscribeForm } from '@/components/email/SubscribeForm'

export const metadata = {
  title: 'Subscribe — Seed & Spoon',
  description: 'Join the Seed & Spoon newsletter for monthly updates on our mission to fight food insecurity in Newark, NJ.',
}

export default function SubscribePage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <section className="bg-green-900 py-20 px-4 text-center">
        <p className="text-green-300 text-sm font-semibold uppercase tracking-widest mb-3">
          Newsletter
        </p>
        <h1 className="text-white text-4xl font-bold leading-tight mb-4">
          Stay connected to our mission
        </h1>
        <p className="text-green-200 text-lg max-w-xl mx-auto">
          Join thousands of supporters getting monthly updates on our work
          fighting food insecurity in Newark, NJ.
        </p>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-gray-900 text-xl font-bold mb-1">Subscribe for free</h2>
          <p className="text-gray-500 text-sm mb-6">
            No spam. One email per month. Unsubscribe anytime.
          </p>
          <SubscribeForm source="subscribe-page" />
        </div>
      </section>

      <section className="py-12 px-4 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-gray-900 text-xl font-bold text-center mb-8">
            What you&apos;ll receive
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { emoji: '📊', title: 'Impact Reports', desc: 'Real numbers — families served, pounds of food distributed, volunteers active.' },
              { emoji: '📣', title: 'Events & Shifts', desc: 'Upcoming distributions, volunteer opportunities, and community events.' },
              { emoji: '💛', title: 'Community Stories', desc: 'First-hand accounts from the families and volunteers we serve alongside.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-2">
                <span className="text-3xl">{emoji}</span>
                <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
