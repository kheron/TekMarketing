import {
  TEKHERO_COMMERCIAL_DOCS_URL,
  TEKHERO_GITHUB_URL,
  TEKHERO_PRODUCT_PATH,
  TEKHERO_URL,
} from "@/lib/config/tekhero";

interface TekheroFooterProps {
  variant?: "compact" | "full";
}

export function TekheroFooter({ variant = "compact" }: TekheroFooterProps) {
  if (variant === "compact") {
    return (
      <div className="text-[11px] text-[#52525b] leading-relaxed">
        <a
          href={TEKHERO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
        >
          Powered by TEKHERO
        </a>
        <span className="mx-1.5 text-[#3f3f46]">·</span>
        <span>Open Core</span>
        <span className="mx-1.5 text-[#3f3f46]">·</span>
        <a
          href={TEKHERO_PRODUCT_PATH}
          className="text-blue-400/80 hover:text-blue-400 transition-colors"
        >
          Plans
        </a>
      </div>
    );
  }

  return (
    <footer className="border-t border-[#27272a] bg-[#09090b] px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[12px] text-[#71717a]">
        <div>
          <span className="text-[#a1a1aa] font-medium">TekMarketing</span>
          <span className="mx-2 text-[#3f3f46]">·</span>
          Open Core AI Marketing Agent by{" "}
          <a
            href={TEKHERO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#a1a1aa] hover:text-white transition-colors"
          >
            TEKHERO
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <a
            href={TEKHERO_GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#a1a1aa] transition-colors"
          >
            GitHub
          </a>
          <a
            href={TEKHERO_PRODUCT_PATH}
            className="hover:text-[#a1a1aa] transition-colors"
          >
            Product & pricing
          </a>
          <a
            href={TEKHERO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#a1a1aa] transition-colors"
          >
            tekhero.us
          </a>
        </div>
      </div>
    </footer>
  );
}