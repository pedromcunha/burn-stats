import React, { useEffect, useState } from "react";
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';

const testData = require("../data/testData.json");
const wizardsBurned = 300;
const undesirables = 10;
const ultraRares = 10;

function AccordionForTrait(trait_type, traitData) {
  return (
    <div style={{"maxHeight":"50vh", "width": "80vw", "overflow": "hidden", "alignSelf": "center", "borderRadius": "1em", "margin": "2em"}}>
    <h2 style={{"fontSize": "1.5vh"}}>{trait_type.trait_type}</h2>
    <div style={{"maxHeight":"40vh", "maxWidth": "80vw", "overflow": "scroll", "alignSelf": "center", "borderRadius": "1em"}}>
    <Accordion>
        {
          trait_type.traitData.map((trait, index) => {
            if (trait.type == trait_type.trait_type && trait.name) {
              return (
                <AccordionItem>
                  <AccordionItemHeading>
                      <AccordionItemButton>
                          {trait.name} ({trait.diff} burned)
                      </AccordionItemButton>
                  </AccordionItemHeading>
                  <AccordionItemPanel>
                      <div style={{"display": "flex", "width": "100%", "flex-wrap": "wrap"}}>
                        {trait.wizards.map((wizId, index) => {
                          return (
                            <div>
                              <a href={"https://opensea.io/assets/0x251b5f14a825c537ff788604ea1b58e49b70726f/" + wizId} target="_blank">
                                <img src={"https://portal.forgottenrunes.com/api/souls/img/" + wizId} style={{"width": "7em"}}/>
                              </a>
                            </div>)
                        })}
                      </div>
                  </AccordionItemPanel>
                </AccordionItem>
              );
          }
        })
        }
      </Accordion>
    </div>
    </div>
  )
}

export default function Home() {
  const [data, setData] = useState("");

  useEffect(() => {
    async function getData() {
      try {
        const asyncResponse = await fetch("https://aqueous-eyrie-64590.herokuapp.com/api/get");
        const json = await asyncResponse.json();
        setData(json);
      } catch (err) {
        console.error(err);
      }
    }
    getData();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Burn Log</title>
        <meta name="description" content="Forgotten Runes Wizard's Cult Burn Log" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>Forgotten Runes Wizard's Cult Burn Log</h1>
      <h3>{data.burned} wizards burned | {1112 - data.burned} flames remain</h3>
      <img src="/tulip.gif" style={{"height": "5vh", "width": "5vh", "alignSelf": "center", "marginTop": "2vh"}}/>
      
      <div style={{"height":"100vh", "width": "90vw", "overflow": "scroll", "alignSelf": "center", "display": "flex", "flexDirection": "row", "flexWrap": "wrap", "justifyContent": "center", "margin": "1em", "borderRadius": "1em"}}>
        <AccordionForTrait trait_type="head" traitData={data.traits ? data.traits : []}/>
        <AccordionForTrait trait_type="body" traitData={data.traits ? data.traits : []}/>
        <AccordionForTrait trait_type="prop" traitData={data.traits ? data.traits : []}/>
        <AccordionForTrait trait_type="familiar" traitData={data.traits ? data.traits : []}/>
        <AccordionForTrait trait_type="rune" traitData={data.traits ? data.traits : []}/>
        <AccordionForTrait trait_type="background" traitData={data.traits ? data.traits : []}/>
      </div>

      <footer className={styles.footer}>
        <a
          href="https://twitter.com/tv3636"
          target="_blank"
          rel="noopener noreferrer"
        >
          by tv
        </a>
      </footer>
    </div>
  )
}
