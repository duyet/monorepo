import { cn } from "@duyet/libs/utils";
import { useTheme } from "next-themes";
import { useState } from "react";
import { getOrgColor, getOrgInitials, getOrgLogoUrl } from "@/lib/org-logos";

interface OrgAvatarProps {
  org: string;
  size?: "sm" | "md";
}

export function OrgAvatar({ org, size = "sm" }: OrgAvatarProps) {
  const [logoError, setLogoError] = useState(false);
  const { resolvedTheme } = useTheme();
  const darkMode = resolvedTheme === "dark";

  const logoUrl = getOrgLogoUrl(org, darkMode);
  const initials = getOrgInitials(org);
  const colorClass = getOrgColor(org);
  const sizeClass = size === "sm" ? "h-6 w-6 text-[9px]" : "h-8 w-8 text-xs";
  const px = size === "sm" ? 24 : 32;

  if (logoUrl && !logoError) {
    return (
      <img
        src={logoUrl}
        alt={`${org} logo`}
        width={px}
        height={px}
        className={cn("rounded-md object-contain", sizeClass)}
        onError={() => setLogoError(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md font-semibold",
        sizeClass,
        colorClass
      )}
      title={org}
    >
      {initials}
    </div>
  );
}
