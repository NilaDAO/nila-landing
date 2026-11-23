// The senior guarantee pool on Stellar mainnet (executive decision 23 Nov): reads by simulation, writes signed in
// the investor's own wallet (Stellar Wallets Kit, public/vendor/swk.js, as nila-admin's console). No key here.
import {
  Account, Address, Contract, Networks, TransactionBuilder, nativeToScVal, rpc, scValToNative,
} from "@stellar/stellar-sdk";

export const NET = Networks.PUBLIC;
const RPC = "https://rpc.lightsail.network/";
export const SENIOR = "CD3T5LXYQBNW4LE743RIMFUOHVKCX72QXBXFYXB6IJSTTX5LYSO4445S";
export const USDC = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";
// Any funded account works as the source of a read-only simulation: the trust's.
const READER = "GC2VBH7W2N2ZWEFZHWGB7DJ35HSD3DZKTNBMSCKJUYGJKUKESEHK5U3E";
export const UNIT = 10_000_000n;   // USDC 7 decimals
const RAY = 10n ** 27n;
export const UNBOND_S = 14 * 86_400;

const server = new rpc.Server(RPC);
export const addr = (a) => new Address(a).toScVal();
export const i128 = (v) => nativeToScVal(BigInt(v), { type: "i128" });

export async function read(contract, fn, args = []) {
  const tx = new TransactionBuilder(new Account(READER, "0"), { fee: "100", networkPassphrase: NET })
    .addOperation(new Contract(contract).call(fn, ...args)).setTimeout(60).build();
  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) throw new Error(sim.error);
  return sim.result ? scValToNative(sim.result.retval) : null;
}

/** Everything the page shows for one wallet. */
export async function load(who) {
  // Acceptance first: an uninvited wallet reads nothing else.
  const inv = await read(SENIOR, "investor", [addr(who)]);
  if (!inv?.accepted) return { accepted: false };
  const [hold, total, index, bal] = await Promise.all([
    read(SENIOR, "holding", [addr(who)]),
    read(SENIOR, "total"),
    read(SENIOR, "index"),
    read(USDC, "balance", [addr(who)]).catch(() => 0n),
  ]);
  const [h, value] = hold;
  const idx = BigInt(index);
  return {
    accepted: !!inv?.accepted,
    shares: BigInt(h.shares), pending: BigInt(h.pending), requestTs: Number(h.request_ts),
    value: BigInt(value), pendingValue: (BigInt(h.pending) * idx) / RAY,
    total: BigInt(total), balance: BigInt(bal),
  };
}

let kit;
function wallets() {
  if (kit) return Promise.resolve(kit);
  return new Promise((ok, fail) => {
    const s = document.createElement("script");
    s.src = "/vendor/swk.js";
    s.onload = () => {
      kit = window.SWK.StellarWalletsKit;
      kit.init({ modules: window.SWK.defaultModules(), network: NET });
      ok(kit);
    };
    s.onerror = () => fail(new Error("The wallet module did not load."));
    document.head.appendChild(s);
  });
}

export async function connect() {
  const k = await wallets();
  const { address } = await k.authModal();
  return address;
}

/** One senior call, signed in the investor's wallet and sent; resolves when it is in a ledger. */
export async function send(who, fn, args) {
  const k = await wallets();
  const src = await server.getAccount(who);
  let tx = new TransactionBuilder(src, { fee: "100000", networkPassphrase: NET })
    .addOperation(new Contract(SENIOR).call(fn, ...args)).setTimeout(300).build();
  tx = await server.prepareTransaction(tx);
  const { signedTxXdr } = await k.signTransaction(tx.toXDR(), { address: who, networkPassphrase: NET });
  const sent = await server.sendTransaction(TransactionBuilder.fromXDR(signedTxXdr, NET));
  if (sent.status === "ERROR") throw new Error("The network refused the transaction.");
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const got = await server.getTransaction(sent.hash);
    if (got.status === "SUCCESS") return sent.hash;
    if (got.status === "FAILED") throw new Error("The transaction failed.");
  }
  throw new Error("No answer from the network yet; reload in a minute.");
}

export const usdc = (v) => (Number(v) / Number(UNIT)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
