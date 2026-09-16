<p align="center">
  <img src="banner.svg" alt="Fibo — git blame for your promises" width="780">
</p>

<h1 align="center">Fibo · the page</h1>

<p align="center">The landing page for <a href="https://github.com/Artemoon13/fibo">Fibo</a>, git blame for your promises.<br>
Plain HTML, CSS and JavaScript. No framework, no bundler, nothing to install to look at it.</p>

---

**Every line in its terminals was printed by the real program.** `data.js` is written by `build.py`, which builds the demo repository and runs `fibo` on it: the report, every task taken apart, `doctor`, `drift`, three looping films, and the exact wording of every refusal. The page does not write any of it.

**The copy of the program in the browser follows the same rules.** `say` refuses what the program refuses, in the same words, and chains its ledger with a real SHA-256.

**`config.js` is the only file meant for hands:** the link to the program, and the token block.

## Look at it

Open `index.html` from disk. There is nothing to build and nothing to serve.

## Rebuild the data

When the program's output changes, regenerate `data.js` from a checkout of it and commit the result:

```sh
git clone https://github.com/Artemoon13/fibo ../fibo
python build.py --project ../fibo
```

## Publish

Every push to `main` publishes the page to GitHub Pages through `.github/workflows/pages.yml`. Only the HTML, CSS and JavaScript go out.

```sh
python -m unittest        # the page asks for no file that is missing, and speaks English only
```

---

<p align="center"><sub>MIT · built for the fun of it</sub></p>
