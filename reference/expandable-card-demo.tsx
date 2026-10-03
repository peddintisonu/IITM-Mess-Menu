import { ExpandableCard, type ExpandableCardItem } from "@/components/ui/expandable-card/expandable-card";

const item: ExpandableCardItem = {
  id: 1,
  imageSrc: "/p-01.svg",
  cardHeading: "Eudaimonia",
  alt: "Figure contemplating under an archway at dusk",
  content: (
    <div>
      <p style={{ margin: "0 0 1rem 0" }}>
        Aristotle taught that eudaimonia, or human flourishing, is not found in fleeting pleasures or material wealth,
        but in living a life of virtue and purpose. It is the highest good, achieved through the cultivation of
        character and the exercise of reason.
      </p>

      <p style={{ margin: "0 0 1rem 0" }}>
        We build not for momentary delight, but for lasting excellence. Every interface, every interaction is an
        opportunity to help users flourish in their work and creative pursuits.
      </p>
    </div>
  ),
};
export default function ExpandableCardDemo() {
  return (
    <div>
      <ExpandableCard item={item} />
    </div>
  );
}