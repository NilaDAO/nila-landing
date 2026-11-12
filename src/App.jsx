import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { post } from "aws-amplify/api";
import Navbar from "./components/sections/Navbar";
import Hero from "./components/sections/Hero";
import WaveDivider from "./components/WaveDivider";
import MetricsBar from "./components/sections/MetricsBar";
import AboutNila from "./components/sections/AboutNila";
import ThreePanels from "./components/sections/ThreePanels";
const WireGlobe = lazy(() => import("./components/sections/globe"));
import InvestorFAQ from "./components/sections/InvestorFAQ";
import Footer from "./components/sections/Footer";
import RequestIMModal from "./components/RequestIMModal";
import PrivacyPolicy from "./components/sections/LegalPrivacy";
import TermsOfUse from "./components/sections/LegalTerms";
import RiskDisclosure from "./components/sections/LegalRiskDisclosure";
import UnionsPage from "./components/sections/UnionsPage";
import AuditPage from "./components/sections/AuditPage";
const W1Home = lazy(() => import("./w1/Home.jsx"));
const W1Audit = lazy(() => import("./w1/Audit.jsx"));
const W1Legal = lazy(() => import("./w1/Legal.jsx"));
const W1Whisp = lazy(() => import("./w1/Whisp.jsx"));
const loadHow = () => import("./w4/How.jsx");
const W4How = lazy(loadHow);

// Redesign (dev/nila-design page 6) behind a flag: VITE_REDESIGN=1 at build time; ?w1 previews it in `npm run dev` only.
const REDESIGN = import.meta.env.VITE_REDESIGN === "1" || (import.meta.env.DEV && new URLSearchParams(window.location.search).has("w1"));

//////////////////////////////////////// NOTE /////////////////////////////////////////
//                                                                                   //
// amplify is configured, but prod nila.land is part of nilapwa amplify project!!!   //
//                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////

// Per-route title and canonical for search engines and AI crawlers that run JavaScript (index.html has the home's).
const META = {
  "/how": "How it works: impact, software and climate measures · Nila",
  "/audit": "Audit fact sheet, read from Polygon and Stellar · Nila",
  "/audit/whisp": "Every land title checked with FAO Whisp for tree loss since 2020 · Nila",
  "/privacy": "Privacy Policy · Nila",
  "/terms": "Terms of Use · Nila",
  "/risk": "Risk Disclosure · Nila",
};
function setMeta(path) {
  if (META[path]) document.title = META[path];
  const c = document.querySelector('link[rel="canonical"]');
  if (c) c.href = `https://nila.land${META[path] ? path : "/"}`;
}

export default function App() {
  const path = window.location.pathname;
  setMeta(path);
  if (REDESIGN && ["/privacy", "/terms", "/risk"].includes(path)) return <Suspense fallback={null}><W1Legal path={path} /></Suspense>;
  if (path === "/privacy") return <PrivacyPolicy />;
  if (path === "/terms") return <TermsOfUse />;
  if (path === "/risk") return <RiskDisclosure />;
  if (path === "/audit/whisp" && REDESIGN) return <Suspense fallback={null}><W1Whisp /></Suspense>;
  if (path === "/audit") return REDESIGN ? <Suspense fallback={null}><W1Audit /></Suspense> : <AuditPage />;
  if (path === "/how" && REDESIGN) return <Suspense fallback={null}><W4How /></Suspense>;
  return <NilaLanding />;
}

function NilaLanding() {
  const [page, setPage] = useState("landing"); // "landing" | "unions" | "how"
  const [navScrolled, setNavScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const goToUnions = () => setPage("unions");
  const goToHow = () => setPage("how");

  // Redesign: dark page ground, so the home page fades to ink (not the old light ground) when a page slides in;
  // and the /how chunk loads ahead so it slides in on the first tap.
  useEffect(() => {
    if (!REDESIGN) return undefined;
    const prev = document.body.style.background;
    document.body.style.background = "#0A0A0A";
    const t = setTimeout(loadHow, 2000);
    return () => { document.body.style.background = prev; clearTimeout(t); };
  }, []);
  const goToLanding = () => setPage("landing");

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showModal]);

  const openModal = () => {
    setSubmitted(false);
    setError(null);
    setSubmitting(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({ name: "", email: "" });
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email.trim())) {
      setError("Please provide a valid email address.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const op = post({
        apiName: "signup",
        path: "/signup",
        options: {
          body: {
            email: form.email.trim(),
            organization: form.name.trim(),
          },
        },
      });
      await op.response;
      setSubmitted(true);
      setForm({ name: "", email: "" });
    } catch (err) {
      let message = "Could not submit. Please try again.";
      try {
        const body = await err?.response?.body?.json();
        if (body?.message) message = body.message;
      } catch {
        if (err?.message) message = err.message;
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/*
        Navbar rendered with NO wrapper opacity/transform — those create a stacking context
        that traps position:fixed children and makes the hamburger unreliable on mobile.
        Visibility is controlled directly on the nav via the Navbar component receiving
        a hidden prop, using visibility+pointerEvents (no opacity transition on a parent).
      */}
      {!REDESIGN && <Navbar scrolled={navScrolled} onOpenUnions={goToUnions} hidden={page === "unions"} />}

      {/* Landing page content — desktop gets translateX slide, mobile gets fade-only
          (translateX on mobile widens the document and breaks fixed nav anchoring) */}
      <div style={{
        transform: page !== "landing" && window.innerWidth >= 768 ? "translateX(-30%)" : "translateX(0)",
        opacity: page !== "landing" ? 0 : 1,
        transition: "transform 0.45s cubic-bezier(0.32,0,0.18,1), opacity 0.45s cubic-bezier(0.32,0,0.18,1)",
        pointerEvents: page !== "landing" ? "none" : "auto",
      }}>
        {REDESIGN ? <Suspense fallback={null}><W1Home onOpenUnions={goToUnions} onOpenHow={goToHow} /></Suspense> : <>
        <Hero onOpenModal={openModal} onOpenUnions={goToUnions} />
        <WaveDivider direction="dark-to-light" />
        <MetricsBar />
        <AboutNila />
        <ThreePanels onOpenUnions={goToUnions} />
        <Suspense fallback={null}><WireGlobe banner /></Suspense>
        <InvestorFAQ />
        <Footer />
        </>}
      </div>

      {/* Unions page — slides in as a fixed full-screen overlay */}
      <AnimatePresence>
        {page === "unions" && (
          <motion.div
            key="unions"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.32, 0, 0.18, 1] }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              overflowY: "auto",
            }}
          >
            <UnionsPage onBack={goToLanding} onOpenModal={openModal} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* W4 how it works — slides in the same way (Carst, 10 Nov) */}
      <AnimatePresence>
        {page === "how" && (
          <motion.div
            key="how"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.32, 0, 0.18, 1] }}
            style={{ position: "fixed", inset: 0, zIndex: 200, overflowY: "auto" }}
          >
            <Suspense fallback={null}><W4How onBack={goToLanding} onOpenUnions={goToUnions} /></Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {showModal && (
        <RequestIMModal
          form={form}
          setForm={setForm}
          submitted={submitted}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
