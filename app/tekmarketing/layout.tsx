import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TekMarketing — Open Core AI Marketing Agent | TEKHERO",
  description:
    "Strategic AI marketing with human-in-the-loop approval. Open Core for personal use. Commercial licensing for business, agencies, and white-label.",
};

export default function TekmarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}