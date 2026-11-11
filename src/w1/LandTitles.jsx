// Live count of land titles (NilaLandTitle.totalSupply on Polygon); the board's figure until the read returns.
import { useLandHolders } from "../hooks/useLandHolders";

export default function LandTitles({ fallback }) {
  const { data } = useLandHolders();
  return <>{data != null ? String(data) : fallback}</>;
}
