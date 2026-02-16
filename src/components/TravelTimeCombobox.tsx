"use client"

import GenericCombobox, { ComboboxOption } from "./GenericCombobox"
import { useLanguage } from '@/i18n/LanguageContext'

interface TravelTimeComboboxProps {
  value: number
  onChange: (value: number) => void
}

export default function TravelTimeCombobox({ value, onChange }: TravelTimeComboboxProps) {
  const { t } = useLanguage()

  const travelTimes: ComboboxOption[] = [
    { value: 30, label: t('travel.30min') },
    { value: 60, label: t('travel.1h') },
    { value: 90, label: t('travel.1h30') },
    { value: 120, label: t('travel.2h') },
    { value: 180, label: t('travel.3h') },
    { value: 999, label: t('travel.3hPlus') },
  ]

  return (
    <GenericCombobox
      value={value}
      onChange={onChange}
      options={travelTimes}
      emptyMessage={t('travel.empty')}
      accentColor="#FFE951"
    />
  )
}
