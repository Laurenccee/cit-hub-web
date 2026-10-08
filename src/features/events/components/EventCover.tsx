"use client";

import { cn } from "@/lib/utils";

interface EventCoverProps {
  cover?: string;
  className?: string;
  rounded?: string;
}

/**
 * Pure-CSS cover art for event cards and the hero banner.
 * Stylized scenes stand in for photography until real images are uploaded.
 */
export default function EventCover({ cover, className, rounded = "rounded-none" }: EventCoverProps) {
  return (
    <div className={cn("relative w-full overflow-hidden", rounded, className)} aria-hidden="true">
      <CoverScene cover={cover} />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 45%, rgba(0,0,0,0.08) 100%)",
        }}
      />
    </div>
  );
}

function DotTexture({ color = "rgba(255,255,255,0.22)" }: { color?: string }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `radial-gradient(${color} 1px, transparent 1.4px)`,
        backgroundSize: "11px 11px",
      }}
    />
  );
}

function CoverScene({ cover }: { cover?: string }) {
  switch (cover) {
    case "symposium":
      return (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(110% 90% at 78% 18%, #7c2d4e 0%, #3b1d3f 34%, #141b33 68%, #0b1023 100%)",
          }}
        >
          {/* stage screen glow */}
          <div
            className="absolute right-[8%] top-[10%] h-[62%] w-[30%] rounded-sm"
            style={{
              background:
                "linear-gradient(135deg, rgba(56,189,248,0.55), rgba(168,85,247,0.5) 55%, rgba(244,114,182,0.45))",
              boxShadow: "0 0 60px rgba(56,189,248,0.35)",
            }}
          />
          {/* light beams */}
          <div className="absolute left-[30%] top-[-20%] h-[140%] w-10 rotate-24 bg-white/10 blur-[2px]" />
          <div className="absolute left-[44%] top-[-20%] h-[140%] w-5 rotate-24 bg-white/10 blur-[2px]" />
          {/* speaker silhouette */}
          <div className="absolute bottom-0 right-[16%] h-[70%] w-10 rounded-t-full bg-black/70" />
          <div className="absolute bottom-[62%] right-[15%] h-8 w-12 rounded-full bg-black/70" />
          {/* crowd */}
          <div className="absolute inset-x-0 bottom-0 h-[42%] opacity-70">
            <DotTexture />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.75), transparent)",
              }}
            />
          </div>
        </div>
      );
    case "robotics":
      return (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 100% at 20% 10%, #f3e2c7 0%, #d9b98c 30%, #8a6a4b 62%, #3d2f24 100%)",
          }}
        >
          {/* workbench */}
          <div className="absolute inset-x-0 bottom-0 h-[34%] bg-[#4a3826]/90" />
          <div className="absolute inset-x-0 bottom-[34%] h-1.5 bg-[#2e2318]" />
          {/* laptop glow */}
          <div className="absolute bottom-[36%] right-[14%] h-[26%] w-[22%] rounded-sm bg-slate-900">
            <div className="absolute inset-[12%] rounded-[2px] bg-sky-200/80" />
          </div>
          {/* rover bot */}
          <div className="absolute bottom-[36%] left-[16%] h-[20%] w-[30%] rounded-md bg-slate-800/90" />
          <div className="absolute bottom-[30%] left-[19%] h-[8%] w-[6%] rounded-full bg-slate-950 ring-2 ring-slate-500" />
          <div className="absolute bottom-[30%] left-[37%] h-[8%] w-[6%] rounded-full bg-slate-950 ring-2 ring-slate-500" />
          {/* people silhouettes */}
          <div className="absolute bottom-[36%] left-[6%] h-[44%] w-[9%] rounded-t-full bg-[#232838]/90" />
          <div className="absolute bottom-[36%] left-[52%] h-[48%] w-[10%] rounded-t-full bg-[#2c2430]/90" />
          <div className="absolute bottom-[36%] right-[38%] h-[42%] w-[9%] rounded-t-full bg-[#1f2a33]/90" />
          <DotTexture color="rgba(0,0,0,0.12)" />
        </div>
      );
    case "expo":
      return (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, #28424f 0%, #4b6b7a 30%, #9fb3bd 55%, #31424e 100%)",
          }}
        >
          {/* booth panels */}
          {["6%", "30%", "54%", "78%"].map((left, i) => (
            <div
              key={left}
              className="absolute top-[8%] h-[70%] w-[18%] rounded-[2px]"
              style={{
                left,
                background: `linear-gradient(to bottom, ${i % 2 ? "#e8eef1" : "#f7fafb"} 0 30%, #2f6f4f 30% 46%, ${i % 2 ? "#dfe7ea" : "#eef3f4"} 46% 100%)`,
                boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
              }}
            />
          ))}
          {/* crowd heads */}
          <div className="absolute inset-x-0 bottom-0 h-[30%]">
            <DotTexture color="rgba(0,0,0,0.28)" />
          </div>
        </div>
      );
    case "gala":
      return (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(130% 110% at 50% 0%, #8a5a2b 0%, #4d2f16 38%, #241407 70%, #120903 100%)",
          }}
        >
          {/* hall arches */}
          <div className="absolute bottom-[26%] left-[10%] h-[52%] w-[16%] rounded-t-full border-[3px] border-amber-200/40" />
          <div className="absolute bottom-[26%] left-[31%] h-[58%] w-[16%] rounded-t-full border-[3px] border-amber-200/40" />
          <div className="absolute bottom-[26%] right-[31%] h-[58%] w-[16%] rounded-t-full border-[3px] border-amber-200/40" />
          <div className="absolute bottom-[26%] right-[10%] h-[52%] w-[16%] rounded-t-full border-[3px] border-amber-200/40" />
          {/* stage glow + orchestra */}
          <div
            className="absolute bottom-[24%] left-1/2 h-[16%] w-[70%] -translate-x-1/2 rounded-[50%] bg-amber-200/30 blur-md"
          />
          <div className="absolute inset-x-0 bottom-0 h-[26%] bg-black/70">
            <DotTexture />
          </div>
        </div>
      );
    case "pioneers":
      return (
        <BrandedScene
          background="radial-gradient(120% 130% at 85% 0%, #a11a2e 0%, #5c0f1c 45%, #16090d 100%)"
          mark="CIT"
          label="STUDENT PIONEERS"
        />
      );
    case "ctf":
      return (
        <div className="absolute inset-0" style={{ background: "radial-gradient(120% 120% at 15% 100%, #5c0f1c 0%, #101828 55%, #05070d 100%)" }}>
          <DotTexture color="rgba(74,222,128,0.25)" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
            <span className="rounded-lg border border-green-400/50 bg-green-400/10 px-3 py-1 text-sm font-bold tracking-widest text-green-300">
              CTF
            </span>
            <span className="text-[10px] font-semibold tracking-[0.28em] text-green-400/80">
              CYBER DEFENSE LAB
            </span>
          </div>
        </div>
      );
    case "energy":
      return (
        <BrandedScene
          background="radial-gradient(120% 130% at 85% 100%, #e0651f 0%, #8f1d12 45%, #1c0a0c 100%)"
          mark="EE"
          label="ELECTRICAL ENGINEERING"
          glow="rgba(255,180,84,0.35)"
        />
      );
    default:
      return (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, #5c0f1c 0%, #8B1A1A 45%, #2b2f3a 100%)",
          }}
        >
          <DotTexture />
        </div>
      );
  }
}

function BrandedScene({
  background,
  mark,
  label,
  glow = "rgba(255,255,255,0.10)",
}: {
  background: string;
  mark: string;
  label: string;
  glow?: string;
}) {
  return (
    <div className="absolute inset-0" style={{ background }}>
      <div
        className="absolute -right-10 -top-14 h-44 w-44 rounded-full"
        style={{ background: glow }}
      />
      <div
        className="absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-black/30"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <span className="rounded-xl border border-white/30 bg-white/10 px-3.5 py-1.5 text-sm font-bold tracking-wider text-white backdrop-blur-[1px]">
          {mark}
        </span>
        <span className="px-4 text-center text-[10px] font-bold tracking-[0.22em] text-white/85">
          {label}
        </span>
      </div>
    </div>
  );
}
