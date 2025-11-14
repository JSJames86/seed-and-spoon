export const metadata = {
  title: "Food Safety & Allergy Waiver | Seed & Spoon NJ - Important Information",
  description:
    "Important food safety and allergen information for Seed & Spoon NJ clients. Learn about our food handling practices, labeling, and allergy awareness protocols.",
  openGraph: {
    title: "Food Safety & Allergy Waiver | Seed & Spoon NJ",
    description:
      "Food safety protocols and allergen awareness at Seed & Spoon NJ. Read important information for clients receiving food assistance.",
    url: "https://seedandspoon.org/legal/food-waiver",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Food Safety & Allergen Info | Seed & Spoon NJ",
    description:
      "Important food safety and allergy information for clients of Seed & Spoon NJ.",
    images: ["/og-default.jpg"],
  },
};

export default function FoodWaiverPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
          Food Safety & Allergy Waiver
        </h1>

        <p className="text-base text-black/70 leading-relaxed mb-4">
          Last updated: {new Date().getFullYear()}
        </p>

        <p className="text-base text-black/70 leading-relaxed mb-4">
          Seed & Spoon NJ is committed to providing safe, nutritious food to families in need. This waiver explains important information about the nature of our food programs, potential allergen risks, and your responsibilities as a participant. By accepting food from Seed & Spoon NJ, you acknowledge and agree to the terms outlined below.
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            1. Nature of Our Food Programs
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Seed & Spoon NJ operates community-based food programs that include:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Surplus food rescue:</strong> We collect unsold or excess food from grocery stores, bakeries, restaurants, farms, and food banks that would otherwise go to waste</li>
            <li><strong>Donated food items:</strong> We receive donations from individuals, organizations, and businesses</li>
            <li><strong>Prepared meals:</strong> Meals are prepared by trained volunteers in community kitchens, homes, or partner facilities</li>
            <li><strong>Grocery boxes:</strong> Pre-packed boxes containing a mix of fresh produce, pantry staples, and other items</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            While we follow food safety best practices, our food comes from diverse sources and is handled in various environments. This means we cannot guarantee the same level of control as commercial food production facilities.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            2. No Guarantee of Allergen-Free Meals
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            <strong>We cannot guarantee that any food we provide is free from allergens.</strong>
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Our food may be prepared or packaged in environments that also handle common allergens. Cross-contact can occur during food preparation, packaging, transport, and distribution—even when allergens are not listed as ingredients.
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If you or anyone in your household has food allergies, sensitivities, or dietary restrictions, it is your responsibility to carefully review all food before consumption and use your best judgment about whether it is safe for you.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            3. Common Allergens
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Food we provide may contain or have come into contact with the following common allergens:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Milk and dairy products</li>
            <li>Eggs</li>
            <li>Peanuts</li>
            <li>Tree nuts (almonds, walnuts, cashews, etc.)</li>
            <li>Soy</li>
            <li>Wheat and gluten</li>
            <li>Fish</li>
            <li>Shellfish</li>
            <li>Sesame</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Ingredient lists may not always be available for rescued or donated food items. When possible, we provide labels or ingredient information, but this information may be incomplete.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            4. Participant Responsibilities
          </h2>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Disclose Allergies and Dietary Restrictions
          </h3>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If you have allergies or dietary needs, please inform us when you apply for services or pick up food. While we will make reasonable efforts to accommodate your needs when possible, we cannot guarantee allergen-free options.
          </p>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Inspect Food Before Consumption
          </h3>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            You are responsible for:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Checking all food items for freshness, quality, and safety</li>
            <li>Reading labels and ingredient lists when available</li>
            <li>Looking for signs of spoilage, damage, or tampering</li>
            <li>Discarding any food that appears unsafe or questionable</li>
            <li>Using your best judgment about whether food is appropriate for you and your household</li>
          </ul>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Ask Questions
          </h3>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If you are unsure about an ingredient, preparation method, or food safety concern, please ask our volunteers or staff. We will provide information to the best of our knowledge, but we may not always have complete details about rescued or donated items.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            5. Safe Handling, Reheating, and Storage
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            To reduce the risk of foodborne illness:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Refrigerate perishable items immediately upon arriving home</li>
            <li>Reheat prepared meals to an internal temperature of at least 165°F (74°C)</li>
            <li>Consume refrigerated prepared meals within 3-4 days or freeze for longer storage</li>
            <li>Follow any reheating or storage instructions provided with your food</li>
            <li>Wash fresh produce thoroughly before eating</li>
            <li>Do not consume food past its expiration date or "use by" date</li>
            <li>Keep raw meats separate from ready-to-eat foods</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            6. Assumption of Risk
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            By accepting food from Seed & Spoon NJ, you acknowledge and accept the following risks:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Risk of allergic reactions, including severe or life-threatening reactions</li>
            <li>Risk of foodborne illness from improper handling, storage, or preparation</li>
            <li>Risk that food may not meet your specific dietary, religious, or cultural preferences</li>
            <li>Risk that ingredient information may be incomplete or unavailable</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            You assume full responsibility for any consequences that may result from consuming food provided by Seed & Spoon NJ. This includes, but is not limited to, allergic reactions, foodborne illness, or adverse health effects.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            7. Emergency Procedures
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If you or someone in your household experiences an allergic reaction or becomes ill after consuming food from Seed & Spoon NJ:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Seek immediate medical attention</strong> by calling 911 or going to the nearest emergency room, especially for severe allergic reactions</li>
            <li>Follow your healthcare provider's instructions and use any prescribed medications (such as an EpiPen)</li>
            <li>After receiving medical care, please notify us at <strong>seedandspoonnj@gmail.com</strong> so we can review our procedures and take appropriate action</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            8. Limitation of Liability
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            To the fullest extent permitted by law, Seed & Spoon NJ, its directors, officers, volunteers, staff, and partner organizations are not liable for any injury, illness, allergic reaction, or other harm that may result from consuming food we provide.
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            This includes, but is not limited to, harm caused by:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Allergens present in food</li>
            <li>Foodborne pathogens or contamination</li>
            <li>Improper handling, storage, or preparation by participants</li>
            <li>Incomplete or inaccurate ingredient information</li>
            <li>Food that has passed its expiration date</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            By accepting food from us, you agree to release and hold harmless Seed & Spoon NJ and all affiliated parties from any claims, damages, or liabilities related to food consumption.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            9. Good Samaritan Food Donation Act
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Seed & Spoon NJ operates in accordance with the Bill Emerson Good Samaritan Food Donation Act, which protects food donors and nonprofit organizations from liability when donating food in good faith to those in need.
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We work diligently to ensure food safety and quality, but we rely on the cooperation and good judgment of participants to use food responsibly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            10. Questions or Concerns
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If you have questions about food safety, allergens, or this waiver, please contact us:
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            <strong>Seed & Spoon NJ</strong><br />
            Email: <strong>seedandspoonnj@gmail.com</strong>
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We are committed to transparency and will do our best to address your concerns promptly.
          </p>
        </section>

        <section className="mt-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-black mb-3">
            Acknowledgment
          </h2>
          <p className="text-base text-black/70 leading-relaxed">
            By accepting food from Seed & Spoon NJ, you acknowledge that you have read, understood, and agree to the terms of this Food Safety & Allergy Waiver. You accept full responsibility for inspecting food, making informed decisions about consumption, and understanding the risks involved.
          </p>
        </section>
      </div>
    </div>
  );
}
