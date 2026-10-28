# NEUARK Memory Care

A calm, mobile-friendly home screen with large, clear activity buttons. The first screen includes My Life Story, Today's Helper, Calm Garden, Family Participation Game, Cognitive Games, Daily Routine, and Voice Assistant.

## Run in VS Code

1. Open this project folder in VS Code using **File > Open Folder**.
2. Open `index.html`.
3. To preview, install the VS Code **Live Server** extension, then right-click `index.html` and choose **Open with Live Server**. You can also open `index.html` directly in a web browser.

No build step or package installation is needed. The Voice Assistant button uses the browser's built-in speech synthesis when available. The page uses a system font fallback if Google Fonts cannot be reached.

## Website language

Use the language menu in the top bar to switch the website immediately between Tamil, English, Hindi, Malayalam, Telugu, Kannada, and Korean. The selected language is saved in the same browser using `neuark-voice-language-v1` and is also used by the Voice Assistant. Family names, relationships, and memories entered by caregivers stay as entered. Speech playback and voice recognition depend on the language voices and microphone services installed by the browser/device.

## Smart Assistant

The Smart Assistant is an offline helper for this website. It can explain its supported tasks, open the daily plan or Calm Garden, return Home, and respond to the supported spoken questions in the selected language. It does not answer open-ended, medical, or general knowledge questions; it says so and asks the user to choose a picture or ask a caregiver.

The project has no Smart Assistant server endpoint, API integration, or provider credential configuration. General conversational answers would require a server-side endpoint and a provider/model configuration with its API key stored on that server. Do not put a provider API key in `app.js`, `index.html`, or another browser-delivered file.

## My Life Story

1. Choose **My Life Story** on the home screen.
2. Select a photo, enter the person's name and relationship, and optionally add a memory.
3. Choose **Add photo**. Tap a photo card to hear the person's name and relationship.
4. Use **Repeat Voice** to hear the selected person again, or **Stop Voice** to stop speech.
5. Choose **Home** to return to the main screen.

Photos and details are resized and saved in this browser on this device. They are not uploaded to a server or shared with other devices. Clearing this browser's site data removes the saved story.

## Family Participation Game

1. Add at least two family photos in **My Life Story**.
2. Choose **Family Participation Game** on the home screen. One family photo appears at a time.
3. Choose the picture button that matches. The game responds kindly, and **Next photo** starts another round.
4. Choose **Gentle hint** for a relationship clue. **Repeat Voice** repeats the most recent question, hint, or feedback. **Stop Voice** stops spoken audio.
5. Choose **Home** whenever you would like to finish.

The game uses the family photos already saved in My Life Story on this device. Voice uses the browser's speech synthesis when available; on other browsers, the words remain visible on screen.

## Today's Helper

1. Choose **Today's Helper** on the home screen.
2. Look at the large object picture and choose the matching picture button: water glass, apple, shirt, toothbrush, or phone.
3. Choose **Hint** for a short clue, **Repeat Voice** to hear the latest instruction or feedback again, or **Stop Voice** to stop speech.
4. Choose **Next picture** to continue. Choose **Home** when you are ready to finish.

The activity gives friendly feedback without a score. Voice uses the browser's speech synthesis when available; the words also appear on screen.

## Daily Routine and Reminders

1. Choose **Daily Routine** on the home screen to see the picture schedule from waking up through bedtime.
2. Choose **Repeat Voice** to hear the routine. Choose **Stop Voice** to stop speech.
3. Choose **Add Reminder**, tap a picture for the activity, set a time, and choose **Save reminder**.
4. Choose **Edit** to change a reminder or **Delete** to remove it. Saved reminders remain in this browser after a refresh.
5. When a reminder is due, a picture and friendly message appear, and the browser speaks it. Choose **Okay** to dismiss the notice.

Reminders are stored on this device and appear while the website is open in the browser. Browser-based reminders cannot alert while the site is closed.

