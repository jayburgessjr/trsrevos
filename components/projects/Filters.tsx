"use client";

import { useState } from "react";

export type Filters = {
  q: string;
  stages: string[];
  health: string[];
  ownerId: string | null;
};

export function useProjectsFilters() {
  const [filters, setFilters] = useState<Filters>({
    q: "",
    stages: [],
    health: [],
    ownerId: null,
  });

  return { filters, setFilters };
}

export function FiltersBar({
  stagesAvailable,
  healthAvailable,
  owners,
  value,
  onChange,
  showSearch = true,
}: {
  stagesAvailable: string[];
  healthAvailable: string[];
  owners: { id: string; label: string }[];
  value: Filters;
  onChange: (filters: Filters) => void;
  showSearch?: boolean;
}) {
  const update = (patch: Partial<Filters>) => {
    onChange({ ...value, ...patch });
  };

  const toggle = (key: "stages" | "health", option: string) => {
    const existing = new Set(value[key]);
    if (existing.has(option)) {
      existing.delete(option);
    } else {
      existing.add(option);
    }
    onChange({ ...value, [key]: Array.from(existing) });
  };

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      {showSearch && (
        <input
          className="h-9 w-full rounded-md border border-gray-300 px-2 text-sm md:w-64"
          placeholder="Search client or next step"
          value={value.q}
          onChange={(event) => update({ q: event.target.value })}
        />
      )}
      <div className="flex flex-wrap gap-2">
        <select
          className="h-9 rounded-md border border-gray-300 px-2 text-sm"
          value={value.ownerId ?? ""}
          onChange={(event) => update({ ownerId: event.target.value || null })}
          disabled={!owners.length}
        >
          <option value="">All owners</option>
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.label}
            </option>
          ))}
        </select>
        {stagesAvailable.length > 0 && (
          <MultiSelectChips
            label="Stage"
            values={stagesAvailable}
            active={value.stages}
            onToggle={(option) => toggle("stages", option)}
          />
        )}
        {healthAvailable.length > 0 && (
          <MultiSelectChips
            label="Health"
            values={healthAvailable}
            active={value.health}
            onToggle={(option) => toggle("health", option)}
          />
        )}
      </div>
    </div>
  );
}

type MultiSelectChipsProps = {
  label: string;
  values: string[];
  active: string[];
  onToggle: (value: string) => void;
};

function MultiSelectChips({ label, values, active, onToggle }: MultiSelectChipsProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500">{label}:</span>
      {values.map((value) => {
        const isActive = active.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => onToggle(value)}
            className={`h-7 rounded-md border px-2 text-xs ${
              isActive
                ? "border-black bg-black text-white"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
