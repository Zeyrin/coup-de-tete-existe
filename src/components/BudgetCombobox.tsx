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

const budgets = [
  { value: 15, label: "€15" },
  { value: 20, label: "€20" },
  { value: 30, label: "€30" },
  { value: 40, label: "€40" },
]

interface BudgetComboboxProps {
  value: number
  onChange: (value: number) => void
}

export default function BudgetCombobox({ value, onChange }: BudgetComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          role="combobox"
          aria-expanded={open}
          className="w-full p-4 neo-border bg-[#4ECDC4] font-bold text-lg cursor-pointer hover:bg-[#4ECDC4] text-black justify-between uppercase shadow-[4px_4px_0px_#000000]"
        >
          {budgets.find((budget) => budget.value === value)?.label || "Sélectionner..."}
          <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] border-0 p-0">
        <Command className="neo-border bg-white">
          <CommandList className="p-1">
            <CommandEmpty>Aucun budget trouvé.</CommandEmpty>
            <CommandGroup>
              {budgets.map((budget) => (
                <CommandItem
                  key={budget.value}
                  value={budget.value.toString()}
                  onSelect={() => {
                    onChange(budget.value)
                    setOpen(false)
                  }}
                  className="font-bold cursor-pointer hover:bg-[#4ECDC4] transition"
                >
                  {budget.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-5 w-5",
                      value === budget.value ? "opacity-100" : "opacity-0",
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
