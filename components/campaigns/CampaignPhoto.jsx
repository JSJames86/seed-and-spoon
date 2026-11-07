import Image from 'next/image';

export default function CampaignPhoto({ image, className = '', sizes = '(min-width: 1024px) 380px, 100vw', priority = false }) {
  if (!image?.src) return null;
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      className={`w-full h-auto rounded-2xl shadow-2xl ${className}`}
    />
  );
}
