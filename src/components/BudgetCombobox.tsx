"use client"

import GenericCombobox, { ComboboxOption } from "./GenericCombobox"
import { useLanguage } from '@/i18n/LanguageContext'

interface BudgetComboboxProps {
  value: number
  onChange: (value: number) => void
}

export default function BudgetCombobox({ value, onChange }: BudgetComboboxProps) {
  const { t } = useLanguage()

  const budgets: ComboboxOption[] = [
    { value: 15, label: t('budget.15') },
    { value: 20, label: t('budget.20') },
    { value: 30, label: t('budget.30') },
    { value: 40, label: t('budget.40') },
    { value: 999, label: t('budget.40plus') },
  ]

  return (
    <GenericCombobox
      value={value}
      onChange={onChange}
      options={budgets}
      emptyMessage={t('budget.empty')}
      accentColor="#4ECDC4"
    />
  )
}
