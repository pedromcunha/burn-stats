import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const RESERVOIR_KEY = process.env.NEXT_PUBLIC_RESERVOIR_API_KEY;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default async function handler(req, res) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const flameContract = "0x31158181b4b91a423bfdc758fc3bf8735711f9c5";
    const wizardContract = "0x521f9c7505005cfa19a8e5786a9c3c9c9f5e6f42";
    const collectionSetId =
      "b06af617550494133e4d774f150f3dd873c0fb95b5fa151180418edf405e6de4";
    let flameOwners = {};
    let ownerTokens = [];

    //Read file from bucket
    const bucketReadResponse = await supabase.storage
      .from("wizard-flame-owners")
      .download("owners");

    if (!bucketReadResponse.error && bucketReadResponse.data.text) {
      const text = await bucketReadResponse.data.text();
      const ownersJson = JSON.parse(text);

      //Check if data is fresh
      if (
        ownersJson &&
        new Date().getTime() - ownersJson.lastUpdated < 20 * 60 * 1000
      ) {
        console.log("Data is still fresh");
        res.status(200).json({
          message: "Data is still fresh",
        });
        return;
      }
    }

    //Find all owners that own a wizard and a flame
    const ownersResponse = await fetch(
      `https://api.reservoir.tools/owners/v1?collection=${flameContract}&offset=0&limit=500`,
      {
        headers: {
          "x-api-key": RESERVOIR_KEY,
        },
      }
    );

    const data = await ownersResponse.json();

    if (data && data.owners) {
      flameOwners = data.owners.reduce((owners, owner) => {
        owners[owner.address] = owner.ownership.tokenCount;
        return owners;
      }, {});
    }

    const flameOwnerKeys = Object.keys(flameOwners);

    const tokenPromises = flameOwnerKeys.map((address) =>
      fetch(
        `https://api.reservoir.tools/users/${address}/tokens/v5?collection=${wizardContract}&offset=0&limit=100`,
        {
          headers: {
            "x-api-key": RESERVOIR_KEY,
          },
        }
      )
    );
    const promises = await Promise.allSettled(tokenPromises);
    const responses = await Promise.all(
      promises
        .filter((promise) => promise.status === "fulfilled" && promise.value)
        .map((promise) => promise.value.json())
    );
    responses.forEach((tokensData, i) => {
      if (tokensData && tokensData.tokens && tokensData.tokens.length > 0) {
        const address = flameOwnerKeys[i];
        const owner = {
          owner: address,
          tokens: [],
          flameCount: flameOwners[address],
        };

        tokensData.tokens.forEach((tokenData) => {
          owner.tokens.push({
            owner: flameOwners[i],
            contract: tokenData.token.contract,
            tokenId: tokenData.token.tokenId,
            name: tokenData.token.name,
            image: tokenData.token.image,
          });
        });
        ownerTokens.push(owner);
      }
    });

    const shameData = {
      owners: ownerTokens.sort((a, b) => b.flameCount - a.flameCount),
      lastUpdated: new Date().getTime(),
    };

    const uploadResponse = await supabase.storage
      .from("wizard-flame-owners")
      .update("owners", JSON.stringify(shameData));

    if (uploadResponse.error) {
      console.log(`Data upload error: ${uploadResponse.error}`);
      throw uploadResponse.error.message;
    } else {
      console.log("Uploaded data successfully");
      res.status(200).json({
        message: "success",
      });
    }
  } catch (e) {
    res.status(400).json({
      error: e.message ? e.message : "Error",
    });
  }
}
