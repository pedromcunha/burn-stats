import React, { useEffect, useState } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import LeaderboardRow from "../components/LeaderboardRow";

function MainView({ data }) {
  if (!data || !data.leaderboard) {
    return null;
  }

  const tableHeaders = ["Rank", "Address", "Flames Burned", "Last Burn"];

  return (
    <div
      style={{
        display: "table",
        width: "100vw",
        marginTop: 40,
      }}
    >
      <div style={{ display: "table-header-group" }}>
        {tableHeaders.map((header, i) => {
          return (
            <div
              key={i}
              style={{
                display: "table-cell",
                paddingBottom: 20,
                whiteSpace: "nowrap",
                padding: 5,
              }}
            >
              {header}
            </div>
          );
        })}
      </div>
      {data.leaderboard.map((data, index) => (
        <LeaderboardRow key={index} data={data} rank={index + 1} />
      ))}
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ownersResponse = await fetch("/api/leaderboard-data");
        const json = await ownersResponse.json();
        setData(json);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {!data ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <img
            alt="Tulip"
            src="/tulip.gif"
            style={{ height: "10vh", width: "10vh" }}
          />
        </div>
      ) : (
        <div className={styles.container}>
          <Head>
            <title>Burn Board</title>
            <meta
              name="description"
              content="Forgotten Runes Wizard's Cult Burn Board"
            />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <h1>Forgotten Runes Wizard&apos;s Cult Burn Board</h1>
          <h3>Does your flame burn the brightest?</h3>
          <div
            style={{
              height: "100vh",
              width: "95vw",
              overflow: "scroll",
              alignSelf: "center",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              maxWidth: 800,
            }}
          >
            <MainView data={data} />
          </div>
        </div>
      )}
      <footer
        style={{
          backgroundColor: "black",
          color: "white",
          fontFamily: "Alagard",
          margin: "10px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <a
          href="https://twitter.com/thecodingadvent"
          target="_blank"
          rel="noopener noreferrer"
          style={{ margin: "10px" }}
        >
          by pedromcunha
        </a>
      </footer>
    </div>
  );
}
