import React, { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import OwnerRow from "../components/OwnerRow";
import SiteHead from "../components/SiteHead";

function MainView({ data }) {
  if (!data || !data.owners) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        alignItems: "center",
      }}
    >
      {data.owners.map((tokens, index) => (
        <OwnerRow key={index} tokens={tokens} />
      ))}
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ownersResponse = await fetch("/api/shame-data");
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
        <SiteHead title={'Flame Shame'}/>
          <h1>Forgotten Runes Wizard&apos;s Cult Flame Shame</h1>
          <h3>Burn the wizards!</h3>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "1.5vh",
              maxWidth: "60vw",
              alignSelf: "center",
              flexWrap: "wrap",
            }}
          ></div>
          <div
            style={{
              height: "100vh",
              width: "95vw",
              overflow: "scroll",
              overflowX: "hidden",
              alignSelf: "center",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              borderRadius: "1em",
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
