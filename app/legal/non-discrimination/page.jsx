export const metadata = {
  title: "Non-Discrimination Policy | Seed & Spoon NJ - Equal Access for All",
  description:
    "Seed & Spoon NJ is committed to equal access and non-discrimination. We serve all people regardless of race, religion, gender, age, disability, or background.",
  openGraph: {
    title: "Non-Discrimination Policy | Seed & Spoon NJ",
    description:
      "Our commitment to equal access and dignity for all. Seed & Spoon NJ serves families without discrimination.",
    url: "https://seedandspoon.org/legal/non-discrimination",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Non-Discrimination | Seed & Spoon NJ",
    description:
      "Equal access and dignity for all. Read our non-discrimination policy.",
    images: ["/og-default.jpg"],
  },
};

export default function NonDiscriminationPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
          Non-Discrimination Statement
        </h1>
        <p className="text-lg text-black/70">
          Seed & Spoon is committed to providing services without discrimination based on race, color, national origin, sex, age, or disability. Content coming soon.
        </p>
      </div>
    </div>
  );
}
