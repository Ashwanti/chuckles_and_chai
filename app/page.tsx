import { Evenings, Reviews } from "@/components/Evenings";
import { Faq } from "@/components/Faq";
import { Hero } from "@/components/Hero";
import { JsonLd } from "@/components/JsonLd";
import { BRAND_TICKER, Marquee, QuickBar, SOCIAL_TICKER } from "@/components/Marquee";
import { MenuSection } from "@/components/MenuSection";
import { Moodboard } from "@/components/Moodboard";
import { Ritual } from "@/components/Ritual";
import { IntoGrid, Story } from "@/components/Story";
import { Visit } from "@/components/Visit";
import { faqSchema, localBusinessSchema } from "@/lib/schema";

export default function HomePage() {
  return (
    <>
      <JsonLd data={localBusinessSchema()} />
      <JsonLd data={faqSchema()} />

      <main id="main">
        <Hero />
        <Marquee items={BRAND_TICKER} />
        <QuickBar />
        <Story />
        <Ritual />
        <MenuSection />
        <IntoGrid />
        <Evenings />
        <Reviews />
        <Marquee items={SOCIAL_TICKER} tone="wine" />
        <Moodboard />
        <Visit />
        <Faq />
      </main>
    </>
  );
}
