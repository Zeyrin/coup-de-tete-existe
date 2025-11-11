"use client"

import { CheckIcon, ChevronsUpDown } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const travelTimes = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 heure" },
  { value: 90, label: "1h30" },
  { value: 120, label: "2 heures" },
]

interface TravelTimeComboboxProps {
  value: number
  onChange: (value: number) => void
}

export default function TravelTimeCombobox({ value, onChange }: TravelTimeComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          role="combobox"
          aria-expanded={open}
          className="w-full p-4 neo-border bg-[#FFE951] font-bold text-lg cursor-pointer hover:bg-[#FFE951] text-black justify-between uppercase shadow-[4px_4px_0px_#000000]"
        >
          {travelTimes.find((time) => time.value === value)?.label || "Sélectionner..."}
          <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] border-0 p-0">
        <Command className="neo-border bg-white">
          <CommandList className="p-1">
            <CommandEmpty>Aucun temps trouvé.</CommandEmpty>
            <CommandGroup>
              {travelTimes.map((time) => (
                <CommandItem
                  key={time.value}
                  value={time.value.toString()}
                  onSelect={() => {
                    onChange(time.value)
                    setOpen(false)
                  }}
                  className="font-bold cursor-pointer hover:bg-[#FFE951] transition"
                >
                  {time.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-5 w-5",
                      value === time.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
