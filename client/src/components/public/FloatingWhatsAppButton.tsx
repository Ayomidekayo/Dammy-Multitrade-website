import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { catalogApi } from "../../features/catalog/catalog.api";

// Optional fallback: enter your business number in international digits only, e.g. 2348012345678.
const FALLBACK_WHATSAPP_NUMBER = "";

function normalizeWhatsAppNumber(value?: string | null) {
  return (value ?? "").replace(/\D/g, "");
}

export default function FloatingWhatsAppButton() {
  const [whatsappNumber, setWhatsappNumber] = useState(FALLBACK_WHATSAPP_NUMBER);
  const [isOpen, setIsOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let active = true;

    async function loadWhatsAppNumber() {
      try {
        const response = await catalogApi.getSettings();
        const data = (response as any)?.data?.data ?? (response as any)?.data ?? response;
        const number =
          data?.whatsapp ??
          data?.settings?.whatsapp ??
          data?.siteSettings?.whatsapp ??
          "";

        if (active && typeof number === "string" && number.trim()) {
          setWhatsappNumber(number);
        }
      } catch (error) {
        console.error("Unable to load WhatsApp settings:", error);
      }
    }

    void loadWhatsAppNumber();
    return () => {
      active = false;
    };
  }, []);

  const normalizedNumber = normalizeWhatsAppNumber(whatsappNumber);
  const message = "Hello Dammy Multitrade Ventures! I’m interested in your products. Can you help me?";
  const chatUrl = normalizedNumber
    ? `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-[min(320px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            role="dialog"
            aria-label="Welcome WhatsApp message"
          >
            <div className="flex items-start gap-3 bg-[#0B1220] px-4 py-4 text-white">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
                <FaWhatsapp className="text-2xl text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Welcome to Dammy Multitrade!</p>
                <p className="mt-1 text-sm leading-5 text-slate-200">
                  Let’s discuss what you need. How can we help you today?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md px-1 text-xl leading-none text-slate-300 transition hover:text-white"
                aria-label="Close welcome message"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm leading-6 text-slate-600">
                Tell us about the product or solution you’re looking for, and our team will be happy to assist.
              </p>
              <a
                href={chatUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1EBE5D] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
              >
                <FaWhatsapp className="text-xl" aria-hidden="true" />
                Let’s chat on WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        {!isOpen && (
          <motion.button
            type="button"
            onClick={() => setIsOpen(true)}
            initial={reduceMotion ? false : { opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            aria-label="Open welcome message"
          >
            Let’s talk
          </motion.button>
        )}
        <motion.button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          whileHover={reduceMotion ? undefined : { scale: 1.07 }}
          whileTap={reduceMotion ? undefined : { scale: 0.95 }}
          animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
          transition={reduceMotion ? undefined : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl ring-4 ring-white/80 transition hover:bg-[#1EBE5D] focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
          aria-label={isOpen ? "Close WhatsApp welcome message" : "Open WhatsApp welcome message"}
        >
          <FaWhatsapp className="text-[2rem]" aria-hidden="true" />
        </motion.button>
      </div>
    </div>
  );
}
