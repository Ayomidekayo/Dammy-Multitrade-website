
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  phone?: string | null;
  productName?: string;
  className?: string;
}

export default function WhatsAppButton({
  phone,
  productName,
  className = "",
}: WhatsAppButtonProps) {
  const number = (phone ?? "").replace(/\D/g, "");

  const message = productName
    ? `Hello, Dammy Multitrade Ventures. I would like to enquire about ${productName}. Please share the price and availability.`
    : "Hello, Dammy Multitrade Ventures. I would like to make an enquiry.";

  const href = number
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : undefined;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={
        productName
          ? `Enquire about ${productName} on WhatsApp`
          : "Contact us on WhatsApp"
      }
      onClick={(event) => {
        if (!href) event.preventDefault();
      }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[#1fb85a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 ${className}`}
    >
      <MessageCircle size={18} />
      WhatsApp enquiry
    </a>
  );
}
