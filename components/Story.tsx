import Image from "next/image";

import { Icon } from "./Icons";
import { Reveal } from "./Reveal";
import { SITE } from "@/lib/site.config";

const FACTS = [
  { value: "2025", label: "Pouring since" },
  { value: "4.9★", label: "72 Google reviews" },
  { value: "4pm", label: "Kettle goes on" },
];

export function Story() {
  return (
    <section className="section story" id="story">
      <div className="wrap">
        <div className="story__grid">
          {/* An offset pair rather than one flat photograph: the room, and a
              detail from it. Both slots want the CAFE'S OWN pictures - the
              interior especially, since it is the one thing a stand-in cannot
              honestly stand in for. Drop replacements over
              public/images/story-interior.jpg and story-detail.jpg; the
              dimensions already match. */}
          <Reveal kind="curtain" className="story__media">
            <div className="frame frame--zoom story__shot story__shot--room">
              <Image
                src="/images/story-interior.jpg"
                alt="The counter of a small independent café"
                width={1200}
                height={1500}
                sizes="(min-width: 940px) 38vw, 92vw"
                loading="lazy"
              />
            </div>
            <div className="frame story__shot story__shot--detail">
              <Image
                src="/images/story-detail.jpg"
                alt="Chai in a clay kulhad on the counter"
                width={1000}
                height={1000}
                sizes="(min-width: 940px) 18vw, 40vw"
                loading="lazy"
              />
            </div>
            <div className="story__badge" aria-hidden="true">
              <b>{SITE.business.established}</b>
              <i>Est.</i>
            </div>
          </Reveal>

          <Reveal kind="right" className="story__body">
            <p className="kicker">Our story</p>
            <h2>
              A small café with <span className="wink">strong opinions</span> about a four-minute
              cup.
            </h2>
            <p className="lede">
              Chuckles &amp; Chai opened in 2025 around one stubborn idea: that the difference
              between chai and good chai is entirely in the four minutes nobody wants to spend on
              it.
            </p>
            <p>
              So we spend them. Whole spices go into a stone mortar every morning, never a grinder.
              Assam leaf and water go on a rolling boil before the milk is anywhere near the pan.
              Three boils, two strainings, then the pour — pulled between two vessels until the
              froth stands up on its own. Next to it there is Chikmagalur coffee pulled the same
              way, food that is meant for sharing, and a counter that changes through the week.
            </p>

            <Reveal className="story__facts stagger">
              {FACTS.map((fact) => (
                <div className="story__fact" key={fact.label}>
                  <b>{fact.value}</b>
                  <span>{fact.label}</span>
                </div>
              ))}
            </Reveal>

            <div className="cta-row">
              <a className="btn" href="#ritual">
                How the chai is made <Icon name="arrow" className="ico" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* Five cards into a three-column grid: the first one is double width, so the
   two rows come out 2+1 / 1+1+1 and fill exactly. Give a second card a span
   and the last row grows a hole in it. */
const CARDS = [
  {
    n: "01",
    title: "Kulhad service",
    img: "/images/into-kulhad.jpg",
    alt: "Chai served in a clay kulhad",
    body: "Fired clay, used once, thrown back to the earth after. It takes the edge off the sweetness and puts something mineral behind the spice. Ask for a cutting glass instead if you prefer.",
    className: "into__card--wide",
  },
  {
    n: "02",
    title: "Ground that morning",
    img: "/images/into-spice.jpg",
    alt: "Whole Indian spices",
    body: "Cardamom, clove, fennel, pepper. Twelve spices in the house blend, pounded by hand and measured out an hour before we open.",
  },
  {
    n: "03",
    title: "Filter kaapi",
    img: "/images/into-coffee.jpg",
    alt: "South Indian filter coffee in a steel dabara",
    body: "Chikmagalur beans, 80:20 with chicory, pulled through a steel dabara and frothed the loud way. The metre-long pour is included.",
  },
  {
    n: "04",
    title: "Food worth staying for",
    img: "/images/into-food.jpg",
    alt: "Pakoras on a plate",
    body: "Bun maska at one end, truffle mushroom toast at the other, and momos somewhere in between. Veg and non-veg cooked separately.",
  },
  {
    n: "05",
    title: "The evening shift",
    img: "/images/into-evening.jpg",
    alt: "Warm light in a quiet café",
    body: "We do not do mornings. Four in the afternoon until late is when this place is actually itself — long tables, longer conversations.",
  },
];

export function IntoGrid() {
  return (
    <section className="section section--tint" id="into">
      <div className="wrap">
        <Reveal className="head">
          <p className="kicker">What we care about</p>
          <h2>
            Five things we will not <span className="wink">rush.</span>
          </h2>
        </Reveal>

        <div className="into__grid">
          {CARDS.map((card, i) => (
            <Reveal
              key={card.n}
              as="article"
              kind="scale"
              delay={i * 70}
              className={["into__card", card.className].filter(Boolean).join(" ")}
            >
              <Image
                src={card.img}
                alt={card.alt}
                width={1200}
                height={900}
                sizes="(min-width: 1080px) 33vw, (min-width: 700px) 50vw, 100vw"
                loading="lazy"
              />
              <span className="into__num">{card.n}</span>
              <div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
