"use client"

import GenericCombobox, { ComboboxOption } from "./GenericCombobox"

const budgets: ComboboxOption[] = [
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
  return (
    <GenericCombobox
      value={value}
      onChange={onChange}
      options={budgets}
      emptyMessage="Aucun budget trouvé."
      accentColor="#4ECDC4"
    />
  )
}
