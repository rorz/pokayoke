import {
  CheckCircle,
  Info,
  Lightbulb,
  SealWarning,
  Warning,
  WarningOctagon,
  type Icon,
} from "@phosphor-icons/react";

import type { CalloutTone } from "../lib/github-callouts";

type CalloutProps = {
  title?: string;
  tone?: CalloutTone;
  children: React.ReactNode;
};

const calloutStyles: Record<CalloutTone, { border: string; icon: Icon; title: string }> = {
  caution: { border: "border-[#cf222e]", icon: WarningOctagon, title: "text-[#cf222e]" },
  important: { border: "border-[#8250df]", icon: SealWarning, title: "text-[#8250df]" },
  note: { border: "border-[#0969da]", icon: Info, title: "text-[#0969da]" },
  success: { border: "border-[#1a7f37]", icon: CheckCircle, title: "text-[#1a7f37]" },
  tip: { border: "border-[#1a7f37]", icon: Lightbulb, title: "text-[#1a7f37]" },
  warning: { border: "border-[#9a6700]", icon: Warning, title: "text-[#9a6700]" },
};

export function Callout({ title, tone = "note", children }: CalloutProps) {
  const styles = calloutStyles[tone];
  const CalloutIcon = styles.icon;

  return (
    <aside className={["my-5 border-l-2 pl-4 text-[14px] text-neutral-700", styles.border].join(" ")}>
      {title ? (
        <div className={["mb-1 flex items-center gap-1.5 font-medium", styles.title].join(" ")}>
          <CalloutIcon aria-hidden="true" className="shrink-0" size={15} weight="bold" />
          <span>{title}</span>
        </div>
      ) : null}
      <div className="[&>*:first-child]:!mt-1 [&>*:last-child]:!mb-0">{children}</div>
    </aside>
  );
}
