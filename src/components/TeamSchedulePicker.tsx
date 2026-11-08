import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useAppData } from "../context/appDataContext";
import { useEspnData } from "../context/espnDataContext";
import { copy } from "../copy";

type TeamSchedulePickerProps = Record<string, never>;

export const TeamSchedulePicker = ({}: TeamSchedulePickerProps) => {
  const { division } = useAppData();
  const {
    schedule: {
      conferences,
      conference,
      setConferenceId,
      selectedTeam,
      selectTeam,
    },
  } = useEspnData();
  const groupLabel =
    division === "nfl" ? copy.league.division : copy.league.conference;
  const teams = conference?.rows ?? [];
  const teamId = teams.some((team) => team.id === selectedTeam?.id)
    ? (selectedTeam?.id ?? "")
    : "";

  const conferenceOptions = conferences.map((table) => (
    <option key={table.id} value={table.id}>
      {table.title}
    </option>
  ));
  const teamOptions = [...teams]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((team) => (
      <option key={team.id} value={team.id}>
        {team.name}
      </option>
    ));

  return (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <TextField
        select
        fullWidth
        label={groupLabel}
        value={conference?.id ?? ""}
        disabled={conferences.length === 0}
        onChange={(e) => setConferenceId(e.target.value)}
        slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
      >
        <option value="" disabled>
          Select a {groupLabel.toLowerCase()}
        </option>
        {conferenceOptions}
      </TextField>
      <TextField
        select
        fullWidth
        label={copy.schedule.team}
        value={teamId}
        disabled={teams.length === 0}
        onChange={(e) => {
          const team = teams.find((row) => row.id === e.target.value);
          if (team) {
            selectTeam(team);
            setConferenceId(conference?.id ?? "");
          }
        }}
        slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
      >
        <option value="" disabled>
          {copy.schedule.selectTeam}
        </option>
        {teamOptions}
      </TextField>
    </Stack>
  );
};
