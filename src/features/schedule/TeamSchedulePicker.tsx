import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import { copy } from "@/copy";
import { useAppData } from "@/shared/appData/appDataContext";
import type { TeamRef } from "@/shared/types";

type TeamSchedulePickerProps = { teams: readonly TeamRef[] };

// Searchable team field that picks whose schedule the panel shows.
export const TeamSchedulePicker = ({ teams }: TeamSchedulePickerProps) => {
  const { selectedTeam, selectTeam } = useAppData();
  const value = teams.find((team) => team.id === selectedTeam?.id) ?? null;

  return (
    <Autocomplete
      id="team-schedule-picker"
      fullWidth
      autoHighlight
      sx={{ mb: 2 }}
      options={teams}
      value={value}
      disabled={teams.length === 0}
      noOptionsText={copy.schedule.noTeams}
      getOptionLabel={(team) => team.name}
      isOptionEqualToValue={(option, team) => option.id === team.id}
      onChange={(_, team) => {
        if (team) {
          selectTeam(team);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={copy.schedule.team}
          placeholder={copy.schedule.selectTeam}
          slotProps={{
            ...params.slotProps,
            inputLabel: { ...params.slotProps.inputLabel, shrink: true },
          }}
        />
      )}
    />
  );
};
