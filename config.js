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
  },
};
