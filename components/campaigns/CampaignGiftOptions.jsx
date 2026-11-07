import Link from 'next/link';

const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');

export default function CampaignGiftOptions({ options, monthly }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {options.map((o) => (
        <Link
          key={o.amount}
          href={o.href}
          className="group rounded-xl bg-white p-5 shadow-md border border-[#02538A]/10 hover:border-[#EA802F] hover:shadow-lg transition-all"
        >
          <span className="block text-2xl font-bold text-[#02538A] group-hover:text-[#EA802F]">{usd(o.amount)}</span>
          {o.label && <span className="block mt-1 text-gray-700">{o.label}</span>}
        </Link>
      ))}
      {monthly && (
        <Link
          href={monthly.href}
          className="group rounded-xl bg-[#77A462] p-5 shadow-md text-white hover:bg-[#5a8a4a] transition-all"
        >
          <span className="block text-2xl font-bold">{monthly.title}</span>
          <span className="block mt-1">{monthly.label}</span>
        </Link>
      )}
    </div>
  );
}
