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

export interface ComboboxOption {
  value: number
  label: string
}

interface GenericComboboxProps {
  value: number
  onChange: (value: number) => void
  options: ComboboxOption[]
  emptyMessage?: string
  accentColor: string
}

export default function GenericCombobox({
  value,
  onChange,
  options,
  emptyMessage = "Aucune option trouvée.",
  accentColor,
}: GenericComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full p-4 neo-border font-bold text-lg cursor-pointer text-black justify-between uppercase shadow-[4px_4px_0px_#000000]",
            `bg-[${accentColor}] hover:bg-[${accentColor}]`
          )}
          style={{ backgroundColor: accentColor }}
        >
          {options.find((option) => option.value === value)?.label || "Sélectionner..."}
          <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] border-0 p-0">
        <Command className="neo-border bg-white">
          <CommandList className="p-1">
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value.toString()}
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className="font-bold cursor-pointer transition"
                  style={{
                    ["--hover-color" as string]: accentColor,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accentColor}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {option.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-5 w-5",
                      value === option.value ? "opacity-100" : "opacity-0",
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
