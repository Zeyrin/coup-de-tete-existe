"use client"

import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function BookingHelpPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="bg-[#FFE951] text-black neo-button w-14 font-bold text-xl uppercase">
          ?
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white neo-border p-0 rounded-md overflow-hidden" align="end">
        <div className="bg-[#FFE951] neo-border p-4 -m-[3px] -mb-0 rounded-t-md">
          <h4 className="font-bold text-base uppercase text-center">📱 Comment réserver:</h4>
        </div>
        <div className="p-4">
          <ol className="space-y-3 text-sm font-bold">
            <li className="flex items-start gap-3">
              <div className="bg-[#FF6B6B] neo-border w-7 h-7 flex items-center justify-center text-sm flex-shrink-0 rounded-md">
                1
              </div>
              <span className="pt-0.5">Clique sur &ldquo;Réserver SNCF&rdquo;</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-[#4ECDC4] neo-border w-7 h-7 flex items-center justify-center text-sm flex-shrink-0 rounded-md">
                2
              </div>
              <span className="pt-0.5">Entre ta gare de départ</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-[#98D8C8] neo-border w-7 h-7 flex items-center justify-center text-sm flex-shrink-0 rounded-md">
                3
              </div>
              <span className="pt-0.5">Réserve ton billet!</span>
            </li>
          </ol>
        </div>
      </PopoverContent>
    </Popover>
  )
}
