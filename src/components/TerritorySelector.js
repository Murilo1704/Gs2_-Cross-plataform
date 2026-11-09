import ChipGroup from './ChipGroup';
import { TERRITORIES } from '../data/territories';
import { useApp } from '../state/AppContext';

/** Troca o territorio analisado (a escolha fica salva no aparelho). */
export default function TerritorySelector() {
  const { territory, setTerritory } = useApp();
  return (
    <ChipGroup
      accessibilityLabel="Escolha do território"
      value={territory.id}
      onChange={setTerritory}
      options={TERRITORIES.map((t) => ({
        value: t.id,
        label: t.shortName,
        icon: 'location-outline',
        accessibilityLabel: `Território ${t.name}`,
      }))}
    />
  );
}
