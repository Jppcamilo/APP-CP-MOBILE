import Svg, { Line, Polyline } from "react-native-svg";
import { colors } from "../styles/theme";

export function BalanceChart({ values }: { values: number[] }) {
  const data = values.length > 1 ? values : [0, 0];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  const points = data
    .map((value, index) => {
      const x = 8 + (index / (data.length - 1)) * 164;
      const y = range === 0 ? 43 : 73 - ((value - min) / range) * 60;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Svg
      width="100%"
      height={85}
      viewBox="0 0 180 85"
      accessibilityLabel="Evolução do saldo após os últimos lançamentos"
    >
      <Line
        x1="8"
        y1="79"
        x2="174"
        y2="79"
        stroke={colors.border}
        strokeWidth="2"
      />

      <Polyline
        points={points}
        fill="none"
        stroke={colors.purple}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}