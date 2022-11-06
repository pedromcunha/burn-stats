import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;

export default async function handler(req, res) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const query = req.query;
    let fileName = "flame";

    if (query.filter && query.filter === "treatBox") {
      fileName = "treatBox";
    }

    //Read file from bucket
    const bucketReadResponse = await supabase.storage
      .from("leaderboard")
      .download(fileName);

    if (!bucketReadResponse.error && bucketReadResponse.data.text) {
      const text = await bucketReadResponse.data.text();
      const leaderboardJson = JSON.parse(text);

      //Check if data is fresh
      if (leaderboardJson) {
        res.status(200).json(leaderboardJson);
      } else {
        res.status(400);
      }
    }
  } catch (e) {
    res.status(400).json({
      error: e.message ? e.message : "Error",
    });
  }
}
