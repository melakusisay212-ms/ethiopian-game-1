# Ethiopia

A mobile-friendly puzzle game: match Ethiopian regional flags, travel a 12-level journey, make special tiles and unlock the region book.

## Get a debug APK from GitHub Actions

1. Create a new repository on GitHub.
2. Upload the **contents** of this folder (not the folder itself) to the `main` branch, with `git push` or the web uploader.
   - The hidden `.github/workflows/build.yml` file must be included. If the web uploader skips it, use *Add file > Create new file*, type `.github/workflows/build.yml` as the name and paste the file's contents.
3. Open the **Actions** tab. The "Build game and debug APK" workflow runs on every push to `main` (or click **Run workflow**). The first run takes several minutes.
4. When it finishes, scroll to **Artifacts** at the bottom of the run page:
   - **ethiopia-debug-apk** contains `app-debug.apk`. Unzip, copy it to your phone and install it (allow "install unknown apps" for your file manager or browser).
   - **ethiopia-web** is the single-file HTML version.

The app is wrapped with Capacitor (app id `com.ethiopia.game`). The Android project is generated during the workflow, so nothing Android-specific is stored in the repository.

## Run locally

```
npm install
npm run dev
```

Build for production with `npm run build` (output goes to `dist/`).

## Project layout

- `index.html` – page markup
- `src/main.js` – game logic, sound, confetti
- `src/style.css` – styling
- `src/tiles.js` and `src/assets/tiles/` – the 14 tile images (12 regional flags, Dire Dawa, Addis Ababa)
