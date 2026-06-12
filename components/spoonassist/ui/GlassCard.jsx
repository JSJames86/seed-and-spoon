function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Shared glass surface — the core card treatment for SpoonAssist.
// Use for cards, panels, and any elevated surface.
export default function GlassCard({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag className={cn('spoon-glass spoon-transition rounded-spoon-card p-5 md:p-6', className)} {...props}>
      {children}
    </Tag>
  );
}
