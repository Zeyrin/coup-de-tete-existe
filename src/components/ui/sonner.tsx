"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "neo-toast group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-black group-[.toaster]:shadow-[4px_4px_0px_#000000]",
          description: "group-[.toast]:text-black/70",
          actionButton: "group-[.toast]:bg-[#4ECDC4] group-[.toast]:text-black group-[.toast]:border-black group-[.toast]:border-2",
          cancelButton: "group-[.toast]:bg-white group-[.toast]:text-black group-[.toast]:border-black group-[.toast]:border-2",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#000000",
          "--normal-border": "#000000",
          "--border-radius": "0.375rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
