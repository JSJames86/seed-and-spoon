"use client";

import dynamic from "next/dynamic";

const StoryScroll = dynamic(() => import("@/components/StoryScroll"), { ssr: false });
const SpoonAssistFeature = dynamic(() => import("@/components/SpoonAssistFeature"), { ssr: false });
const WhyThisMatters = dynamic(() => import("@/components/WhyThisMatters"), { ssr: false });
const SDGSection = dynamic(() => import("@/components/sdgs/SDGSection"), { ssr: false });

export default function BelowFold() {
  return (
    <>
      <StoryScroll />
      <SpoonAssistFeature />
      <WhyThisMatters />
      <SDGSection />
    </>
  );
}
