import { Playfair_Display, DM_Sans } from 'next/font/google';

const playfairFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSansFont = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Meal Kit Menu',
  description:
    'The full Seed & Spoon meal kit menu — cooked, frozen, and ready to reheat. Premium kits for paying subscribers; the same meals, fully subsidized, for families in need. Newark, NJ.',
};

const CSS = `
.seed-menu {
  --m-green: #2D5016;
  --m-green-mid: #4A7C2F;
  --m-green-light: #7BAF52;
  --m-cream: #FAF6EE;
  --m-warm: #F2E8D5;
  --m-gold: #C8962E;
  --m-gold-light: #E8B84B;
  --m-brown: #6B4423;
  --m-text: #1C1C1C;
  --m-text-soft: #5A5A5A;
  background: var(--m-cream);
  color: var(--m-text);
  font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
  font-weight: 300;
}

.m-cover {
  background: var(--m-green);
  min-height: calc(100vh - var(--header-h, 72px));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
}
.m-cover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 20% 80%, rgba(200,150,46,0.15) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, rgba(123,175,82,0.1) 0%, transparent 50%);
  pointer-events: none;
}
.m-cover-badge {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--m-gold-light);
  margin-bottom: 32px;
  position: relative;
}
.m-cover-title {
  font-family: var(--font-playfair, 'Playfair Display', serif);
  font-size: clamp(52px, 10vw, 96px);
  font-weight: 900;
  color: var(--m-cream);
  line-height: 0.95;
  position: relative;
}
.m-cover-title em {
  color: var(--m-gold-light);
  font-style: italic;
}
.m-cover-divider {
  width: 80px;
  height: 2px;
  background: var(--m-gold);
  margin: 36px auto;
  position: relative;
}
.m-cover-sub {
  font-family: var(--font-playfair, 'Playfair Display', serif);
  font-size: clamp(18px, 3vw, 26px);
  font-style: italic;
  color: rgba(250,246,238,0.7);
  max-width: 500px;
  line-height: 1.5;
  position: relative;
}
.m-cover-mission {
  margin-top: 48px;
  padding: 20px 32px;
  border: 1px solid rgba(200,150,46,0.3);
  border-radius: 2px;
  max-width: 560px;
  position: relative;
}
.m-cover-mission p {
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.5px;
  color: rgba(250,246,238,0.6);
  line-height: 1.8;
  margin: 0;
}

.m-section {
  padding: 80px 40px;
  max-width: 900px;
  margin: 0 auto;
}
.m-section-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 48px;
}
.m-section-number {
  font-family: var(--font-playfair, 'Playfair Display', serif);
  font-size: 72px;
  font-weight: 900;
  color: var(--m-green-light);
  opacity: 0.25;
  line-height: 1;
  flex-shrink: 0;
}
.m-section-title h2 {
  font-family: var(--font-playfair, 'Playfair Display', serif);
  font-size: clamp(28px, 5vw, 42px);
  font-weight: 700;
  color: var(--m-green);
  line-height: 1.1;
}
.m-section-title p {
  font-size: 14px;
  color: var(--m-text-soft);
  margin-top: 6px;
  letter-spacing: 0.5px;
}

.m-band {
  background: var(--m-green);
  padding: 24px 40px;
  text-align: center;
}
.m-band-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 5px;
  text-transform: uppercase;
  color: var(--m-gold-light);
  margin: 0;
}

.m-cat-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--m-gold);
  border-bottom: 1px solid var(--m-gold);
  padding-bottom: 4px;
  margin-bottom: 24px;
}

.m-kit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 48px;
}

.m-kit-card {
  background: white;
  border: 1px solid rgba(0,0,0,0.07);
  padding: 24px;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}
.m-kit-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.08);
}
.m-kit-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 3px;
  height: 100%;
  background: var(--m-green-light);
}
.m-kit-card.gold::before { background: var(--m-gold); }
.m-kit-card.brown::before { background: var(--m-brown); }

.m-kit-name {
  font-family: var(--font-playfair, 'Playfair Display', serif);
  font-size: 17px;
  font-weight: 700;
  color: var(--m-green);
  margin-bottom: 10px;
}
.m-kit-card.gold .m-kit-name { color: var(--m-brown); }

.m-kit-ingredients {
  list-style: none;
  font-size: 12.5px;
  color: var(--m-text-soft);
  line-height: 1.9;
  padding: 0;
  margin: 0;
}
.m-kit-ingredients li::before {
  content: '\2014 ';
  color: var(--m-green-light);
}
.m-kit-card.gold .m-kit-ingredients li::before { color: var(--m-gold); }

.m-kit-note {
  margin-top: 12px;
  font-size: 11px;
  font-style: italic;
  color: var(--m-gold);
  font-weight: 500;
}

.m-flavor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 32px;
}
.m-flavor-pill {
  background: var(--m-warm);
  border: 1px solid rgba(0,0,0,0.07);
  padding: 14px 18px;
  font-size: 13px;
  font-weight: 400;
  color: var(--m-text);
  display: flex;
  align-items: center;
  gap: 10px;
}
.m-flavor-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--m-green-light);
  flex-shrink: 0;
  display: inline-block;
}
.m-flavor-pill.premium {
  background: linear-gradient(135deg, #FFF8EE, #FEF0D0);
  border-color: rgba(200,150,46,0.2);
}
.m-flavor-pill.premium .m-flavor-dot { background: var(--m-gold); }

.m-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.m-list-block {
  background: white;
  border: 1px solid rgba(0,0,0,0.07);
  padding: 24px;
  margin-bottom: 16px;
}
.m-list-block h4 {
  font-family: var(--font-playfair, 'Playfair Display', serif);
  font-size: 16px;
  font-weight: 700;
  color: var(--m-green);
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--m-warm);
}
.m-list-block ul {
  list-style: none;
  font-size: 13px;
  color: var(--m-text-soft);
  line-height: 2;
  padding: 0;
  margin: 0;
}
.m-list-block ul li::before {
  content: '\00B7 ';
  color: var(--m-gold);
  font-weight: 700;
}

.m-rice-block {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 32px;
}
.m-rice-card {
  background: var(--m-green);
  padding: 28px;
  color: var(--m-cream);
}
.m-rice-card h4 {
  font-family: var(--font-playfair, 'Playfair Display', serif);
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--m-gold-light);
}
.m-rice-card p {
  font-size: 12px;
  line-height: 1.8;
  opacity: 0.75;
  margin: 0;
}
.m-rice-pairs {
  margin-top: 14px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  color: var(--m-gold-light);
  opacity: 0.9;
}

.m-mission-box {
  background: var(--m-green);
  padding: 48px;
  margin: 40px 0;
  position: relative;
  overflow: hidden;
}
.m-mission-box::after {
  content: '\201C';
  position: absolute;
  right: 30px;
  top: -20px;
  font-family: var(--font-playfair, 'Playfair Display', serif);
  font-size: 180px;
  color: rgba(255,255,255,0.04);
  line-height: 1;
  pointer-events: none;
}
.m-mission-box h3 {
  font-family: var(--font-playfair, 'Playfair Display', serif);
  font-size: 24px;
  font-weight: 700;
  color: var(--m-gold-light);
  margin-bottom: 16px;
}
.m-mission-box p {
  font-size: 14px;
  line-height: 1.9;
  color: rgba(250,246,238,0.75);
  max-width: 640px;
  margin: 0;
}

.m-addon-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 32px;
}
.m-addon-tag {
  background: white;
  border: 1px solid rgba(0,0,0,0.1);
  padding: 8px 16px;
  font-size: 12.5px;
  color: var(--m-text);
  font-weight: 400;
}
.m-addon-tag.highlight {
  background: var(--m-warm);
  border-color: var(--m-gold);
  color: var(--m-brown);
  font-weight: 500;
}

.m-footer-section {
  background: var(--m-green);
  padding: 60px 40px;
  text-align: center;
}
.m-footer-section h3 {
  font-family: var(--font-playfair, 'Playfair Display', serif);
  font-size: 32px;
  font-weight: 700;
  color: var(--m-cream);
  margin-bottom: 12px;
}
.m-footer-tagline {
  font-family: var(--font-playfair, 'Playfair Display', serif);
  font-style: italic;
  font-size: 18px;
  color: var(--m-gold-light);
  margin-top: 8px;
  margin-bottom: 32px;
}
.m-footer-txt {
  font-size: 13px;
  color: rgba(250,246,238,0.5);
  letter-spacing: 1px;
}
.m-foot-line {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.1);
  margin: 32px auto;
  max-width: 200px;
}

@media (max-width: 600px) {
  .m-two-col { grid-template-columns: 1fr; }
  .m-kit-grid { grid-template-columns: 1fr; }
  .m-rice-block { grid-template-columns: 1fr; }
  .m-cover { padding: 40px 24px; }
  .m-section { padding: 60px 24px; }
  .m-band { padding: 20px 24px; }
  .m-mission-box { padding: 32px 24px; }
  .m-footer-section { padding: 48px 24px; }
}

@media print {
  .m-cover { page-break-after: always; }
  .m-band { page-break-inside: avoid; }
}
`;

