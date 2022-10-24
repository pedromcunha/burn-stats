import Head from "next/head";
import React from "react";

export default function SiteHead({name}) {
  let image = "https://burnlog.vercel.app/new-tulip.png";

  return (
    <Head>
      <title>{name}</title>
      <link rel="icon" href="/favicon.ico" />

      <meta property="og:title" content={name} key="ogtitle" />
      <meta name="twitter:title" content={name} key="twittertitle" />
      <meta name="twitter:card" content="summary_large_image" key="twcard" />

      <meta name="twitter:image" content={image} key="twimage"/>
      <meta property="og:image" content={image} key="ogimage"/>
    </Head>
  )
}
