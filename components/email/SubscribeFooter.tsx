'use client'

import { SubscribeForm } from './SubscribeForm'

export function SubscribeFooter() {
  return (
    <section className="bg-green-900 py-12 px-4">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-green-300 text-sm font-semibold uppercase tracking-widest mb-2">
          Stay Connected
        </p>
        <h2 className="text-white text-2xl font-bold mb-2">
          Join our community newsletter
        </h2>
        <p className="text-green-200 text-sm mb-6">
          Monthly updates on our work fighting food insecurity in Newark, NJ.
          No spam — just impact.
        </p>
        <SubscribeForm source="footer" compact className="max-w-md mx-auto" />
      </div>
    </section>
  )
}
