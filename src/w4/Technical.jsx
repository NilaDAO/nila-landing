// /how — Technical tab: what makes the plan and the vouchers hold (docs/W4_frame.md §2), then the satellite section.
import { Section, Rows } from "./ui.jsx";
import DSat from "./DSat.jsx";
import MSat from "./MSat.jsx";

const ROWS = [
  { title: "Land title", s: "live", where: "Polygon: NilaLandTitle · Stellar: land_title (temporary)",
    body: "The leader drops a point on her field, the satellite proposes the shape, the leader accepts it. The title is minted to her own account." },
  { title: "The year plan", s: "live", where: "nila-sensing plan engine",
    body: "The AI drafts it from her answers, her fields’ satellite history and the district crop calendar. Amounts and dates come from fixed rules in the code, not from the AI. She and her leader change the draft, and her choice stands unless it breaks a hard fact, such as a field with no water." },
  { title: "Food token", s: "live", where: "Polygon: FoodToken · Stellar: crop_calendar, fund_core",
    body: "One token per planned crop, tied to her land title. A crop share can only be drawn against it, inside that crop’s sowing window." },
  { title: "Vouchers", s: "live", where: "Stellar: fund_core, machinery",
    body: "Tractor hours and seed are paid to the machine owner or the shop, not to her as cash. A voucher cannot be sold or sent on." },
  { title: "Who signs", s: "live", where: "Stellar: native multisig accounts",
    body: "The union’s account needs 2 of its 3 leaders to sign; the trust’s account needs 3 of 5. No single person moves the union’s money." },
  { title: "Harvest date on-chain", s: "off", where: "nila-sensing → fund_core",
    body: "The satellite dates the end of each season and that sets when her share is due. The code is written; writing the date on-chain is not switched on yet." },
  { title: "Public audit", s: "live", where: "nila.land/audit",
    body: "Every contract address and the code it runs, read from both chains, with the loan tape as a file." },
];

export default function Technical({ mobile }) {
  const Sat = mobile ? MSat : DSat;
  return (
    <>
      <Section mobile={mobile} eyebrow="Technical" title="What holds it together."
               intro="What a crop plan and a voucher are is on the home page. This is what makes them hold: what sits on which chain, who has to sign, and what the AI may and may not decide.">
        <Rows mobile={mobile} rows={ROWS} />
      </Section>
      <Sat />
    </>
  );
}
