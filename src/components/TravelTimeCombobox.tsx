"use client"

import GenericCombobox, { ComboboxOption } from "./GenericCombobox"

const travelTimes: ComboboxOption[] = [
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
  return (
    <GenericCombobox
      value={value}
      onChange={onChange}
      options={travelTimes}
      emptyMessage="Aucun temps trouvé."
      accentColor="#FFE951"
    />
  )
}
