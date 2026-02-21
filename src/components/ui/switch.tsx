"use client"

import * as SwitchPrimitive from "@radix-ui/react-switch"

import * as React from "react"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-[3px] border-black bg-white shadow-[3px_3px_0px_#000000] transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#FFE951] data-[state=unchecked]:bg-white",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-black border-[2px] border-black ring-0 transition-transform data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-1",
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
