/**
 * useLandHolders
 *
 * Returns totalSupply() of the NilaLandTitle ERC-721 contract on Polygon —
 * one token per farmer, so totalSupply == number of land title holders.
 */

import { useQuery } from '@tanstack/react-query';
import { ethers }   from 'ethers';

const LAND_CONTRACT = '0x636060dbC695a8232992b28c1765828263f17251';
const RPC_URL       = import.meta.env.VITE_RPC_URL ?? 'https://polygon-rpc.com';

const TOTAL_SUPPLY_DATA = '0x18160ddd'; // totalSupply() selector

async function fetchTotalSupply() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const hex = await provider.call({ to: LAND_CONTRACT, data: TOTAL_SUPPLY_DATA });
  return Number(BigInt(hex));
}

export function useLandHolders() {
  return useQuery({
    queryKey:             ['landTotalSupply'],
    staleTime:            10 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect:   true,
    retry:                3,
    retryDelay:           (i) => Math.min(1000 * 2 ** i, 8000),
    queryFn:              fetchTotalSupply,
  });
}
