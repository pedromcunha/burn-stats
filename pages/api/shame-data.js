import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const RESERVOIR_KEY = process.env.NEXT_PUBLIC_RESERVOIR_API_KEY;

export default async function handler(req, res) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const flameContract = "0x31158181b4b91a423bfdc758fc3bf8735711f9c5";
    const wizardContract = "0x521f9c7505005cfa19a8e5786a9c3c9c9f5e6f42";
    let owners = [];
    let ownerTokens = [];

    //Read file from bucket
    const bucketReadResponse = await supabase.storage
      .from("wizard-flame-owners")
      .download("owners");

    if (!bucketReadResponse.error && bucketReadResponse.data.text) {
      const text = await bucketReadResponse.data.text();
      const ownersJson = JSON.parse(text);

      //Check if data is fresh
      if (ownersJson && ownersJson.lastUpdated < new Date().getTime() - 3600) {
        res.status(200).json(ownersJson);
        console.log("Data is still fresh");
        return;
      }
    }

    //Find all owners that own a wizard and a flame
    const ownersResponse = await fetch(
      `https://api.reservoir.tools/owners/cross-collections/v1?collections=${wizardContract}&collections=${flameContract}&limit=50`,
      {
        "x-api-key": RESERVOIR_KEY,
      }
    );

    const data = await ownersResponse.json();

    if (data && data.owners) {
      owners = data.owners.reduce((owners, owner) => {
        if (owner.collections.length >= 2) {
          owners.push(owner.address);
        }
        return owners;
      }, []);
    }

    //For each of these owners grab the wizard tokens:
    if (owners) {
      const tokenPromises = owners.map((owner) =>
        fetch(
          `https://api.reservoir.tools/users/${owner}/tokens/v5?collection=${wizardContract}&sortBy=acquiredAt&sortDirection=desc&offset=0&limit=100`,
          {
            "x-api-key": RESERVOIR_KEY,
          }
        )
      );
      const promises = await Promise.allSettled(tokenPromises);
      const responses = await Promise.all(
        promises
          .filter((promise) => promise.status === "fulfilled" && promise.value)
          .map((promise) => promise.value.json())
      );
      const testing = responses.forEach((tokensData, i) => {
        ownerTokens.push(
          tokensData.tokens.map((tokenData) => {
            return {
              owner: owners[i],
              contract: tokenData.token.contract,
              tokenId: tokenData.token.tokenId,
              name: tokenData.token.name,
              image: tokenData.token.image,
            };
          })
        );
      });
    }

    const shameData = {
      owners: ownerTokens.sort((a, b) => {
        return b.length - a.length;
      }),
      lastUpdated: new Date().getTime(),
    };

    const uploadResponse = await supabase.storage
      .from("wizard-flame-owners")
      .update("owners", JSON.stringify(shameData));

    res.status(200).json(shameData);
    if (uploadResponse.error) {
      console.log(`Data upload error: ${uploadResponse.error}`);
    } else {
      console.log("Uploaded data successfully");
    }
  } catch (e) {
    res.status(400).json({
      error: e.message ? e.message : "Error",
    });
  }
}
