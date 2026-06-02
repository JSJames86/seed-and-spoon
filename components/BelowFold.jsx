"use client";

import dynamic from "next/dynamic";

// dynamic() without ssr:false — keeps SSR intact but splits the JS bundle
// so GSAP and heavy components don't block the critical path
const StoryScroll = dynamic(() => import("@/components/StoryScroll"));
const SpoonAssistFeature = dynamic(() => import("@/components/SpoonAssistFeature"));
const WhyThisMatters = dynamic(() => import("@/components/WhyThisMatters"));
const SDGSection = dynamic(() => import("@/components/sdgs/SDGSection"));

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
