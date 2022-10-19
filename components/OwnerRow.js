import { LazyLoadImage } from "react-lazy-load-image-component";
import { useEnsName } from "wagmi";

function truncateAddress(address, shrinkInidicator) {
  return address.slice(0, 4) + (shrinkInidicator || "…") + address.slice(-4);
}

const OwnerRow = function ({ tokens }) {
  const { data: ensName } = useEnsName({
    address: tokens.owner,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "2vh",
        justifyItems: "start",
      }}
    >
      <h2>
        <a
          href={`https://forgotten.market/address/${tokens.owner}`}
          target="_blank"
          rel="noreferrer"
        >
          {ensName ? ensName : truncateAddress(tokens.owner)} |{" "}
          {tokens.flameCount} {tokens.flameCount == 1 ? "flame" : "flames"}
        </a>
      </h2>
      <div
        style={{
          display: "flex",
          overflowY: "auto",
          gap: 10,
          maxWidth: "95vw",
        }}
      >
        {tokens.tokens.map((token, index) => {
          return (
            <a
              key={index}
              href={
                "https://forgotten.market/0x521f9c7505005cfa19a8e5786a9c3c9c9f5e6f42/" +
                token.tokenId
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                style={{
                  width: 200,
                  height: 300,
                  position: "relative",
                }}
              >
                <LazyLoadImage
                  src={`https://runes-turnarounds.s3.amazonaws.com/${token.tokenId}/${token.tokenId}.png`}
                  style={{
                    width: "100%",
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingTop: 10,
                  }}
                />
                <h3 style={{ fontSize: 20, padding: 20 }}>{token.name}</h3>
                <div
                  style={{
                    borderImageSource: "url(/newframe_black.png)",
                    borderImageSlice: "30 35",
                    borderImageWidth: 24,
                    borderImageOutset: 0,
                    borderStyle: "solid",
                    borderImageRepeat: "round",
                    imageRendering: "pixelated",
                    height: "100%",
                    position: "absolute",
                    inset: 0,
                  }}
                ></div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default OwnerRow;
