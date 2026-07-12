"use client";

import { Label } from "@/components/ui/label";

export type TeamOption = {
  id: string;
  name: string;
};

type TeamSelectProps = {
  teams: TeamOption[];
  value: string;
  onChange: (teamId: string) => void;
  id?: string;
  disabled?: boolean;
  error?: string;
};

export function TeamSelect({
  teams,
  value,
  onChange,
  id = "team_id",
  disabled = false,
  error,
}: TeamSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Team</Label>
      <select
        id={id}
        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        value={value}
        disabled={disabled || teams.length === 0}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      >
        {teams.length === 0 ? (
          <option value="">No teams available</option>
        ) : (
          teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))
        )}
      </select>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
