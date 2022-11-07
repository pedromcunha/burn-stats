import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const RESERVOIR_KEY = process.env.NEXT_PUBLIC_RESERVOIR_API_KEY;

export default async function handler(req, res) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const treatBoxContract = "0x59775fD5F266C216D7566eB216153aB8863C9c84";
    let treatBoxBurners = {};
    //Read file from bucket
    const bucketReadResponse = await supabase.storage
      .from("leaderboard")
      .download("treatBox");
    if (!bucketReadResponse.error && bucketReadResponse.data.text) {
      const text = await bucketReadResponse.data.text();
      const leaderboardJson = JSON.parse(text);
      // Check if data is fresh
      if (
        leaderboardJson &&
        new Date().getTime() - leaderboardJson.lastUpdated < 20 * 60 * 1000
      ) {
        console.log("Data is still fresh");
        res.status(200).json({
          message: "Data is still fresh",
        });
        return;
      }
    }
    const maximumRequests = 30;
    let continuation = "";
    for (let i = 0; i < maximumRequests; i++) {
      console.log("Requesting page ", i);
      let transfersResponse = await fetch(
        `https://api.reservoir.tools/transfers/bulk/v1?contract=${treatBoxContract}&limit=1000${continuation}`,
        {
          headers: {
            "x-api-key": RESERVOIR_KEY,
          },
        }
      );
      let data = await transfersResponse.json();
      if (data.transfers) {
        data.transfers.forEach((transfer) => {
          if (transfer.to === "0x0000000000000000000000000000000000000000") {
            const count = treatBoxBurners[transfer.from]
              ? treatBoxBurners[transfer.from]
              : 0;
            if (treatBoxBurners[transfer.from] !== undefined) {
              treatBoxBurners[transfer.from].burnCount =
                treatBoxBurners[transfer.from].burnCount +
                Number(transfer.amount);
              if (
                transfer.timestamp >
                treatBoxBurners[transfer.from].latestBurn.timestamp
              ) {
                treatBoxBurners[transfer.from].latestBurn = {
                  timestamp: transfer.timestamp,
                  txHash: transfer.txHash,
                };
              }
            } else {
              treatBoxBurners[transfer.from] = {
                address: transfer.from,
                burnCount: Number(transfer.amount),
                latestBurn: {
                  timestamp: transfer.timestamp,
                  txHash: transfer.txHash,
                },
              };
            }
          }
        });
      }
      if (!data.continuation) {
        console.log("Finished Requesting");
        break;
      } else {
        continuation = `&continuation=${data.continuation}`;
      }
    }
    const leaderboardData = {
      leaderboard: Object.values(treatBoxBurners).sort(
        (a, b) => b.burnCount - a.burnCount
      ),
      lastUpdated: new Date().getTime(),
    };
    const uploadResponse = await supabase.storage
      .from("leaderboard")
      .update("treatBox", JSON.stringify(leaderboardData));
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
