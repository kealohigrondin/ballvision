import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import { useEspnData } from "../context/espnDataContext";
import { copy } from "../copy";

type TeamSchedulePickerProps = Record<string, never>;

// Searchable team field that picks whose schedule the panel shows.
export const TeamSchedulePicker = ({}: TeamSchedulePickerProps) => {
  const {
    schedule: { teams, selectedTeam, selectTeam },
  } = useEspnData();
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
