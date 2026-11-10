"use client";

import { Select } from "@/components/ui/select";

interface ListingSortSelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { label: string; value: T }[];
}

export default function ListingSortSelect<T extends string>({
  value,
  onChange,
  options,
}: ListingSortSelectProps<T>) {
  return (
    <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
      Sort by:
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </label>
  );
}