function Band({ children }) {
  return (
    <div className="m-band">
      <p className="m-band-label">{children}</p>
    </div>
  );
}

function CatLabel({ children }) {
  return <div className="m-cat-label">{children}</div>;
}

function KitCard({ name, ingredients, note, variant }) {
  return (
    <div className={`m-kit-card${variant ? ` ${variant}` : ''}`}>
      <div className="m-kit-name">{name}</div>
      <ul className="m-kit-ingredients">
        {ingredients.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
      {note && <div className="m-kit-note">{note}</div>}
    </div>
  );
}

function SectionHeader({ number, title, subtitle }) {
  return (
    <div className="m-section-header">
      <div className="m-section-number">{number}</div>
      <div className="m-section-title">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}

function MissionBox({ title, children }) {
  return (
    <div className="m-mission-box">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

function ListBlock({ title, items }) {
  return (
    <div className="m-list-block">
      <h4>{title}</h4>
      <ul>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
}

function Cover() {
  return (
    <div className="m-cover">
      <div className="m-cover-badge">Newark, New Jersey &middot; Est. 2024</div>
      <h1 className="m-cover-title">
        Seed &amp;<br /><em>Spoon</em>
      </h1>
      <div className="m-cover-divider" />
      <p className="m-cover-sub">Meal Kit Program &mdash; Full Menu</p>
      <div className="m-cover-mission">
        <p>
          Cooked. Frozen. Ready to reheat.<br />
          Premium meal kits for paying subscribers.<br />
          The same meals, fully subsidized, for families in need.
        </p>
      </div>
    </div>
  );
}

function DinnerEntreesSection() {
  return (
    <div className="m-section">
      <SectionHeader
        number="01"
        title="Dinner Entrees"
        subtitle="Cooked, vacuum-sealed, frozen flat · Reheat and serve"
      />

      <CatLabel>Latin &amp; Caribbean</CatLabel>
      <div className="m-kit-grid">
        <KitCard
          name="Birria Kit"
          ingredients={['Beef or goat, braised','Dried chiles blend','Garlic, onion, cumin','Mexican oregano','Consômmé broth included']}
          note="Serve with tortillas + dipping consômmé"
        />
        <KitCard
          name="Sofrito Baked Chicken"
          ingredients={['Bone-in chicken pieces','Sofrito base','Sazón, adobo seasoning','Olives, bay leaf']}
          note="Essential for Newark’s community"
        />
        <KitCard
          name="Chimichurri Steak"
          ingredients={['Skirt or flank steak','Chimichurri sealed in bag','Garlic, parsley, oregano','Red wine vinegar, olive oil']}
          note="Meat marinates as it thaws"
        />
        <KitCard
          name="Beef Taco Kit"
          ingredients={['Ground beef or skirt steak','Onion, garlic, cumin','Chili powder, cilantro stems','Lime wedge packet']}
        />
      </div>

      <CatLabel>American &amp; Southern</CatLabel>
      <div className="m-kit-grid">
        <KitCard variant="gold" name="Sunday Pot Roast"
          ingredients={['Chuck roast, portioned','Carrots, celery, onion wedges','Garlic, rosemary, thyme','Beef broth base']}
          note="Slow cooker or Dutch oven" />
        <KitCard variant="gold" name="Bourbon Chicken"
          ingredients={['Chicken thighs','Bourbon-soy-brown sugar sauce','Garlic, ginger','Sesame finish']}
          note="One pan, 20 minutes" />
        <KitCard variant="gold" name="Honey Garlic Chicken"
          ingredients={['Bone-in thighs','Honey, garlic, soy','Apple cider vinegar']}
          note="Sticky and crowd-pleasing" />
        <KitCard variant="gold" name="Cajun Baked Chicken"
          ingredients={['Chicken pieces','Cajun spice blend','Butter, bell pepper']} />
      </div>

      <CatLabel>Global Flavors</CatLabel>
      <div className="m-kit-grid">
        <KitCard variant="brown" name="Chinese Pepper Steak"
          ingredients={['Thin-sliced beef','Bell peppers, onion','Ginger, garlic','Soy / oyster sauce blend']}
          note="Wok or skillet, 15 minutes" />
        <KitCard variant="brown" name="Cava-Inspired Kit"
          ingredients={['Spiced lamb or chicken','Tzatziki sauce packet','Pickled onion packet','Harissa packet','Lemon herb rice seasoning']} />
        <KitCard variant="brown" name="Jerk Baked Chicken"
          ingredients={['Chicken pieces','Scotch bonnet, allspice','Thyme, green onion, ginger','Soy marinade']} />
        <KitCard variant="brown" name="Lemon Herb Chicken"
          ingredients={['Breast or thighs','Lemon zest, parsley','Garlic, dijon','Olive oil base']} />
      </div>

      <MissionBox title="The Kitchen Model">
        Every entree is cooked in the Seed &amp; Spoon commercial kitchen, portioned into vacuum-seal bags, and frozen flat for efficient stacking. Paying subscribers receive premium kits via insulated tote delivery. The same meals — fully subsidized — go to food-insecure families in Newark. One kitchen. One menu. Two tiers of access.
      </MissionBox>
    </div>
  );
}

function PastaSection() {
  return (
    <div className="m-section">
      <SectionHeader
        number="1B"
        title="Pasta"
        subtitle="Baked · Creamy · Pesto · Freeze & reheat perfectly"
      />

      <CatLabel>Baked Pasta — Comfort Classics</CatLabel>
      <div className="m-kit-grid">
        <KitCard name="Baked Ziti"
          ingredients={['Ziti pasta, al dente','Ricotta, mozzarella blend','House marinara sauce','Meat or veggie option','Italian sausage available']}
          note="Highest perceived value frozen meal" />
        <KitCard name="Lasagna"
          ingredients={['Classic meat lasagna','Veggie variation','White sauce variation','Layered, portioned, frozen']}
          note="Family size or individual portions" />
      </div>

      <CatLabel>Creamy &amp; Pesto Noodles</CatLabel>
      <div className="m-kit-grid">
        <KitCard variant="gold" name="Pesto Parmesan Noodles"
          ingredients={['Long pasta or penne','House basil pesto','Shaved parmesan','Pine nuts optional']}
          note="Simple, elegant, crowd favorite" />
        <KitCard variant="gold" name="Cavatappi al Pesto"
          ingredients={['Cavatappi — holds sauce perfectly','Basil pesto base','Parmesan, olive oil finish','Cherry tomato option']}
          note="Premium tier — signature pasta" />
        <KitCard variant="gold" name="Lemon Alfredo"
          ingredients={['Fettuccine or linguine','Creamy Alfredo base','Lemon zest, fresh parsley','Light enough for seafood']}
          note="Pairs beautifully with fish" />
        <KitCard variant="gold" name="Cajun Alfredo"
          ingredients={['Fettuccine or penne','Creamy Alfredo base','Cajun spice blend','Bell pepper, andouille option']}
          note="Bold — pairs with shrimp or chicken" />
      </div>

      <CatLabel>Fish + Pasta Combo Kits</CatLabel>
      <div className="m-kit-grid">
        <KitCard variant="brown" name="Lemon Alfredo + Baked Tilapia"
          ingredients={['Lemon Alfredo pasta portion','Seasoned tilapia fillet','Lemon herb butter packet','Full dinner in one bag']} />
        <KitCard variant="brown" name="Cajun Alfredo + Blackened Salmon"
          ingredients={['Cajun Alfredo pasta portion','Blackened salmon fillet','Cajun seasoning packet','Full dinner in one bag']}
          note="Premium combo — high perceived value" />
        <KitCard variant="brown" name="Lemon Herb Pasta + Cod"
          ingredients={['Lemon herb pasta base','Baked cod fillet','Garlic butter packet','Full dinner in one bag']} />
      </div>
    </div>
  );
}

function BreakfastSection() {
  const classicFlavors = ['Buttermilk','Blueberry','Chocolate Chip','Cinnamon Sugar','Strawberry','Banana Walnut'];
  const premiumFlavors = ['Biscoff Banana ⭐','Lemon Poppy Seed','Churro + Dulce de Leche','Cookies & Cream','Peach Cobbler','Apple Cinnamon Brown Butter','Strawberry Shortcake'];

  return (
    <div className="m-section">
      <SectionHeader
        number="02"
        title="Breakfast"
        subtitle="Grab & go · Freeze & reheat · Family-portioned"
      />

      <CatLabel>Grab &amp; Go Staples</CatLabel>
      <div className="m-kit-grid">
        <KitCard name="Bagel Kit"
          ingredients={['Fresh bagel','Cream cheese packet','Optional: jam or lox add-on']} />
        <KitCard name="Yogurt Parfait Kit"
          ingredients={['Greek yogurt cup','Granola packet','Fresh or frozen fruit']} />
        <KitCard name="Yogurt & Fruit Cup"
          ingredients={['Creamy yogurt base','Seasonal fruit blend','Honey drizzle packet']} />
      </div>

      <CatLabel>Mini Pancake Dippers — Signature Item ⭐</CatLabel>
      <p style={{fontSize:'13px',color:'var(--m-text-soft)',marginBottom:'20px',lineHeight:'1.8'}}>
        Made in batches of 50 · 10 per serving · Freeze flat · Microwave reheat in 60 seconds<br />
        Each kit includes dippers + dipping sauce packet (maple, Nutella, strawberry jam, or honey butter)
      </p>

      <div className="m-two-col" style={{marginBottom:'16px'}}>
        <div>
          <CatLabel>Classic Flavors</CatLabel>
          <div className="m-flavor-grid">
            {classicFlavors.map(f => (
              <div key={f} className="m-flavor-pill">
                <span className="m-flavor-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
        <div>
          <CatLabel>Premium / Signature Flavors</CatLabel>
          <div className="m-flavor-grid">
            {premiumFlavors.map(f => (
              <div key={f} className="m-flavor-pill premium">
                <span className="m-flavor-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SaladsSandwichesSection() {
  return (
    <div className="m-section">
      <SectionHeader
        number="03"
        title="Salads & Sandwiches"
        subtitle="Fresh, portioned, ready to assemble or eat"
      />
      <div className="m-two-col">
        <div>
          <CatLabel>Salads</CatLabel>
          <ListBlock title="Mason Jar Salads"
            items={['Dressing sealed separately','Layered for freshness','Multiple base options']} />
          <ListBlock title="Grain Bowls"
            items={['Farro base','Quinoa base','Rice base','Roasted veggie toppings']} />
          <ListBlock title="Cava-Style Build Kits"
            items={['Greens or grain base','Protein packet','Toppings packet','Sauce packet']} />
        </div>
        <div>
          <CatLabel>Sandwiches</CatLabel>
          <ListBlock title="Hot Sandwiches"
            items={['Chicken cutlet','Italian beef','Pulled pork']} />
          <ListBlock title="Cold Sandwiches"
            items={['Turkey pesto','BLT','Veggie stack']} />
          <ListBlock title="Breakfast Sandwiches"
            items={['Egg, cheese, meat on roll','Veggie egg option','Freeze & reheat ready']} />
        </div>
      </div>
    </div>
  );
}

function SidesSection() {
  return (
    <div className="m-section">
      <SectionHeader
        number="04"
        title="Sides"
        subtitle="No fried foods · Health-forward · Complete protein pairings"
      />

      <CatLabel>Rice — The Universal Base</CatLabel>
      <div className="m-rice-block">
        <div className="m-rice-card">
          <h4>Jasmine Rice</h4>
          <p>Lighter, fragrant grain. Available plain or seasoned. Portioned by family size, frozen ready to reheat.</p>
          <div className="m-rice-pairs">Pairs with: Asian · Caribbean · Latin</div>
        </div>
        <div className="m-rice-card">
          <h4>Basmati Rice</h4>
          <p>Nuttier, longer grain. Available plain or seasoned. Portioned by family size, frozen ready to reheat.</p>
          <div className="m-rice-pairs">Pairs with: Mediterranean · Indian · Latin</div>
        </div>
      </div>

      <CatLabel>Potatoes</CatLabel>
      <div className="m-kit-grid" style={{marginBottom:'48px'}}>
        <KitCard name="Baked Potato Kit"
          ingredients={['Pre-baked potato','Butter packet','Toppings packet included','Sour cream add-on available']} />
        <KitCard name="Mashed Potatoes"
          ingredients={['Classic','Garlic herb','Loaded (cheese + chive)']} />
        <KitCard name="Roasted Potatoes"
          ingredients={['Herb roasted cubes','Lemon pepper wedges','Seasoned wedges']} />
      </div>

      <CatLabel>Vegetables</CatLabel>
      <div className="m-kit-grid" style={{marginBottom:'48px'}}>
        <KitCard variant="gold" name="Green Beans"
          ingredients={['Garlic sautéed','Plain steamed']} />
        <KitCard variant="gold" name="Broccoli"
          ingredients={['Roasted','Steamed']} />
        <KitCard variant="gold" name="Corn"
          ingredients={['Seasoned kernels','Elote-style']} />
      </div>

      <CatLabel>Bean Kits — Complete Protein with Rice</CatLabel>
      <div className="m-kit-grid">
        <KitCard variant="brown" name="Black Beans"
          ingredients={['Cuban style','Plain','Spiced']}
          note="Pairs with Jasmine rice → complete meal" />
        <KitCard variant="brown" name="Red Beans"
          ingredients={['Red beans & rice kit','Creole style','Seasoning packet included']} />
        <KitCard variant="brown" name="Rice & Peas"
          ingredients={['Caribbean style','Coconut base','Thyme, scotch bonnet']}
          note="Classic Caribbean complete side" />
      </div>
    </div>
  );
}

function BreadsSection() {
  return (
    <div className="m-section">
      <SectionHeader
        number="05"
        title="Breads & Add-Ons"
        subtitle="Increase order value · Let families customize"
      />
      <div className="m-two-col">
        <div>
          <CatLabel>Breads</CatLabel>
          <ListBlock title="Dinner Rolls"
            items={['Classic','Honey butter','Garlic herb']} />
          <ListBlock title="Other Breads"
            items={['Cornbread — classic or jalapeño cheddar','Slider buns — for sandwich kits','Bagels — for breakfast kits','Pita — pairs with Cava kits']} />
          <CatLabel>Croutons</CatLabel>
          <ListBlock title="Crouton Varieties"
            items={['Classic herb','Garlic parmesan','Caesar style','Everything bagel seasoned']} />
        </div>
        <div>
          <CatLabel>Sauces &amp; Condiments</CatLabel>
          <ListBlock title="Sauce Add-Ons"
            items={['Chimichurri packet','Tzatziki cup','Harissa packet','Sofrito base','Honey butter','Gravy packet','Hot sauce']} />
          <CatLabel>Kit Enhancers</CatLabel>
          <ListBlock title="Customization Pack"
            items={['Shredded cheese packet','Sour cream cup','Fresh herb packets','Lemon / lime wedge packs','Pickled onion cups']} />
        </div>
      </div>
    </div>
  );
}

function SoulSidesSection() {
  return (
    <div className="m-section">
      <SectionHeader
        number="4B"
        title="Southern & Soul Sides"
        subtitle="Slow cooked · Smoked turkey · Cultural staples"
      />
      <div className="m-kit-grid">
        <KitCard variant="brown" name="Collard Greens"
          ingredients={['Fresh collard greens','Smoked turkey leg or neck','Onion, garlic, red pepper flakes','Apple cider vinegar finish','Slow cooked, deeply seasoned']}
          note="Smoked turkey — no pork, inclusive for all families" />
        <KitCard variant="brown" name="Mustard Greens"
          ingredients={['Fresh mustard greens','Smoked turkey','Garlic, onion, chicken broth','Pinch of sugar to balance bitterness']} />
        <KitCard variant="brown" name="Turnip Greens"
          ingredients={['Turnip greens + turnip pieces','Smoked turkey','Onion, garlic, hot sauce option','Long simmer, pot liquor included']}
          note="Pot liquor packet sealed in — don’t waste it" />
        <KitCard variant="gold" name="Candied Yams"
          ingredients={['Sweet potatoes, thick cut','Brown sugar, butter','Cinnamon, nutmeg, vanilla','Marshmallow top option']}
          note="Holiday staple — available year round" />
        <KitCard variant="gold" name="Baked Sweet Potatoes"
          ingredients={['Whole sweet potato, pre-baked','Honey butter packet','Cinnamon sugar packet','Or savory herb butter option']} />
        <KitCard variant="gold" name="Mashed Sweet Potatoes"
          ingredients={['Whipped sweet potato base','Brown butter, maple','Ginger, nutmeg','Pecan crumble optional']} />
      </div>
    </div>
  );
}

function SeasonalSpecialsSection() {
  const futurePipeline = [
    'Lunar New Year Kit','Eid Celebration Dinner','Juneteenth Freedom Feast',
    'West African Heritage Series',"Valentine's Dinner for Two",'Easter Sunday Kit',
    'Summer Cookout Series','Holiday Cookie & Breakfast Kit',
  ];

  return (
    <div className="m-section">
      <SectionHeader
        number="06"
        title="Seasonal Specials"
        subtitle="Rotating · Community-rooted · Cultural celebration through food"
      />

      <MissionBox title="Why Seasonal Specials Matter">
        Food is culture. Newark&apos;s community deserves a meal program that reflects who they are — their heritage, their holidays, their history. Seasonal specials create anticipation, drive subscription renewals, and turn a meal kit into something people look forward to every month.
      </MissionBox>

      <CatLabel>Calendar Year Rotations</CatLabel>
      <div className="m-kit-grid">
        <KitCard name="Summer BBQ Chicken"
          ingredients={['Smoky BBQ marinated chicken','House BBQ sauce sealed in','Corn on the cob side','Coleslaw kit included']}
          note="June – August" />
        <KitCard name="Autumn Harvest Bowl"
          ingredients={['Roasted butternut squash','Wild rice or farro base','Spiced pepitas, dried cranberry','Maple tahini dressing']}
          note="September – November" />
        <KitCard name="Thanksgiving Turkey Dinner"
          ingredients={['Sliced roasted turkey breast','Gravy packet','Mashed potatoes portion','Candied yams + collards included','Cornbread roll']}
          note="November — full holiday meal in one kit" />
      </div>

      <CatLabel>Cultural Heritage Series</CatLabel>
      <div className="m-kit-grid">
        <KitCard variant="brown" name="Black History Month Soul Food Series"
          ingredients={['Smothered pork chops or chicken','Collard greens with smoked turkey','Candied yams','Cornbread','Black eyed peas']}
          note="February — honoring tradition" />
        <KitCard variant="brown" name="Hispanic Heritage Month Feature Kits"
          ingredients={['Rotating: Birria, Pernil, Ropa Vieja','Sofrito rice & beans','Tostones or maduros side','Flan or tres leches dessert add-on']}
          note="Sept 15 – Oct 15 — community celebration" />
        <KitCard variant="brown" name="Caribbean Heritage Month Specials"
          ingredients={['Jerk chicken or oxtail','Rice & peas','Fried plantains add-on','Escovitch sauce packet','Festival bread option']}
          note="June — Caribbean American Heritage Month" />
      </div>

      <div style={{background:'var(--m-warm)',border:'1px solid rgba(0,0,0,0.07)',padding:'28px',marginTop:'16px'}}>
        <CatLabel>Future Specials Pipeline</CatLabel>
        <div className="m-addon-wrap" style={{marginTop:'16px'}}>
          {futurePipeline.map(item => (
            <div key={item} className="m-addon-tag highlight">{item}</div>
          ))}
        </div>
        <p style={{fontSize:'12px',color:'var(--m-text-soft)',marginTop:'12px',fontStyle:'italic',margin:'12px 0 0 0'}}>
          Rotating specials drive subscription renewals and community engagement year-round.
        </p>
      </div>
    </div>
  );
}

function MenuFooter() {
  return (
    <div className="m-footer-section">
      <h3>Seed &amp; Spoon</h3>
      <p className="m-footer-tagline">Nourishing Newark, one kit at a time.</p>
      <hr className="m-foot-line" />
      <p className="m-footer-txt">Newark, New Jersey &middot; Nonprofit 501(c)(3) &middot; seedandspoon.org</p>
      <p className="m-footer-txt" style={{marginTop:'8px'}}>
        The same quality meal for every family — regardless of income.
      </p>
    </div>
  );
}

export default function MenuPage() {
  return (
    <div className={`seed-menu ${playfairFont.variable} ${dmSansFont.variable}`}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Cover />
      <Band>01 — Dinner Entrees</Band>
      <DinnerEntreesSection />
      <Band>01B — Pasta</Band>
      <PastaSection />
      <Band>02 — Breakfast</Band>
      <BreakfastSection />
      <Band>03 — Salads &amp; Sandwiches</Band>
      <SaladsSandwichesSection />
      <Band>04 — Sides</Band>
      <SidesSection />
      <Band>05 — Breads &amp; Add-Ons</Band>
      <BreadsSection />
      <Band>04B — Southern &amp; Soul Sides</Band>
      <SoulSidesSection />
      <Band>06 — Seasonal Specials</Band>
      <SeasonalSpecialsSection />
      <MenuFooter />
    </div>
  );
}
