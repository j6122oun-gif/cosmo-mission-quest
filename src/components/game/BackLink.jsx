import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export default function BackLink({ to = "/", params, label = "ミッションコントロール" }) {
  return (
    <Link
      to={to}
      params={params}
      className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em] text-white/40 transition-colors hover:text-ion"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}