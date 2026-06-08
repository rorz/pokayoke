import { useRef, type CSSProperties, type PointerEvent } from "react";

import { PokayokeIcon } from "./brand-assets";

type AppIconStyle = CSSProperties & Record<`--${string}`, string>;

type HomeAppIconProps = {
  compact?: boolean;
};

const fullStageClass = [
  "hidden h-[380px] w-[380px] lg:grid",
  "before:absolute before:bottom-6 before:left-1/2 before:h-[30px] before:w-[70%]",
  "before:-translate-x-1/2 before:rounded-full before:bg-slate-900/20 before:blur-[18px]",
  "before:content-['']",
].join(" ");

const compactStageClass = "grid size-24 sm:size-28 lg:hidden";

const surfaceClass = [
  "relative z-[1] grid aspect-square w-[var(--app-size)] place-items-center overflow-hidden border",
  "border-zinc-300/90 bg-[linear-gradient(135deg,rgb(239_68_68_/_0.05),transparent_42%,rgb(14_165_233_/_0.06)),linear-gradient(145deg,rgb(255_255_255),rgb(248_250_252)_55%,rgb(235_238_242))]",
  "[transform:translate3d(var(--surface-x),var(--surface-y),0)] transition-[box-shadow,transform]",
  "duration-[220ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform",
  "before:pointer-events-none before:absolute before:inset-px before:rounded-[inherit] before:border",
  "before:border-white/70 before:shadow-[inset_10px_0_22px_rgb(239_68_68_/_0.05),inset_-10px_0_22px_rgb(14_165_233_/_0.06)] before:content-['']",
].join(" ");

const fullSurfaceClass = [
  "rounded-[clamp(22px,10%,42px)]",
  "shadow-[0_34px_70px_rgb(15_23_42_/_0.16),0_8px_20px_rgb(15_23_42_/_0.08),inset_0_1px_0_rgb(255_255_255_/_0.96),inset_0_-28px_42px_rgb(15_23_42_/_0.08)]",
].join(" ");

const compactSurfaceClass = [
  "rounded-[22px]",
  "shadow-[0_14px_28px_rgb(15_23_42_/_0.12),0_4px_12px_rgb(15_23_42_/_0.08),inset_0_1px_0_rgb(255_255_255_/_0.95),inset_0_-16px_24px_rgb(15_23_42_/_0.07)]",
].join(" ");

const iconClass = [
  "relative z-[2] h-auto w-[var(--icon-size)] [transform:translate3d(var(--icon-x),var(--icon-y),0)]",
  "transition-[filter,transform] duration-[220ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform",
].join(" ");

const fullIconStyle: AppIconStyle = {
  "--icon-x": "0px",
  "--icon-y": "0px",
  "--app-size": "340px",
  "--icon-size": "72%",
  "--surface-x": "0px",
  "--surface-y": "0px",
};

const compactIconStyle: AppIconStyle = {
  "--icon-x": "0px",
  "--icon-y": "0px",
  "--app-size": "100%",
  "--icon-size": "72%",
  "--surface-x": "0px",
  "--surface-y": "0px",
};

function resetParallax(node: HTMLDivElement) {
  node.style.setProperty("--surface-x", "0px");
  node.style.setProperty("--surface-y", "0px");
  node.style.setProperty("--icon-x", "0px");
  node.style.setProperty("--icon-y", "0px");
}

export function HomeAppIcon({ compact = false }: HomeAppIconProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const node = stageRef.current;

    if (!node) {
      return;
    }

    const rect = node.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
    const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
    const surfaceShift = compact ? 2 : 3;
    const iconShift = compact ? 4 : 7;

    node.style.setProperty("--surface-x", `${x * surfaceShift}px`);
    node.style.setProperty("--surface-y", `${y * surfaceShift}px`);
    node.style.setProperty("--icon-x", `${x * iconShift}px`);
    node.style.setProperty("--icon-y", `${y * iconShift}px`);
  }

  function handlePointerLeave() {
    const node = stageRef.current;

    if (node) {
      resetParallax(node);
    }
  }

  return (
    <div
      className={[
        "relative isolate place-items-center",
        compact ? compactStageClass : fullStageClass,
      ].join(" ")}
      onPointerCancel={handlePointerLeave}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      ref={stageRef}
      style={compact ? compactIconStyle : fullIconStyle}
    >
      <div
        className={[
          surfaceClass,
          compact ? compactSurfaceClass : fullSurfaceClass,
        ].join(" ")}
      >
        <PokayokeIcon className={iconClass} />
      </div>
    </div>
  );
}