## Calm Garden

1. Choose **Calm Garden** on the home screen. Tap the flower, tree, bird, or pond to see and hear a peaceful message.
2. Choose **Breathe with me** to follow the slow breathing guide. Choose **Pause** whenever you want to rest.
3. Choose **Play sounds** for soft generated breeze and bird sounds. Choose **Stop sounds** to end them.
4. Choose **Hear a gentle guide**, **Repeat Voice**, or **Stop Voice** for spoken guidance.
5. Choose **Home** to return to the main screen.

Nature sounds use the browser's Web Audio support and are not recorded clips. If audio is unavailable, the garden displays a quiet fallback message and remains usable.

## Cognitive Games

1. Choose **Cognitive Games**, then choose one of the five games and **Level 1**, **Level 2**, or **Level 3**. Any level can be selected at any time.
2. Follow the short picture instruction. Some games have a **Ready to choose** or **Hide picture** button; others let you tap the pictures directly.
3. Use **Repeat Voice**, **Hint**, or **Stop Voice** whenever helpful. Answers receive friendly feedback without a score.
4. Choose **Next picture** between questions and **Next Level** after finishing a level. **Game menu** returns to the game choices; **Home** returns to the main screen.

Completed levels are saved in this browser and shown on the game cards after a refresh. The five games are picture matching, missing object, object uses, picture memory, and familiar object identification.

## Voice Assistant

1. Choose **Voice** in the top bar from any screen, or choose **Voice Assistant** on the home screen.
2. Select one of the seven large language buttons: Tamil, English, Hindi, Malayalam, Telugu, Kannada, or Korean. Your choice is saved in this browser and restored after refresh.
3. Choose **Speak Instructions** to hear a short guide for the current screen. **Repeat** repeats the latest spoken message, **Hint** gives help for the current activity, and **Stop Voice** stops speech and listening.
4. Choose **Voice Input** and speak a simple command such as “home,” “calm garden,” “today's helper,” “repeat,” or “hint.” You can also use the large touch buttons at any time.

Speech and voice input use browser and device support. English voice recognition tries en-US if en-IN is unavailable. If voice input or a language is unsupported, the page explains this and touch controls remain available. The site does not require typing commands. Device voices, recognition accuracy, and microphone permissions vary by browser and should be checked on the device being used.

## Install the website as an app

The project is an installable Progressive Web App. It includes a web app manifest, NEUARK icons derived from `assets/image.png`, and a service worker that caches the app and garden sounds for offline use after the first successful visit. Service workers require HTTPS, except when developing on `localhost` or `127.0.0.1`.

### Publish free with GitHub Pages

1. Create a **public** GitHub repository for this project (public repositories can use GitHub Pages on the free plan). Upload the contents of this folder to the repository root, including `manifest.webmanifest`, `service-worker.js`, `pwa.js`, and the `assets` folder.
2. In the repository, open **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select the `main` branch and `/(root)`, then choose **Save**.
4. Wait for GitHub Pages to publish the site. The HTTPS address is `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/` (replace the two uppercase parts with your GitHub username and repository name).
5. Open that HTTPS address and confirm the home page loads before installing it. On a later update, upload the changed files and allow the service worker to install the new cache version.

### Install on a phone

- **Android:** Open the HTTPS site in Chrome. Open **More (⋮)** and choose **Install and create shortcut** or **Install app**, then confirm. The wording can vary by Chrome version.
- **iPhone/iPad:** Open the HTTPS site in Safari, tap **Share**, choose **Add to Home Screen**, turn on **Open as Web App** if shown, then tap **Add**. iOS uses this manual installation flow.

### Check offline support

Open the site once while online and wait for the page to finish loading. Refresh it once so the service worker controls the page. Then disconnect the device or use the browser developer tools' offline network setting and reload. The cached website and garden audio should remain available. Speech recognition, speech voices, and reminders that depend on the browser or an active page may still require device support or an internet connection.
