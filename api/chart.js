
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const input = String(req.query.s || "BBCA")
    .trim()
    .toUpperCase();

  const symbol = /^[A-Z]{4}$/.test(input)
    ? `${input}.JK`
    : input;

  const range = String(req.query.range || "1y");
  const interval = String(req.query.interval || "1d");

  const allowedRanges = [
    "1d", "5d", "1mo", "3mo", "6mo",
    "1y", "2y", "5y", "10y", "ytd", "max"
  ];

  if (!/^[A-Z0-9.^=-]{1,20}$/.test(symbol)) {
    return res.status(400).json({
      error: "Simbol saham tidak valid"
    });
  }

  if (!allowedRanges.includes(range)) {
    return res.status(400).json({
      error: "Periode tidak valid"
    });
  }

  if (!["1d", "1wk", "1mo"].includes(interval)) {
    return res.status(400).json({
      error: "Interval tidak valid"
    });
  }

  const url = new URL(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`
  );

  url.searchParams.set("range", range);
  url.searchParams.set("interval", interval);
  url.searchParams.set("events", "div,splits");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      return res.status(502).json({
        error: "Yahoo Finance gagal memberikan data",
        status: response.status,
        symbol
      });
    }

    const json = await response.json();
    const result = json?.chart?.result?.[0];

    if (!result) {
      return res.status(502).json({
        error: json?.chart?.error?.description ||
          "Data saham tidak ditemukan",
        symbol
      });
    }

    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const adjusted =
      result.indicators?.adjclose?.[0]?.adjclose || [];

    const data = timestamps.map((timestamp, i) => ({
      t: timestamp,
      d: new Date(timestamp * 1000)
        .toISOString()
        .slice(0, 10),
      o: quote.open?.[i] ?? null,
      h: quote.high?.[i] ?? null,
      l: quote.low?.[i] ?? null,
      c: quote.close?.[i] ?? null,
      adjclose: adjusted[i] ?? null,
      v: quote.volume?.[i] ?? null
    }));

    res.setHeader(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300"
    );

    return res.status(200).json({
      source: "Yahoo Finance",
      symbol,
      range,
      interval,
      currency: result.meta?.currency || null,
      regularMarketPrice:
        result.meta?.regularMarketPrice ?? null,
      regularMarketTime:
        result.meta?.regularMarketTime ?? null,
      fetchedAt: new Date().toISOString(),
      count: data.length,
      data
    });

  } catch (error) {
    return res.status(502).json({
      error: "Tidak dapat terhubung ke Yahoo Finance",
      detail: error.message
    });
  }
}
