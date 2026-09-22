// The only file on the site meant to be edited by hand.
// Everything the terminal prints comes from data.js, which site/build.py makes from the real program.
window.FIBO_CONFIG = {
  // The program's repository: every github link and the install command on the page point here.
  repoUrl: "https://github.com/0xkuch/Fibo",

  // The community token. The program does not know it exists; only this page does.
  token: {
    ticker: "$FIB",
    network: "robinhood chain",
    price: "—",
    contract: "",       // empty until launch: the page says so instead of inventing one
    swap: "",           // swap link
    explorer: "",       // explorer link
    pool: "",           // pool address: turns the made-up chart into the live GeckoTerminal one
    geckoNetwork: "robinhood",

    // The burn. At zero, every fee the token has earned buys the token back and that is sent to the burn address; then the clock starts over.
    burn: {
      at: "",            // ISO time of the first burn, UTC. token.sh stamps it at launch; the page rolls it forward every `everyHours` after.
      everyHours: 9,     // how long each wait is
    },
  },

  // The roadmap: promises with numbers on them, in the program's own units (a day is 8 h, a week is 40 h).
  // When a line ships, write its `took` in the same units and the page prints the multiplier. Leave it empty until then.
  roadmap: [
    { key: "ROAD-1", what: "{ticker} lands", said: "1d", took: "", link: "" },
    { key: "ROAD-2", what: "the first burn", said: "9h", took: "", link: "" },
    { key: "ROAD-3", what: "the burn log on this page: every burn, its tx, its amount", said: "2d", took: "", link: "" },
    { key: "ROAD-4", what: "pip install fibo", said: "3d", took: "", link: "" },
    { key: "ROAD-5", what: "the multiplier as a badge for your README", said: "2d", took: "", link: "" },
    { key: "ROAD-6", what: "a pre-commit hook: no estimate, no first commit", said: "1w", took: "", link: "" },
    { key: "ROAD-7", what: "more sources: YouTrack, Azure Boards, Shortcut", said: "2w", took: "", link: "" },
  ],
};
