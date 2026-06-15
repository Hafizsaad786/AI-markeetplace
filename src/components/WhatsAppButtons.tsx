import { MessageCircle, Radio } from "lucide-react";

export const WA_CHANNEL = "https://whatsapp.com/channel/0029Vb4wRJBBadmUDIOh5A1E";
export const WA_CONTACT = "https://wa.me/923133488621";

export function FloatingWhatsApp() {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      <a
        href={WA_CONTACT}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp contact"
        className="grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <a
        href={WA_CHANNEL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp channel"
        className="grid h-12 w-12 place-items-center rounded-full bg-card border border-border text-primary shadow-lg hover:scale-105 transition"
      >
        <Radio className="h-5 w-5" />
      </a>
    </div>
  );
}

export function WhatsAppInlineButtons() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <a
        href={WA_CONTACT}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-3 py-2 text-sm font-medium text-white hover:opacity-90 transition"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp Contact
      </a>
      <a
        href={WA_CHANNEL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-primary hover:bg-secondary transition"
      >
        <Radio className="h-4 w-4" />
        Join Channel
      </a>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="text-center text-xs text-muted-foreground py-4">
      Developed by <span className="text-primary font-medium">Hafiz Saad</span>
    </footer>
  );
}
