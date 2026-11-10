// /how — Climate tab: turning the ship (docs/W4_frame.md §3). Plan rules we have; recovery we cannot show yet.
import { Section, Rows } from "./ui.jsx";

const ROWS = [
  { title: "No bare soil", s: "rule",
    body: "In the dry months every field carries a crop or green manure. Green manure is its own crop share, repaid with the next crop. Where it is not financed, the plan says mulch." },
  { title: "All three seasons planned", s: "rule",
    body: "The plan covers Kuruvai, Samba and summer for every field, so the dry season is planned too, not left to chance." },
  { title: "The baseline", s: "live",
    body: "Each field has 8 years of satellite history before its first plan. That is the line we measure it against." },
  { title: "Recovery", s: "open",
    body: "Not shown yet. The first year plans run in 2026–27. We will publish the same fields’ vegetation index, season by season, against their own baseline." },
  { title: "How many seasons the land has left", s: "open",
    body: "We have not found a source we trust for these fields. Until we do, we do not put a number on it." },
  { title: "Carbon", s: "open", body: "No carbon or methane claims. We do not measure them." },
];

export default function Climate({ mobile }) {
  return (
    <Section mobile={mobile} eyebrow="Climate" title="Turning the ship."
             intro="Land that carries the same crop season after season, and lies bare in the dry months, gives a little less each year. These are the plan rules that change that on her fields. Whether it works we will measure; we cannot show it today.">
      <Rows mobile={mobile} rows={ROWS} />
    </Section>
  );
}
