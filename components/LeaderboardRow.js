import { LazyLoadImage } from "react-lazy-load-image-component";
import { useEnsName } from "wagmi";
import useTimeSince from "../hooks/useTimeSince";
import dayjs from "dayjs";
import { useInView } from "react-intersection-observer";

function truncateAddress(address, shrinkInidicator) {
  return address.slice(0, 4) + (shrinkInidicator || "…") + address.slice(-4);
}

const short = dayjs().subtract(1, "month").unix();
const medium = dayjs().subtract(3, "month").unix();
const long = dayjs().subtract(6, "month").unix();

const LeaderboardRow = function ({ data, rank }) {
  const { ref, inView } = useInView();
  const { data: ensName } = useEnsName({
    address: data.address,
    cacheTime: 60 * 60000,
    enabled: inView,
  });
  const timeSinceLastBurn = useTimeSince(data.latestBurn.timestamp);
  const cellStyle = {
    display: "table-cell",
    paddingLeft: 5,
  };

  let textColor = "#fff";
  if (data.latestBurn.timestamp <= long) {
    textColor = "#565656";
  } else if (data.latestBurn.timestamp <= medium) {
    textColor = "#B1B1B1";
  } else if (data.latestBurn.timestamp <= short) {
    textColor = "#FFF";
  }

  return (
    <div
      style={{
        display: "table-row",
        fontSize: "1.2em",
        color: textColor,
      }}
      ref={ref}
    >
      <div style={{ ...cellStyle, paddingBottom: 20 }}>#{rank}</div>
      <h2 style={{ ...cellStyle, fontSize: "1.2em" }}>
        <a
          href={`https://forgotten.market/address/${data.address}`}
          target="_blank"
          rel="noreferrer"
        >
          {ensName ? ensName : truncateAddress(data.address)}
        </a>
      </h2>
      <div style={cellStyle}>{data.burnCount}</div>
      <div style={{ ...cellStyle, whiteSpace: "nowrap" }}>
        <a
          href={`https://etherscan.io/tx/${data.latestBurn.txHash}`}
          target="_blank"
          rel="noreferrer"
        >
          {timeSinceLastBurn}
        </a>
      </div>
    </div>
  );
};

export default LeaderboardRow;
