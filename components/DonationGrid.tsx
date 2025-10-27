import { programs } from '@/data/programs';
import { DonationCard } from './DonationCard';

// Optional: Track raised amounts per program
// For now, all programs start at $0 raised
const raised: Record<string, number> = {
  hot_meals: 0,
  food_boxes: 0,
  community_dinners: 0,
  seed_training: 0,
  operations: 0,
  cleaning_sanitation: 0,
};

export function DonationGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {programs.map((program) => (
        <DonationCard
          key={program.id}
          program={program}
          raisedUsd={raised[program.id] || 0}
        />
      ))}
    </div>
  );
}
