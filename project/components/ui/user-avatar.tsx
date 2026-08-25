"use client";

import { cn } from "@/lib/utils";
import { User as UserIcon } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

export type AvatarSize = "xs" | "sm" | "md" | "base" | "lg" | "xl" | "2xl" | "3xl";
export type AvatarShape = "circle" | "rounded" | "rounded-lg" | "rounded-xl" | "rounded-2xl";

export interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string | null;
  initials?: string | null;
  size?: AvatarSize;
  shape?: AvatarShape;
  fallbackBg?: string;
  alt?: string;
  unoptimized?: boolean;
}

const SIZE_MAP: Record<AvatarSize, { container: string; iconSize: number; pixelSize: number }> = {
  xs: {
    container: "w-5 h-5 min-w-[20px] min-h-[20px] max-w-[20px] max-h-[20px] text-[8px]",
    iconSize: 10,
    pixelSize: 20,
  },
  sm: {
    container: "w-7 h-7 min-w-[28px] min-h-[28px] max-w-[28px] max-h-[28px] text-[10px]",
    iconSize: 13,
    pixelSize: 28,
  },
  md: {
    container: "w-9 h-9 min-w-[36px] min-h-[36px] max-w-[36px] max-h-[36px] text-xs",
    iconSize: 16,
    pixelSize: 36,
  },
  base: {
    container: "w-10 h-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] text-xs",
    iconSize: 18,
    pixelSize: 40,
  },
  lg: {
    container: "w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] text-base",
    iconSize: 22,
    pixelSize: 56,
  },
  xl: {
    container: "w-16 h-16 min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px] text-lg",
    iconSize: 26,
    pixelSize: 64,
  },
  "2xl": {
    container: "w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] text-xl",
    iconSize: 32,
    pixelSize: 80,
  },
  "3xl": {
    container: "w-24 h-24 min-w-[96px] min-h-[96px] max-w-[96px] max-h-[96px] text-2xl",
    iconSize: 38,
    pixelSize: 96,
  },
};

const SHAPE_MAP: Record<AvatarShape, string> = {
  circle: "rounded-full",
  rounded: "rounded-lg",
  "rounded-lg": "rounded-lg",
  "rounded-xl": "rounded-xl",
  "rounded-2xl": "rounded-2xl",
};

export function extractInitials(name?: string | null): string {
  if (!name || typeof name !== "string") return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  (
    {
      src,
      name,
      initials: explicitInitials,
      size = "md",
      shape = "circle",
      fallbackBg = "bg-gradient-to-tr from-[#0f2d5a] via-[#1a3a6b] to-[#0052cc]",
      alt,
      unoptimized = true,
      className,
      ...props
    },
    ref,
  ) => {
    const [imageError, setImageError] = useState(false);

    // Reset error when src changes
    React.useEffect(() => {
      setImageError(false);
    }, [src]);

    const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
    const shapeClass = SHAPE_MAP[shape] || SHAPE_MAP.circle;

    const displayInitials = explicitInitials || extractInitials(name);
    const hasValidImage = Boolean(src && src.trim().length > 0 && !imageError);

    return (
      <div
        ref={ref}
        className={cn(
          "relative shrink-0 overflow-hidden select-none flex items-center justify-center aspect-square",
          sizeConfig.container,
          shapeClass,
          className,
        )}
        {...props}
      >
        {hasValidImage ? (
          <Image
            src={src!}
            alt={alt || name || "Avatar"}
            width={sizeConfig.pixelSize}
            height={sizeConfig.pixelSize}
            unoptimized={unoptimized}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover block shrink-0"
          />
        ) : (
          <div
            className={cn(
              "w-full h-full flex items-center justify-center font-bold text-white shrink-0",
              fallbackBg,
            )}
          >
            {displayInitials ? (
              <span className="leading-none tracking-tight">{displayInitials}</span>
            ) : (
              <UserIcon size={sizeConfig.iconSize} className="stroke-[2.5]" />
            )}
          </div>
        )}
      </div>
    );
  },
);

UserAvatar.displayName = "UserAvatar";
