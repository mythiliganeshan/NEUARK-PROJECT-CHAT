const features = {
  life: { title: 'My Life Story', picture: '📖', text: 'Your favorite memories, photos, and stories can live here. Ask a family member to add a special moment.' },
  helper: { title: "Today's Helper", picture: '🤝', text: 'A friendly helper can guide you through the next part of your day. You are doing just fine.' },
  garden: { title: 'Calm Garden', picture: '🌿', text: 'Take a slow breath. Imagine warm sunshine and a quiet garden. Stay here as long as you like.' },
  family: { title: 'Family Participation Game', picture: '👨‍👩‍👧', text: 'Invite someone you love to play a simple game together. Sharing a smile is always a win.' },
  games: { title: 'Cognitive Games', picture: '🧩', text: 'Choose a gentle puzzle, matching game, or word game. Play at your own pace.' },
  routine: { title: 'Daily Routine', picture: '🕒', text: 'Your day can be shown here with familiar steps, like breakfast, a walk, or a visit.' },
  voice: { title: 'Voice Assistant', picture: '🎙️', text: 'You can ask for help by speaking. Try saying, “What is next?”', action: 'Speak for me' },
  help: { title: 'We are here to help', picture: '💛', text: 'Take your time. Tap any large button to get started, or ask someone nearby to help.' }
};
const dialog = document.querySelector('#featureDialog');
const title = document.querySelector('#dialogTitle');
const picture = document.querySelector('#dialogPicture');
const message = document.querySelector('#dialogText');
const action = document.querySelector('#dialogAction');
let currentFeature = null;

function showFeature(key) {
  currentFeature = features[key];
  title.textContent = currentFeature.title;
  picture.textContent = currentFeature.picture;
  message.textContent = currentFeature.text;
  action.textContent = currentFeature.action || 'Okay';
  dialog.showModal();
}
const homeView = document.querySelector('#main');
const lifeView = document.querySelector('#lifeStory');
const gameView = document.querySelector('#familyGame');
const helperView = document.querySelector('#helperActivity');
const routineView = document.querySelector('#routineActivity');
const gardenView = document.querySelector('#calmGarden');
const cognitiveView = document.querySelector('#cognitiveGames');
const voiceAssistantView = document.querySelector('#voiceAssistant');
const smartView = document.querySelector('#smartAssistant');
document.querySelectorAll('[data-feature]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.feature === 'life') openLifeStory();
  else if (button.dataset.feature === 'family') openFamilyGame();
  else if (button.dataset.feature === 'helper') openHelperActivity();
  else if (button.dataset.feature === 'routine') openDailyRoutine();
  else if (button.dataset.feature === 'garden') openCalmGarden();
  else if (button.dataset.feature === 'games') openCognitiveGames();
  else if (button.dataset.feature === 'smart') openSmartAssistant();
  else if (button.dataset.feature === 'voice') openVoiceAssistant();
  else showFeature(button.dataset.feature);
}));
document.querySelector('#helpButton').addEventListener('click', () => showFeature('help'));
document.querySelector('.brand').addEventListener('click', event => {
  event.preventDefault();
  returnHomeFromVoice();
  history.replaceState(null, '', location.pathname + location.search);
});
action.addEventListener('click', () => {
  if (currentFeature?.action && 'speechSynthesis' in window) {
    speakWithSelectedLanguage('Hello. How can I help you today?');
  }
  dialog.close();
});

const now = new Date();
document.querySelector('#weekday').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(now);
document.querySelector('#date').textContent = new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' }).format(now);

const STORY_KEY = 'neuark-life-story-v1';
const peopleGrid = document.querySelector('#peopleGrid');
const emptyStory = document.querySelector('#emptyStory');
const peopleCount = document.querySelector('#peopleCount');
const formStatus = document.querySelector('#formStatus');
const voiceStatus = document.querySelector('#voiceStatus');
const repeatVoice = document.querySelector('#repeatVoice');
let people = loadPeople();
let selectedPerson = null;

function loadPeople() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORY_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter(person => person && person.name && person.relationship && person.photo) : [];
  } catch { return []; }
}
function savePeople() {
  try {
    localStorage.setItem(STORY_KEY, JSON.stringify(people));
    return true;
  } catch { return false; }
}
function openLifeStory() {
  cancelCurrentSpeech();
  homeView.hidden = true;
  lifeView.hidden = false;
  renderPeople();
  lifeView.focus();
}
document.querySelector('#backHome').addEventListener('click', () => {
  cancelCurrentSpeech();
  lifeView.hidden = true;
  homeView.hidden = false;
  document.querySelector('[data-feature="life"]').focus();
});
function renderPeople() {
  peopleGrid.replaceChildren();
  emptyStory.hidden = people.length > 0;
  peopleCount.textContent = people.length ? `${people.length} ${people.length === 1 ? 'person' : 'people'}` : '';
  for (const person of people) {
    const card = document.createElement('article');
    card.className = 'person-card';
    const speakButton = document.createElement('button');
    speakButton.type = 'button';
    speakButton.className = 'person-photo-button';
    speakButton.setAttribute('aria-label', `Hear ${person.name}, ${person.relationship}`);
    const img = document.createElement('img');
    img.src = person.photo;
    img.alt = '';
    speakButton.append(img);
    speakButton.addEventListener('click', () => speakPerson(person));
    const details = document.createElement('div');
    details.className = 'person-details';
    const name = document.createElement('h3'); name.textContent = person.name;
    const relationship = document.createElement('p'); relationship.className = 'relationship'; relationship.textContent = person.relationship;
    details.append(name, relationship);
    if (person.memory) {
      const memory = document.createElement('p'); memory.className = 'memory'; memory.textContent = person.memory;
      details.append(memory);
    }
    card.append(speakButton, details);
    peopleGrid.append(card);
  }
}
function speakPerson(person) {
  selectedPerson = person;
  repeatVoice.disabled = false;
  if (!('speechSynthesis' in window)) {
    setVoiceStatus('speechUnsupported');
    return;
  }
  cancelCurrentSpeech();
  speakWithSelectedLanguage(`${person.name}, ${person.relationship}.`, 0.82, 1);
}
repeatVoice.addEventListener('click', () => { if (selectedPerson) speakPerson(selectedPerson); });
document.querySelector('#stopVoice').addEventListener('click', () => {
  if ('speechSynthesis' in window) cancelCurrentSpeech();
  setVoiceStatus('stopped');
});

function readAsStoryPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The photo could not be opened. Please choose another one.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('This photo could not be read. Please choose a JPG, PNG, or WebP image.'));
      image.onload = () => {
        const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (!context) { reject(new Error('Your browser could not prepare this photo.')); return; }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
document.querySelector('#personForm').addEventListener('submit', async event => {
  event.preventDefault();
  formStatus.textContent = '';
  const form = event.currentTarget;
  const file = document.querySelector('#personPhoto').files[0];
  if (!file) { formStatus.textContent = 'Please choose a photo.'; return; }
  if (!file.type.startsWith('image/')) { formStatus.textContent = 'Please choose an image file.'; return; }
  if (file.size > 15 * 1024 * 1024) { formStatus.textContent = 'That photo is large. Please choose one smaller than 15 MB.'; return; }
  const submit = form.querySelector('[type=submit]');
  submit.disabled = true;
  submit.textContent = 'Adding photo…';
  try {
    const person = {
      id: (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`),
      name: document.querySelector('#personName').value.trim(),
      relationship: document.querySelector('#personRelationship').value.trim(),
      memory: document.querySelector('#personMemory').value.trim(),
      photo: await readAsStoryPhoto(file)
    };
    if (!person.name || !person.relationship) { formStatus.textContent = 'Please add a name and relationship.'; return; }
    people.push(person);
    if (!savePeople()) {
      people.pop();
      formStatus.textContent = 'This device is out of storage space. Try a smaller photo or remove saved site data.';
      return;
    }
    renderPeople();
    form.reset();
    formStatus.textContent = `${person.name} was added.`;
  } catch (error) {
    formStatus.textContent = error.message || 'The photo could not be added. Please try again.';
  } finally {
    submit.disabled = false;
    submit.textContent = 'Add photo';
  }
});
renderPeople();

// The family game reuses the photos already added to My Life Story.
const gameSetup = document.querySelector('#gameSetup');
const gamePlay = document.querySelector('#gamePlay');
const gameAnswers = document.querySelector('#gameAnswers');
const targetPhoto = document.querySelector('#targetPhoto');
const gameQuestion = document.querySelector('#gameQuestion');
const gameProgress = document.querySelector('#gameProgress');
const gameFeedback = document.querySelector('#gameFeedback');
const nextQuestion = document.querySelector('#nextQuestion');
const gameRepeatVoice = document.querySelector('#gameRepeatVoice');
const gameVoiceStatus = document.querySelector('#gameVoiceStatus');
let gameDeck = [];
let deckIndex = 0;
let roundNumber = 0;
let currentTarget = null;
let lastGameSpeech = '';
let roundAnswered = false;

function openFamilyGame() {
  cancelCurrentSpeech();
  people = loadPeople();
  homeView.hidden = true;
  lifeView.hidden = true;
  gameView.hidden = false;
  gameSetup.hidden = people.length >= 2;
  gamePlay.hidden = people.length < 2;
  if (people.length < 2) {
    document.querySelector('#setupMessage').textContent = people.length === 1
      ? 'Add one more family photo in My Life Story to play together.'
      : 'Add at least two family photos in My Life Story to play together.';
  } else {
    gameDeck = shuffle([...people]);
    deckIndex = 0;
    roundNumber = 0;
    nextGameQuestion(false);
  }
  gameView.focus();
}
function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
document.querySelector('#gameHome').addEventListener('click', () => {
  cancelCurrentSpeech();
  gameView.hidden = true;
  homeView.hidden = false;
  document.querySelector('[data-feature="family"]').focus();
});
document.querySelector('#addGamePhotos').addEventListener('click', () => {
  gameView.hidden = true;
  lifeView.hidden = false;
  renderPeople();
  lifeView.focus();
});
function nextGameQuestion(moveFocus = true) {
  if (!people.length) return;
  if (deckIndex >= gameDeck.length) {
    gameDeck = shuffle([...people]);
    if (gameDeck.length > 1 && gameDeck[0].id === currentTarget?.id) [gameDeck[0], gameDeck[1]] = [gameDeck[1], gameDeck[0]];
    deckIndex = 0;
  }
  currentTarget = gameDeck[deckIndex++];
  roundNumber++;
  roundAnswered = false;
  gameProgress.textContent = `Photo ${roundNumber}`;
  targetPhoto.src = currentTarget.photo;
  targetPhoto.alt = 'A family member to identify';
  targetPhoto.dataset.personId = currentTarget.id;
  gameAnswers.replaceChildren();
  nextQuestion.hidden = true;
  gameFeedback.className = 'game-feedback';
  gameFeedback.textContent = 'Take your time. There is no rush.';

  const distractors = shuffle(people.filter(person => person.id !== currentTarget.id)).slice(0, 3);
  const options = shuffle([currentTarget, ...distractors]);
  for (const person of options) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'game-answer';
    button.dataset.personId = person.id;
    button.setAttribute('aria-label', `${person.name}, ${person.relationship}`);
    const image = document.createElement('img');
    image.src = person.photo;
    image.alt = '';
    const caption = document.createElement('span');
    caption.className = 'answer-caption';
    const name = document.createElement('strong'); name.textContent = person.name;
    const relation = document.createElement('small'); relation.textContent = person.relationship;
    caption.append(name, relation);
    button.append(image, caption);
    button.addEventListener('click', () => chooseGameAnswer(person, button));
    gameAnswers.append(button);
  }
  lastGameSpeech = 'Look at the photo. Who do you see? Take your time.';
  gameRepeatVoice.disabled = false;
  gameVoiceStatus.textContent = 'Tap Repeat Voice to hear the question.';
  if (moveFocus) gameQuestion.focus();
}
function chooseGameAnswer(person, button) {
  if (roundAnswered) return;
  roundAnswered = true;
  const isMatch = person.id === currentTarget.id;
  for (const choice of gameAnswers.querySelectorAll('.game-answer')) {
    choice.disabled = true;
    if (choice.dataset.personId === currentTarget.id) choice.classList.add('answer-correct');
  }
  if (isMatch) {
    gameFeedback.className = 'game-feedback kind-feedback';
    gameFeedback.textContent = `That's right! This is ${currentTarget.name}, your ${currentTarget.relationship}. Lovely to see a familiar face.`;
  } else {
    button.classList.add('answer-gentle');
    gameFeedback.className = 'game-feedback kind-feedback';
    gameFeedback.textContent = `That's all right. This is ${currentTarget.name}, your ${currentTarget.relationship}. Thank you for playing along.`;
  }
  nextQuestion.hidden = false;
  speakGame(gameFeedback.textContent);
  nextQuestion.focus();
}
function speakGame(text) {
  lastGameSpeech = text;
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    setVoiceStatus('speechUnsupported');
    return;
  }
  speakWithSelectedLanguage(text, 0.78, 1);
}
document.querySelector('#gameHint').addEventListener('click', () => {
  if (!currentTarget || roundAnswered) return;
  const hint = `A gentle hint: this is someone who is your ${currentTarget.relationship}. Take your time.`;
  gameFeedback.className = 'game-feedback';
  gameFeedback.textContent = hint;
  speakGame(hint);
});
gameRepeatVoice.addEventListener('click', () => { if (lastGameSpeech) speakGame(lastGameSpeech); });
document.querySelector('#gameStopVoice').addEventListener('click', () => {
  if ('speechSynthesis' in window) cancelCurrentSpeech();
  setVoiceStatus('stopped');
});
nextQuestion.addEventListener('click', () => nextGameQuestion(true));

// Today's Helper uses clear, familiar object drawings with short spoken clues.
const helperObjects = [
  { id: 'water', name: 'Water glass', hint: 'You can sip a drink from it. It may sit beside your plate.', voiceName: 'a glass of water', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#e7f2f4"/><path d="M51 43h78l-10 105H61L51 43Z" fill="#fdfefe" stroke="#476c72" stroke-width="6" stroke-linejoin="round"/><path d="m57 94 66 0-5 48H62l-5-48Z" fill="#88c9dc"/><path d="M59 92c14-6 22 6 35 0 13-6 21 5 30 0" fill="none" stroke="#58a9c4" stroke-width="5" stroke-linecap="round"/><path d="M67 57h16" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>' },
  { id: 'apple', name: 'Apple', hint: 'This is a fruit. You can enjoy it as a snack.', voiceName: 'an apple', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#f9ece1"/><path d="M91 61c-20-20-56-7-56 28 0 34 24 64 49 64 10 0 13-5 21-5s12 5 22 5c24 0 44-32 44-62 0-32-31-48-58-31-8 5-15 5-22 1Z" fill="#e85f51"/><path d="M92 62c-2-15 4-26 14-33" fill="none" stroke="#70523a" stroke-width="8" stroke-linecap="round"/><path d="M99 37c14-18 34-10 37-7-6 16-21 23-37 13" fill="#74a56f"/><path d="M52 92c2-14 10-22 20-25" fill="none" stroke="#ffb8a4" stroke-width="6" stroke-linecap="round"/></svg>' },
  { id: 'shirt', name: 'Shirt', hint: 'You can wear it on your top half. It has sleeves.', voiceName: 'a shirt', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#e9edf8"/><path d="m61 42 20-9c5 12 13 18 22 18s17-6 22-18l20 9 22 23-19 19-12-11v68H44V73L32 84 13 65l23-23 25 0Z" transform="translate(15 0) scale(.83 1) translate(18 0)" fill="#688fc6" stroke="#3e608e" stroke-width="5" stroke-linejoin="round"/><path d="M86 52v91m0-77 6 4-6 5 6 5-6 5 6 5-6 5" fill="none" stroke="#eaf1fc" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
  { id: 'toothbrush', name: 'Toothbrush', hint: 'You use it with toothpaste to clean your teeth.', voiceName: 'a toothbrush', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#e7f2eb"/><g transform="rotate(-38 90 90)"><rect x="75" y="68" width="30" height="89" rx="14" fill="#67a997" stroke="#3f766b" stroke-width="5"/><path d="M81 113h18M81 124h18" stroke="#cde8df" stroke-width="5" stroke-linecap="round"/><rect x="72" y="34" width="36" height="40" rx="9" fill="#fdfefe" stroke="#3f766b" stroke-width="5"/><path d="M79 41v13m9-13v13m9-13v13m8-13v13" stroke="#df8e87" stroke-width="4" stroke-linecap="round"/><path d="M77 32v-7m9 7v-9m9 9v-9m9 9v-7" stroke="#3f766b" stroke-width="3" stroke-linecap="round"/></g></svg>' },
  { id: 'phone', name: 'Phone', hint: 'You can use it to call or talk with someone you love.', voiceName: 'a phone', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#eee8f6"/><rect x="52" y="22" width="76" height="136" rx="15" fill="#485665"/><rect x="59" y="34" width="62" height="103" rx="5" fill="#d9eff4"/><rect x="64" y="42" width="52" height="87" rx="3" fill="#b9dce7"/><circle cx="90" cy="147" r="5" fill="#f3f5f7"/><path d="M76 52h28M77 61h16" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="90" cy="98" r="18" fill="#62a17b"/><path d="M82 91c4 11 9 15 18 18l5-6-9-6-4 4c-3-2-5-4-7-7l4-4-6-9-6 4 5 6Z" fill="#fff"/></svg>' }
];
const helperPicture = document.querySelector('#helperObjectPicture');
const helperAnswers = document.querySelector('#helperAnswers');
const helperFeedback = document.querySelector('#helperFeedback');
const helperNext = document.querySelector('#helperNext');
const helperRepeat = document.querySelector('#helperRepeatVoice');
const helperVoiceStatus = document.querySelector('#helperVoiceStatus');
let helperDeck = [];
let helperIndex = 0;
let helperTarget = null;
let helperRoundAnswered = false;
let lastHelperSpeech = 'Look at the picture. What do you see? Take your time.';

function openHelperActivity() {
  cancelCurrentSpeech();
  homeView.hidden = true;
  lifeView.hidden = true;
  gameView.hidden = true;
  helperView.hidden = false;
  helperDeck = shuffle([...helperObjects]);
  helperIndex = 0;
  nextHelperQuestion(false);
  helperView.focus();
}
document.querySelector('#helperHome').addEventListener('click', () => {
  cancelCurrentSpeech();
  helperView.hidden = true;
  homeView.hidden = false;
  document.querySelector('[data-feature="helper"]').focus();
});
function nextHelperQuestion(moveFocus = true) {
  if (helperIndex >= helperDeck.length) {
    helperDeck = shuffle([...helperObjects]);
    if (helperDeck.length > 1 && helperDeck[0].id === helperTarget?.id) [helperDeck[0], helperDeck[1]] = [helperDeck[1], helperDeck[0]];
    helperIndex = 0;
  }
  helperTarget = helperDeck[helperIndex++];
  helperRoundAnswered = false;
  document.querySelector('#helperHint').disabled = false;
  helperPicture.innerHTML = helperTarget.art;
  helperPicture.dataset.objectId = helperTarget.id;
  helperPicture.setAttribute('aria-label', 'A familiar everyday object to identify');
  helperAnswers.replaceChildren();
  helperNext.hidden = true;
  helperFeedback.className = 'helper-feedback';
  helperFeedback.textContent = 'Take your time. There is no rush.';
  for (const item of shuffle([...helperObjects])) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'helper-answer';
    button.dataset.objectId = item.id;
    button.setAttribute('aria-label', item.name);
    const illustration = document.createElement('span');
    illustration.className = 'helper-answer-picture';
    illustration.innerHTML = item.art;
    const label = document.createElement('span');
    label.className = 'helper-answer-label';
    label.textContent = item.name;
    button.append(illustration, label);
    button.addEventListener('click', () => chooseHelperAnswer(item, button));
    helperAnswers.append(button);
  }
  lastHelperSpeech = 'Look at the picture. What do you see? Take your time.';
  helperVoiceStatus.textContent = 'Tap Repeat Voice to hear the instruction.';
  if (moveFocus) document.querySelector('#helperQuestion').focus();
}
function chooseHelperAnswer(item, button) {
  if (helperRoundAnswered) return;
  helperRoundAnswered = true;
  document.querySelector('#helperHint').disabled = true;
  for (const choice of helperAnswers.querySelectorAll('.helper-answer')) {
    choice.disabled = true;
    if (choice.getAttribute('aria-label') === helperTarget.name) choice.classList.add('helper-answer-correct');
  }
  if (item.id === helperTarget.id) {
    helperFeedback.textContent = `That's right! This is ${helperTarget.voiceName}. Well done.`;
  } else {
    button.classList.add('helper-answer-gentle');
    helperFeedback.textContent = `Good try. This is ${helperTarget.voiceName}. You can take your time.`;
  }
  helperFeedback.classList.add('helper-kind-feedback');
  helperNext.hidden = false;
  speakHelper(helperFeedback.textContent);
  helperNext.focus();
}
function speakHelper(text) {
  lastHelperSpeech = text;
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    setVoiceStatus('speechUnsupported');
    return;
  }
  speakWithSelectedLanguage(text, 0.78, 1);
}
document.querySelector('#helperHint').addEventListener('click', () => {
  if (!helperTarget || helperRoundAnswered) return;
  const hint = helperTarget.hint;
  helperFeedback.textContent = hint;
  helperFeedback.className = 'helper-feedback';
  speakHelper(hint);
});
helperRepeat.addEventListener('click', () => speakHelper(lastHelperSpeech));
document.querySelector('#helperStopVoice').addEventListener('click', () => {
  if ('speechSynthesis' in window) cancelCurrentSpeech();
  setVoiceStatus('stopped');
});
helperNext.addEventListener('click', () => nextHelperQuestion(true));

// Daily Routine and saved, in-page reminders.
const routineItems = [
  { id: 'wake', label: 'Wake up', reminderText: 'wake up', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#f8efd9"/><path d="M48 104a42 42 0 0 1 84 0" fill="#f7c75d" stroke="#c18d32" stroke-width="6"/><path d="M90 34v15M49 51l10 11m72-11-10 11M31 83h15m88 0h15" stroke="#c18d32" stroke-width="6" stroke-linecap="round"/><path d="M37 118h106M50 132h80" stroke="#729a7d" stroke-width="8" stroke-linecap="round"/></svg>' },
  { id: 'brush', label: 'Brush teeth', reminderText: 'brush your teeth', art: helperObjects.find(item => item.id === 'toothbrush').art },
  { id: 'bathe', label: 'Have a bath', reminderText: 'have a bath', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#e4f1f3"/><path d="M34 93h112v23a28 28 0 0 1-28 28H62a28 28 0 0 1-28-28V93Z" fill="#fff" stroke="#557d83" stroke-width="6"/><path d="M47 92V60a17 17 0 0 1 34 0v12" fill="none" stroke="#557d83" stroke-width="7" stroke-linecap="round"/><path d="M68 67v10m17-10v10m17-10v10m17-10v10" stroke="#8dc8d1" stroke-width="6" stroke-linecap="round"/><path d="M51 144v9m78-9v9" stroke="#557d83" stroke-width="7" stroke-linecap="round"/><path d="M57 104c12-8 22 8 34 0s21 8 33 0" fill="none" stroke="#9fd3db" stroke-width="5" stroke-linecap="round"/></svg>' },
  { id: 'eat', label: 'Eat a meal', reminderText: 'eat a meal', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#f8eade"/><circle cx="90" cy="94" r="51" fill="#fff" stroke="#b58c69" stroke-width="6"/><circle cx="90" cy="94" r="35" fill="#faf3e7" stroke="#e3cdb4" stroke-width="4"/><path d="M73 97c0-11 10-18 20-18 10 0 17 6 17 16v18H73V97Z" fill="#e88956"/><path d="M84 78c2-9 7-12 12-11m-20 6c1-7 4-10 8-11" stroke="#6f9c63" stroke-width="5" stroke-linecap="round"/><path d="M33 64v57m-7-57v20m14-20v20m-7 0v37m111-57v57m-7-57v31h14V64" fill="none" stroke="#7b8180" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
  { id: 'water', label: 'Drink water', reminderText: 'drink some water', art: helperObjects.find(item => item.id === 'water').art },
  { id: 'walk', label: 'Take a walk', reminderText: 'take a little walk', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#e8f0e2"/><circle cx="116" cy="44" r="15" fill="#e5ad52"/><circle cx="82" cy="55" r="14" fill="#e4a870"/><path d="m79 73 22 20-16 23m14-23 19 9m-37-8-20 16m22 7-12 26m25-26 20 23" fill="none" stroke="#4e7890" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 147h118" stroke="#7aa17b" stroke-width="7" stroke-linecap="round"/><path d="M49 136v-15m0 8-8-7m8 8 8-8m74 10v-17m0 9-8-8m8 8 8-9" stroke="#83a978" stroke-width="5" stroke-linecap="round"/></svg>' },
  { id: 'sleep', label: 'Get ready for sleep', reminderText: 'get ready for sleep', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#e9eaf6"/><path d="M122 31a43 43 0 1 0 30 71 50 50 0 0 1-30-71Z" fill="#efc965"/><path d="M35 101v43m110-43v43M35 119h110v23H35z" fill="#7191b3" stroke="#4b6685" stroke-width="6" stroke-linejoin="round"/><path d="M46 105h43a14 14 0 0 1 14 14H46v-14Z" fill="#fff" stroke="#a7b5ca" stroke-width="4"/><path d="M112 49v13m-7-6h14m10 14v8m-4-4h8" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>' }
];
const routineSchedule = document.querySelector('#routineSchedule');
const routineSpeakText = "Here is today's plan. Wake up. Brush your teeth. Have a bath. Eat a meal. Drink some water. Take a walk. Get ready for sleep. Take it one step at a time.";
const routineRepeatVoice = document.querySelector('#routineRepeatVoice');
const routineVoiceStatus = document.querySelector('#routineVoiceStatus');
const reminderForm = document.querySelector('#reminderForm');
const reminderChoices = document.querySelector('#reminderChoices');
const reminderList = document.querySelector('#reminderList');
const emptyReminders = document.querySelector('#emptyReminders');
const reminderStatus = document.querySelector('#reminderStatus');
const reminderFormStatus = document.querySelector('#reminderFormStatus');
const reminderNotice = document.querySelector('#reminderNotice');
const noticePicture = document.querySelector('#noticePicture');
const noticeText = document.querySelector('#noticeText');
const REMINDER_KEY = 'neuark-daily-reminders-v1';
const FIRED_KEY = 'neuark-daily-reminder-fires-v1';
let reminders = loadReminders();
let editingReminderId = null;
let routineLastSpeech = routineSpeakText;
let noticeQueue = [];
let firedToday = loadFiredReminders();
let firedDate = localDateKey(new Date());
let lastReminderCheck = new Date(Date.now() - 60_000);

function loadReminders() {
  try {
    const stored = JSON.parse(localStorage.getItem(REMINDER_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter(item => item && item.id && routineItems.some(routine => routine.id === item.activityId) && /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time)) : [];
  } catch { return []; }
}
function saveReminders(nextReminders) {
  try { localStorage.setItem(REMINDER_KEY, JSON.stringify(nextReminders)); reminders = nextReminders; return true; }
  catch { return false; }
}
function buildSchedule() {
  routineSchedule.replaceChildren();
  routineItems.forEach((item, index) => {
    const row = document.createElement('li'); row.className = 'routine-card';
    const art = document.createElement('span'); art.className = `routine-picture routine-picture-${item.id}`; art.innerHTML = item.art; art.setAttribute('aria-hidden', 'true');
    const number = document.createElement('span'); number.className = 'routine-number'; number.setAttribute('aria-hidden', 'true'); number.textContent = String(index + 1);
    const label = document.createElement('span'); label.className = 'routine-label'; label.textContent = item.label;
    row.append(art, number, label); routineSchedule.append(row);
  });
}
function buildReminderChoices() {
  reminderChoices.replaceChildren();
  routineItems.forEach((item, index) => {
    const label = document.createElement('label'); label.className = 'reminder-choice';
    const radio = document.createElement('input'); radio.type = 'radio'; radio.name = 'reminderActivity'; radio.value = item.id; radio.required = true;
    if (index === 0) radio.required = true;
    const art = document.createElement('span'); art.className = 'reminder-choice-picture'; art.innerHTML = item.art; art.setAttribute('aria-hidden', 'true');
    const name = document.createElement('span'); name.textContent = item.label;
    label.append(radio, art, name); reminderChoices.append(label);
  });
}
function formatReminderTime(time) {
  const [hour, minute] = time.split(':').map(Number);
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(2000, 0, 1, hour, minute));
}
function renderReminders() {
  reminderList.replaceChildren();
  emptyReminders.hidden = reminders.length > 0;
  for (const reminder of reminders.slice().sort((a, b) => a.time.localeCompare(b.time))) {
    const item = routineItems.find(candidate => candidate.id === reminder.activityId);
    if (!item) continue;
    const card = document.createElement('article'); card.className = 'reminder-card';
    const art = document.createElement('span'); art.className = 'reminder-card-picture'; art.innerHTML = item.art; art.setAttribute('aria-hidden', 'true');
    const details = document.createElement('div'); details.className = 'reminder-card-details';
    const label = document.createElement('strong'); label.textContent = item.label;
    const time = document.createElement('span'); time.className = 'reminder-card-time'; time.textContent = formatReminderTime(reminder.time);
    details.append(label, time);
    const actions = document.createElement('div'); actions.className = 'reminder-card-actions';
    const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'secondary-button'; edit.textContent = 'Edit'; edit.setAttribute('aria-label', `Edit ${item.label} reminder`);
    edit.addEventListener('click', () => editReminder(reminder.id));
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'delete-button'; remove.textContent = 'Delete'; remove.setAttribute('aria-label', `Delete ${item.label} reminder`);
    remove.addEventListener('click', () => deleteReminder(reminder.id));
    actions.append(edit, remove); card.append(art, details, actions); reminderList.append(card);
  }
}
function openDailyRoutine() {
  cancelCurrentSpeech();
  homeView.hidden = true; lifeView.hidden = true; gameView.hidden = true; helperView.hidden = true; routineView.hidden = false;
  renderReminders(); routineView.focus();
}
document.querySelector('#routineHome').addEventListener('click', () => {
  cancelCurrentSpeech(); routineView.hidden = true; homeView.hidden = false;
  document.querySelector('[data-feature="routine"]').focus();
});
function speakRoutine(text) {
  routineLastSpeech = text;
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    setVoiceStatus('speechUnsupported'); return;
  }
  speakWithSelectedLanguage(text, 0.78, 1);
}
routineRepeatVoice.addEventListener('click', () => speakRoutine(routineLastSpeech));
document.querySelector('#routineStopVoice').addEventListener('click', () => {
  if ('speechSynthesis' in window) cancelCurrentSpeech(); setVoiceStatus('stopped');
});
function openReminderForm(reminder = null) {
  editingReminderId = reminder?.id || null;
  reminderForm.reset(); reminderFormStatus.textContent = '';
  document.querySelector('#reminderFormTitle').textContent = editingReminderId ? 'Edit reminder' : 'Add a reminder';
  document.querySelector('#saveReminder').textContent = editingReminderId ? 'Save changes' : 'Save reminder';
  if (reminder) {
    const radio = reminderForm.querySelector(`input[value="${reminder.activityId}"]`);
    if (radio) radio.checked = true;
    document.querySelector('#reminderTime').value = reminder.time;
  }
  reminderForm.hidden = false;
  (reminder ? document.querySelector('#reminderTime') : reminderChoices.querySelector('input')).focus();
}
document.querySelector('#addReminder').addEventListener('click', () => openReminderForm());
function editReminder(id) {
  const reminder = reminders.find(item => item.id === id);
  if (reminder) openReminderForm(reminder);
}
function deleteReminder(id) {
  const reminder = reminders.find(item => item.id === id);
  if (!reminder) return;
  const next = reminders.filter(item => item.id !== id);
  if (!saveReminders(next)) { reminderStatus.textContent = 'Could not save the change. Please try again.'; return; }
  renderReminders();
  const activity = routineItems.find(item => item.id === reminder.activityId);
  reminderStatus.textContent = `${activity.label} reminder deleted.`;
}
document.querySelector('#cancelReminder').addEventListener('click', () => {
  reminderForm.hidden = true; reminderForm.reset(); editingReminderId = null; document.querySelector('#addReminder').focus();
});
reminderForm.addEventListener('submit', event => {
  event.preventDefault(); reminderFormStatus.textContent = '';
  const activityId = reminderForm.querySelector('input[name="reminderActivity"]:checked')?.value;
  const time = document.querySelector('#reminderTime').value;
  if (!activityId || !time) { reminderFormStatus.textContent = 'Please choose a picture and a time.'; return; }
  const id = editingReminderId || (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
  const next = reminders.filter(item => item.id !== id).concat({ id, activityId, time });
  if (!saveReminders(next)) { reminderFormStatus.textContent = 'Could not save. This device may be out of storage space.'; return; }
  const activity = routineItems.find(item => item.id === activityId);
  reminderForm.hidden = true; reminderForm.reset(); editingReminderId = null; renderReminders();
  reminderStatus.textContent = `Reminder saved for ${activity.label} at ${formatReminderTime(time)}.`;
  document.querySelector('#addReminder').focus();
});
function localDateKey(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function loadFiredReminders() {
  try {
    const saved = JSON.parse(localStorage.getItem(FIRED_KEY) || '{}');
    return saved.date === localDateKey(new Date()) && Array.isArray(saved.ids) ? new Set(saved.ids) : new Set();
  } catch { return new Set(); }
}
function checkDueReminders() {
  const now = new Date();
  const today = localDateKey(now);
  if (today !== firedDate) { firedToday = new Set(); firedDate = today; }
  const due = reminders.filter(reminder => {
    const [hour, minute] = reminder.time.split(':').map(Number);
    const scheduledAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
    return scheduledAt > lastReminderCheck && scheduledAt <= now && !firedToday.has(reminder.id);
  });
  lastReminderCheck = now;
  if (!due.length) return;
  due.forEach(reminder => { firedToday.add(reminder.id); noticeQueue.push(reminder); });
  try { localStorage.setItem(FIRED_KEY, JSON.stringify({ date: localDateKey(now), ids: [...firedToday] })); } catch {}
  showNextReminderNotice();
}
function showNextReminderNotice() {
  if (reminderNotice.hidden === false || noticeQueue.length === 0) return;
  const reminder = noticeQueue.shift();
  const item = routineItems.find(candidate => candidate.id === reminder.activityId);
  if (!item) { showNextReminderNotice(); return; }
  noticePicture.innerHTML = item.art;
  noticeText.textContent = `It's time to ${item.reminderText}. Take your time.`;
  reminderNotice.hidden = false;
  speakRoutine(noticeText.textContent);
}
document.querySelector('#dismissNotice').addEventListener('click', () => {
  if ('speechSynthesis' in window) cancelCurrentSpeech();
  reminderNotice.hidden = true;
  showNextReminderNotice();
});
buildSchedule(); buildReminderChoices(); renderReminders();
window.setTimeout(checkDueReminders, 0);
window.setInterval(checkDueReminders, 15000);

// Calm Garden interactivity, breathing guidance, and softly synthesized ambience.
const gardenMessages = {
  flower: { name: 'Flower', message: 'A lovely flower. Its gentle colors brighten our garden.', voice: 'A lovely flower. Its gentle colors brighten our garden. We can enjoy it together.' },
  tree: { name: 'Tree', message: 'A shady tree. We can rest beneath its branches.', voice: 'A shady tree. We can rest beneath its branches. There is no hurry.' },
  bird: { name: 'Bird', message: 'A little bird. Listen for its gentle song.', voice: 'A little bird. Listen for its gentle song. It is peaceful here.' },
  pond: { name: 'Pond', message: 'A quiet pond. The water is calm and still.', voice: 'A quiet pond. The water is calm and still. Take a moment to rest.' }
};
const gardenMessage = document.querySelector('#gardenMessage');
const breathingOrb = document.querySelector('#breathingOrb');
const breathingGuide = document.querySelector('#breathingGuide');
const startBreathing = document.querySelector('#startBreathing');
const pauseBreathing = document.querySelector('#pauseBreathing');
const natureStatus = document.querySelector('#natureStatus');
const playNatureButton = document.querySelector('#playNature');
const stopNatureButton = document.querySelector('#stopNature');
const natureVolumeInput = document.querySelector('#natureVolume');
const natureVolumeValue = document.querySelector('#natureVolumeValue');
const natureWindAudio = document.querySelector('#natureWindAudio');
const natureBirdsAudio = document.querySelector('#natureBirdsAudio');
const gardenVoiceStatus = document.querySelector('#gardenVoiceStatus');
let lastGardenSpeech = "Let's enjoy a quiet moment together. Breathe in gently. Breathe out slowly. You are safe. There is no rush.";
let breathingTimer = null;
let breathingIn = true;
let naturePlaying = false;
let natureStarting = false;
let natureStartToken = 0;
let natureFadeTimer = null;

function openCalmGarden() {
  cancelCurrentSpeech();
  homeView.hidden = true; lifeView.hidden = true; gameView.hidden = true; helperView.hidden = true; routineView.hidden = true; gardenView.hidden = false;
  stopNatureSounds(false);
  stopBreathing(false);
  gardenMessage.textContent = 'Choose something in the garden.';
  gardenView.focus();
}
document.querySelector('#gardenHome').addEventListener('click', () => {
  cancelCurrentSpeech(); stopNatureSounds(false); stopBreathing(false);
  gardenView.hidden = true; homeView.hidden = false;
  document.querySelector('[data-feature="garden"]').focus();
});
document.querySelectorAll('[data-garden-object]').forEach(button => button.addEventListener('click', () => {
  const selected = gardenMessages[button.dataset.gardenObject];
  if (!selected) return;
  gardenMessage.textContent = selected.message;
  speakGarden(selected.voice);
}));
function speakGarden(text) {
  lastGardenSpeech = text;
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    setVoiceStatus('speechUnsupported'); return;
  }
  speakWithSelectedLanguage(text, 0.76, 1);
}
document.querySelector('#gardenVoice').addEventListener('click', () => speakGarden("Let's enjoy a quiet moment together. Breathe in gently. Breathe out slowly. You are safe. There is no rush."));
document.querySelector('#gardenRepeatVoice').addEventListener('click', () => speakGarden(lastGardenSpeech));
document.querySelector('#gardenStopVoice').addEventListener('click', () => {
  if ('speechSynthesis' in window) cancelCurrentSpeech();
  setVoiceStatus('stopped');
});
function startBreathingGuide() {
  if (breathingTimer) return;
  breathingIn = true;
  breathingOrb.classList.add('is-breathing');
  breathingGuide.textContent = 'Breathe in gently.';
  startBreathing.disabled = true; pauseBreathing.disabled = false;
  function nextBreathPhase() {
    breathingIn = !breathingIn;
    breathingGuide.textContent = breathingIn ? 'Breathe in gently.' : 'Breathe out slowly.';
    breathingTimer = window.setTimeout(nextBreathPhase, breathingIn ? 4000 : 6000);
  }
  breathingTimer = window.setTimeout(nextBreathPhase, 4000);
}
function stopBreathing(updateText = true) {
  if (breathingTimer) window.clearTimeout(breathingTimer);
  breathingTimer = null; breathingIn = true;
  breathingOrb.classList.remove('is-breathing');
  startBreathing.disabled = false; pauseBreathing.disabled = true;
  if (updateText) breathingGuide.textContent = 'Take a rest. Start again whenever you are ready.';
}
startBreathing.addEventListener('click', startBreathingGuide);
pauseBreathing.addEventListener('click', () => stopBreathing(true));

async function playNatureSounds() {
  if (naturePlaying || natureStarting) return;
  const startToken = ++natureStartToken;
  if (natureFadeTimer) window.clearInterval(natureFadeTimer);
  natureFadeTimer = null;
  natureWindAudio.pause(); natureBirdsAudio.pause();
  natureWindAudio.currentTime = 0; natureBirdsAudio.currentTime = 0;
  natureWindAudio.volume = 0; natureBirdsAudio.volume = 0;
  natureWindAudio.loop = true; natureBirdsAudio.loop = true;
  natureStarting = true;
  playNatureButton.disabled = true;
  stopNatureButton.disabled = false;
  natureStatus.textContent = 'Starting soft garden sounds…';
  try {
    // User click starts both real field recordings. Loop them as a soft bed,
    // fading in to avoid an abrupt start.
    await Promise.all([natureWindAudio.play(), natureBirdsAudio.play()]);
    if (startToken !== natureStartToken) { natureWindAudio.pause(); natureBirdsAudio.pause(); return; }
    natureStarting = false;
    naturePlaying = true;
    fadeNatureAudio(Number(natureVolumeInput.value) / 100, 700);
    natureStatus.textContent = 'Soft breeze and birds are playing.';
  } catch {
    if (startToken !== natureStartToken) return;
    natureWindAudio.pause(); natureBirdsAudio.pause();
    naturePlaying = false; natureStarting = false;
    playNatureButton.disabled = false; stopNatureButton.disabled = true;
    natureStatus.textContent = 'Garden audio could not load. Please check the audio files or browser audio support.';
  }
}
function fadeNatureAudio(target, duration = 220, onComplete = null) {
  if (natureFadeTimer) window.clearInterval(natureFadeTimer);
  const tracks = [natureWindAudio, natureBirdsAudio];
  const starts = tracks.map(track => track.volume);
  const startedAt = performance.now();
  natureFadeTimer = window.setInterval(() => {
    const progress = Math.min(1, (performance.now() - startedAt) / duration);
    tracks.forEach((track, index) => { track.volume = Math.max(0, Math.min(1, starts[index] + (target - starts[index]) * progress)); });
    if (progress >= 1) {
      window.clearInterval(natureFadeTimer); natureFadeTimer = null;
      if (onComplete) onComplete();
    }
  }, 30);
}
function stopNatureSounds(updateStatus = true) {
  natureStartToken++;
  const wasPlaying = naturePlaying;
  natureStarting = false;
  naturePlaying = false;
  playNatureButton.disabled = false; stopNatureButton.disabled = true;
  if (natureFadeTimer) window.clearInterval(natureFadeTimer);
  natureFadeTimer = null;
  if (wasPlaying) fadeNatureAudio(0, 350, () => {
    natureWindAudio.pause(); natureBirdsAudio.pause();
    natureWindAudio.currentTime = 0; natureBirdsAudio.currentTime = 0;
    natureWindAudio.volume = Number(natureVolumeInput.value) / 100;
    natureBirdsAudio.volume = Number(natureVolumeInput.value) / 100;
  });
  else { natureWindAudio.pause(); natureBirdsAudio.pause(); }
  if (updateStatus) natureStatus.textContent = 'Nature sounds stopped.';
}
playNatureButton.addEventListener('click', playNatureSounds);
stopNatureButton.addEventListener('click', () => stopNatureSounds(true));
natureVolumeInput.addEventListener('input', () => {
  const percent = Number(natureVolumeInput.value);
  natureVolumeValue.value = `${percent}%`;
  natureVolumeValue.textContent = `${percent}%`;
  natureVolumeInput.setAttribute('aria-valuetext', `${percent} percent`);
  if (naturePlaying) fadeNatureAudio(percent / 100, 180);
});

// Cognitive Games use the same clear household-object pictures across five games.
const extraCognitiveObjects = [
  { id: 'plate', name: 'Plate', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#f8eade"/><circle cx="90" cy="94" r="54" fill="#fff" stroke="#b58c69" stroke-width="7"/><circle cx="90" cy="94" r="37" fill="#faf3e7" stroke="#e3cdb4" stroke-width="5"/><path d="M72 99c0-13 11-21 21-21 13 0 21 8 21 21v16H72Z" fill="#e88956"/><path d="M83 78c1-10 7-13 13-12m-21 7c1-7 5-10 9-11" stroke="#6f9c63" stroke-width="5" stroke-linecap="round"/></svg>', useId: 'eat', useHint: 'A plate can hold your meal.' },
  { id: 'flower', name: 'Flower', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#f8eee5"/><path d="M90 101v48m0-25-24-17m24 30 25-19" fill="none" stroke="#5e9667" stroke-width="9" stroke-linecap="round"/><path d="M90 41c10-18 33-7 24 10 20-9 30 14 10 23 18 11 6 33-13 23 2 22-23 27-26 6-9 19-32 10-24-10-20 9-30-14-10-23-18-11-6-33 13-23-2-21 23-27 26-6Z" fill="#df91a1"/><circle cx="90" cy="77" r="15" fill="#f1cb69"/></svg>' },
  { id: 'key', name: 'Key', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#f3efdc"/><circle cx="59" cy="70" r="26" fill="none" stroke="#c69e47" stroke-width="13"/><circle cx="59" cy="70" r="8" fill="#f3efdc"/><path d="m78 88 48 48m-16-16 14-14m-27 1 14-14" fill="none" stroke="#c69e47" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
  { id: 'ball', name: 'Ball', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#e8f0f6"/><circle cx="90" cy="92" r="52" fill="#e9765c" stroke="#b85446" stroke-width="6"/><path d="M54 55c20 19 23 55 3 75m70-76c-20 19-23 55-3 75M39 92h102" fill="none" stroke="#fff0dc" stroke-width="7" stroke-linecap="round"/></svg>' }
];
const cognitiveObjects = [
  ...helperObjects.map(item => ({ id: item.id, name: item.name, art: item.art, useId: ({ water: 'drink', apple: 'eat', shirt: 'dress', toothbrush: 'brush', phone: 'call' })[item.id], useHint: ({ water: 'A glass holds a drink.', apple: 'An apple is a snack you can eat.', shirt: 'A shirt is something you can wear.', toothbrush: 'A toothbrush helps clean your teeth.', phone: 'A phone helps you call someone.' })[item.id] })),
  ...extraCognitiveObjects
];
const cognitiveUses = [
  { id: 'brush', label: 'Clean teeth', hint: 'You use a toothbrush with toothpaste.', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#e7f2eb"/><path d="M43 92c8-31 31-45 49-45s41 14 49 45c-8 29-31 43-49 43S51 121 43 92Z" fill="#e88b87"/><path d="M58 87c9-8 18-8 27 0m10 0c9-8 18-8 27 0" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round"/><path d="M62 105h56" stroke="#fff7e8" stroke-width="8" stroke-linecap="round"/><path d="M85 44q5-12 10 0m18 1q5-12 10 0" stroke="#81b4c0" stroke-width="5" stroke-linecap="round"/></svg>' },
  { id: 'drink', label: 'Have a drink', hint: 'You can sip water from a glass.', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#e7f2f4"/><path d="M53 48h74l-9 100H62L53 48Z" fill="#fff" stroke="#476c72" stroke-width="6" stroke-linejoin="round"/><path d="m59 96 62 0-5 47H64l-5-47Z" fill="#88c9dc"/><path d="M60 94c13-6 21 6 34 0 13-6 19 5 28 0" fill="none" stroke="#58a9c4" stroke-width="5" stroke-linecap="round"/><path d="M65 39h43" stroke="#79958b" stroke-width="6" stroke-linecap="round"/><path d="m109 39 12-12" stroke="#79958b" stroke-width="5" stroke-linecap="round"/></svg>' },
  { id: 'eat', label: 'Eat a meal', hint: 'A plate can hold your meal.', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#f8eade"/><circle cx="90" cy="94" r="51" fill="#fff" stroke="#b58c69" stroke-width="6"/><circle cx="90" cy="94" r="35" fill="#faf3e7" stroke="#e3cdb4" stroke-width="4"/><path d="M72 97c0-11 10-18 20-18 10 0 17 6 17 16v18H72V97Z" fill="#e88956"/><path d="M84 78c2-9 7-12 12-11" stroke="#6f9c63" stroke-width="5" stroke-linecap="round"/></svg>' },
  { id: 'dress', label: 'Get dressed', hint: 'You can wear a shirt on your upper body.', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#e9edf8"/><circle cx="90" cy="47" r="19" fill="#e3ae87"/><path d="M57 78q33-18 66 0l15 64H42Z" fill="#688fc6" stroke="#3e608e" stroke-width="6" stroke-linejoin="round"/><path d="m77 77 13 18 13-18m-13 18v45" fill="none" stroke="#eaf1fc" stroke-width="5" stroke-linecap="round"/></svg>' },
  { id: 'call', label: 'Call someone', hint: 'A phone helps you talk with family and friends.', art: '<svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="82" fill="#eee8f6"/><circle cx="71" cy="76" r="19" fill="#dfa77c"/><circle cx="111" cy="76" r="19" fill="#c98469"/><path d="M37 133c3-27 16-40 34-40s31 13 34 40m-8 0c3-27 16-40 34-40 10 0 20 7 26 19" fill="#749d88"/><path d="M79 56q11-15 23 0m-30-12q18-23 37 0" fill="none" stroke="#657b86" stroke-width="6" stroke-linecap="round"/></svg>' }
];
const cognitiveGameInfo = {
  matching: { title: 'Match Identical Pictures', icon: 'apple', rounds: [0, 0, 0], prompts: ['Turn over two pictures. Find a pair.'] },
  missing: { title: 'Find the Missing Object', icon: 'key', rounds: [2, 3, 4] },
  uses: { title: 'Match Objects to Their Uses', icon: 'toothbrush', rounds: [2, 3, 4] },
  remember: { title: 'Remember and Find the Picture', icon: 'flower', rounds: [2, 3, 4] },
  identify: { title: 'Identify Familiar Objects', icon: 'phone', rounds: [2, 3, 4] }
};
const COGNITIVE_PROGRESS_KEY = 'neuark-cognitive-progress-v1';
let cognitiveProgress = loadCognitiveProgress();
let activeCognitiveGame = null;
let activeCognitiveLevel = 1;
let cognitiveRoundIndex = 0;
let cognitiveRoundTarget = null;
let cognitiveRoundOptions = [];
let cognitivePhase = '';
let cognitiveAnswered = false;
let cognitiveLastSpeech = '';
let cognitiveSelectedCards = [];
let cognitiveMatchedCards = new Set();
let cognitivePairCount = 0;
let cognitiveMismatchTimer = null;
let cognitiveHintTimer = null;
let cognitiveRoundDeck = [];
let cognitiveTray = [];
let cognitiveLevelFinished = false;

function loadCognitiveProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(COGNITIVE_PROGRESS_KEY) || '{}');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
    const clean = {};
    for (const gameId of Object.keys(cognitiveGameInfo)) {
      if (Array.isArray(saved[gameId])) clean[gameId] = [...new Set(saved[gameId].filter(level => Number.isInteger(level) && level >= 1 && level <= 3))].sort((a, b) => a - b);
    }
    return clean;
  } catch { return {}; }
}
function saveCognitiveLevel(gameId, level) {
  const existing = Array.isArray(cognitiveProgress[gameId]) ? cognitiveProgress[gameId] : [];
  if (!existing.includes(level)) existing.push(level);
  cognitiveProgress[gameId] = existing.sort((a, b) => a - b);
  try { localStorage.setItem(COGNITIVE_PROGRESS_KEY, JSON.stringify(cognitiveProgress)); }
  catch { document.querySelector('#cognitiveVoiceStatus').textContent = 'This level is complete, but progress could not be saved on this device.'; }
  renderCognitiveProgress();
}
function renderCognitiveProgress() {
  document.querySelectorAll('[data-progress-for]').forEach(label => {
    const levels = cognitiveProgress[label.dataset.progressFor] || [];
    label.textContent = levels.length ? `Done: ${levels.map(level => `Level ${level}`).join(', ')}` : 'Choose any level';
  });
}
function openCognitiveGames() {
  cancelCurrentSpeech();
  homeView.hidden = true; lifeView.hidden = true; gameView.hidden = true; helperView.hidden = true; routineView.hidden = true; gardenView.hidden = true; cognitiveView.hidden = false;
  document.querySelector('#cognitiveMenu').hidden = false;
  document.querySelector('#cognitivePlay').hidden = true;
  renderCognitiveProgress();
  cognitiveView.focus();
}
function showCognitiveMenu(status = '') {
  clearCognitiveTimers(); cancelCurrentSpeech();
  document.querySelector('#cognitivePlay').hidden = true;
  document.querySelector('#cognitiveMenu').hidden = false;
  document.querySelector('#cognitiveMenuStatus').textContent = status;
  renderCognitiveProgress();
  document.querySelector('#cognitiveTitle').focus();
}
function leaveCognitiveGames() {
  clearCognitiveTimers(); cancelCurrentSpeech();
  cognitiveView.hidden = true; homeView.hidden = false;
  document.querySelector('[data-feature="games"]').focus();
}
document.querySelector('#cognitiveHome').addEventListener('click', leaveCognitiveGames);
document.querySelector('#cognitivePlayHome').addEventListener('click', leaveCognitiveGames);
document.querySelector('#cognitiveMenuButton').addEventListener('click', () => showCognitiveMenu());
document.querySelectorAll('[data-cognitive-game]').forEach(button => button.addEventListener('click', () => startCognitiveLevel(button.dataset.cognitiveGame, Number(button.dataset.cognitiveLevel))));

for (const [gameId, info] of Object.entries(cognitiveGameInfo)) {
  const icon = cognitiveObjects.find(item => item.id === info.icon);
  document.querySelector(`#cognitiveIcon-${gameId}`).innerHTML = icon.art;
}

function clearCognitiveTimers() {
  if (cognitiveMismatchTimer) window.clearTimeout(cognitiveMismatchTimer);
  if (cognitiveHintTimer) window.clearTimeout(cognitiveHintTimer);
  cognitiveMismatchTimer = null; cognitiveHintTimer = null;
}
function randomItems(items, count) { return shuffle([...items]).slice(0, count); }
function startCognitiveLevel(gameId, level) {
  if (!cognitiveGameInfo[gameId] || level < 1 || level > 3) return;
  clearCognitiveTimers(); cancelCurrentSpeech();
  activeCognitiveGame = gameId; activeCognitiveLevel = level;
  cognitiveRoundIndex = 0; cognitiveLevelFinished = false;
  cognitiveSelectedCards = []; cognitiveMatchedCards = new Set();
  cognitivePairCount = [3, 4, 6][level - 1];
  cognitiveRoundDeck = shuffle(gameId === 'uses'
    ? cognitiveObjects.filter(item => cognitiveUses.some(use => use.id === item.useId))
    : [...cognitiveObjects]);
  document.querySelector('#cognitiveMenu').hidden = true;
  document.querySelector('#cognitivePlay').hidden = false;
  document.querySelector('#cognitivePlayTitle').textContent = cognitiveGameInfo[gameId].title;
  document.querySelector('#cognitiveLevelBadge').textContent = `Level ${level}`;
  document.querySelector('#cognitiveNextRound').hidden = true;
  document.querySelector('#cognitiveNextLevel').hidden = true;
  document.querySelector('#cognitiveHint').disabled = false;
  const voiceGuides = {
    matching: 'Turn over two pictures. Look for two that are the same. Take your time.',
    missing: 'Look at the pictures and try to remember them. One will be missing.',
    uses: 'Look at the object. Choose a picture that shows what it is used for.',
    remember: 'Look carefully at the picture. When you are ready, hide it and find it again.',
    identify: 'Listen to the clue and choose the familiar object that fits.'
  };
  cognitiveLastSpeech = voiceGuides[gameId];
  document.querySelector('#cognitiveVoiceStatus').textContent = 'Tap Repeat Voice to hear the instructions.';
  if (gameId === 'matching') buildMatchingBoard();
  else prepareCognitiveRound();
  document.querySelector('#cognitivePlayTitle').focus();
}
function cognitiveIcon(item, className = 'cognitive-picture-art') {
  const art = document.createElement('span'); art.className = className; art.innerHTML = item.art; art.setAttribute('aria-hidden', 'true'); return art;
}
function buildMatchingBoard() {
  cognitivePhase = 'matching';
  cognitiveAnswered = false;
  const chosen = randomItems(cognitiveObjects, cognitivePairCount);
  const deck = shuffle(chosen.flatMap(item => [item, item]));
  const stage = document.querySelector('#cognitiveStage'); stage.replaceChildren(); stage.className = 'cognitive-stage matching-stage';
  document.querySelector('#cognitiveRoundStatus').textContent = `${cognitiveMatchedCards.size / 2} of ${cognitivePairCount} pairs found`;
  document.querySelector('#cognitivePrompt').textContent = 'Turn over two pictures. Find a pair.';
  document.querySelector('#cognitiveFeedback').className = 'cognitive-feedback';
  document.querySelector('#cognitiveFeedback').textContent = 'Take your time. There is no rush.';
  document.querySelector('#cognitiveNextRound').hidden = true;
  const board = document.createElement('div'); board.className = 'matching-board'; board.setAttribute('role', 'group'); board.setAttribute('aria-label', `${cognitivePairCount * 2} picture cards`);
  deck.forEach((item, index) => {
    const card = document.createElement('button'); card.type = 'button'; card.className = 'match-card'; card.dataset.cardIndex = String(index); card.dataset.itemId = item.id; card.setAttribute('aria-label', `Picture card ${index + 1}, face down`);
    const back = document.createElement('span'); back.className = 'match-card-back'; back.setAttribute('aria-hidden', 'true'); back.textContent = '✿';
    const face = cognitiveIcon(item, 'match-card-face'); face.setAttribute('aria-hidden', 'true');
    card.append(back, face); card.addEventListener('click', () => chooseMatchingCard(index)); board.append(card);
  });
  stage.append(board);
  window.cognitiveMatchDeck = deck;
}
function updateMatchingCard(index, { flipped = false, matched = false, hint = false } = {}) {
  const card = document.querySelector(`.match-card[data-card-index="${index}"]`);
  const item = window.cognitiveMatchDeck?.[index];
  if (!card || !item) return;
  card.classList.toggle('is-flipped', flipped || matched);
  card.classList.toggle('is-matched', matched);
  card.classList.toggle('is-hint', hint);
  card.disabled = matched;
  card.setAttribute('aria-label', matched ? `Picture card ${index + 1}, matched ${item.name}` : flipped ? `Picture card ${index + 1}, ${item.name}` : `Picture card ${index + 1}, face down`);
}
function chooseMatchingCard(index) {
  if (cognitiveLevelFinished || cognitiveMismatchTimer || cognitiveMatchedCards.has(index) || cognitiveSelectedCards.includes(index)) return;
  cognitiveSelectedCards.push(index);
  updateMatchingCard(index, { flipped: true });
  if (cognitiveSelectedCards.length < 2) {
    document.querySelector('#cognitiveFeedback').textContent = 'Now find the same picture.';
    return;
  }
  const [first, second] = cognitiveSelectedCards;
  const deck = window.cognitiveMatchDeck;
  if (deck[first].id === deck[second].id) {
    cognitiveMatchedCards.add(first); cognitiveMatchedCards.add(second);
    updateMatchingCard(first, { matched: true }); updateMatchingCard(second, { matched: true });
    cognitiveSelectedCards = [];
    const pairs = cognitiveMatchedCards.size / 2;
    document.querySelector('#cognitiveRoundStatus').textContent = `${pairs} of ${cognitivePairCount} pairs found`;
    document.querySelector('#cognitiveFeedback').textContent = 'Lovely matching. You found two the same.';
    speakCognitive('Lovely matching. You found two pictures that are the same.');
    if (pairs === cognitivePairCount) finishCognitiveLevel();
    else document.querySelector('.match-card:not(:disabled)')?.focus();
  } else {
    document.querySelector('#cognitiveFeedback').textContent = "That's okay. Those pictures are different. Let's try again.";
    speakCognitive("That's okay. Those pictures are different. Let's try again.");
    cognitiveMismatchTimer = window.setTimeout(() => {
      updateMatchingCard(first); updateMatchingCard(second); cognitiveSelectedCards = []; cognitiveMismatchTimer = null;
    }, 1100);
  }
}
function prepareCognitiveRound() {
  if (cognitiveRoundIndex >= cognitiveGameInfo[activeCognitiveGame].rounds[activeCognitiveLevel - 1]) { finishCognitiveLevel(); return; }
  cognitiveAnswered = false; cognitiveRoundTarget = null; cognitiveRoundOptions = [];
  cognitivePhase = 'answer';
  const totalRounds = cognitiveGameInfo[activeCognitiveGame].rounds[activeCognitiveLevel - 1];
  cognitiveRoundIndex++;
  document.querySelector('#cognitiveRoundStatus').textContent = `Picture ${cognitiveRoundIndex} of ${totalRounds}`;
  document.querySelector('#cognitiveFeedback').className = 'cognitive-feedback';
  document.querySelector('#cognitiveFeedback').textContent = 'Take your time. There is no rush.';
  document.querySelector('#cognitiveNextRound').hidden = true;
  document.querySelector('#cognitiveNextLevel').hidden = true;
  document.querySelector('#cognitiveHint').disabled = false;
  const stage = document.querySelector('#cognitiveStage'); stage.replaceChildren(); stage.className = 'cognitive-stage';

  if (activeCognitiveGame === 'missing') {
    const itemCount = [3, 4, 5][activeCognitiveLevel - 1];
    cognitiveTray = randomItems(cognitiveObjects, itemCount);
    cognitiveRoundTarget = cognitiveTray[Math.floor(Math.random() * cognitiveTray.length)];
    const distractorCount = [2, 3, 4][activeCognitiveLevel - 1];
    cognitiveRoundOptions = shuffle([cognitiveRoundTarget, ...randomItems(cognitiveObjects.filter(item => !cognitiveTray.some(trayItem => trayItem.id === item.id)), distractorCount)]);
    cognitivePhase = 'look';
    document.querySelector('#cognitivePrompt').textContent = 'Look at these pictures. Try to remember them.';
    renderMemoryTray(cognitiveTray);
    const ready = document.createElement('button'); ready.type = 'button'; ready.className = 'primary-button cognitive-ready'; ready.textContent = 'Ready to choose'; ready.addEventListener('click', showMissingChoices); stage.append(ready);
    ready.focus();
  } else if (activeCognitiveGame === 'uses') {
    cognitiveRoundTarget = cognitiveRoundDeck[(cognitiveRoundIndex - 1) % cognitiveRoundDeck.length];
    const correctUse = cognitiveUses.find(use => use.id === cognitiveRoundTarget.useId);
    const count = [3, 4, 5][activeCognitiveLevel - 1];
    cognitiveRoundOptions = shuffle([correctUse, ...randomItems(cognitiveUses.filter(use => use.id !== correctUse.id), count - 1)]);
    document.querySelector('#cognitivePrompt').textContent = 'What do we use this for?';
    renderTargetPicture(cognitiveRoundTarget, 'Look at the object.');
    renderCognitiveAnswers(cognitiveRoundOptions, 'use');
    cognitiveLastSpeech = `What do we use this ${cognitiveRoundTarget.name.toLowerCase()} for?`;
  } else if (activeCognitiveGame === 'remember') {
    cognitiveRoundTarget = cognitiveRoundDeck[(cognitiveRoundIndex - 1) % cognitiveRoundDeck.length];
    cognitiveRoundOptions = shuffle([cognitiveRoundTarget, ...randomItems(cognitiveObjects.filter(item => item.id !== cognitiveRoundTarget.id), [2, 4, 6][activeCognitiveLevel - 1])]);
    cognitivePhase = 'preview';
    document.querySelector('#cognitivePrompt').textContent = 'Look carefully. Tap Hide picture when you are ready.';
    renderTargetPicture(cognitiveRoundTarget, 'Picture to remember.');
    const hide = document.createElement('button'); hide.type = 'button'; hide.className = 'primary-button cognitive-ready'; hide.textContent = 'Hide picture'; hide.addEventListener('click', showRememberChoices); stage.append(hide);
    cognitiveLastSpeech = 'Look carefully at the picture. Tap Hide picture when you are ready.';
    hide.focus();
  } else {
    cognitiveRoundTarget = cognitiveRoundDeck[(cognitiveRoundIndex - 1) % cognitiveRoundDeck.length];
    cognitiveRoundOptions = shuffle([cognitiveRoundTarget, ...randomItems(cognitiveObjects.filter(item => item.id !== cognitiveRoundTarget.id), [2, 4, 6][activeCognitiveLevel - 1])]);
    const clues = {
      water: 'You can sip a cool drink from this.', apple: 'This fruit makes a crunchy snack.', shirt: 'You can wear this over your top half.', toothbrush: 'You use this with toothpaste, morning and night.', phone: 'Use this to call or talk with a friend.', plate: 'This holds food for your meal.', flower: 'It has petals and grows in a garden.', key: 'It can help open a locked door.', ball: 'You can roll or toss this when playing.'
    };
    const clue = clues[cognitiveRoundTarget.id];
    document.querySelector('#cognitivePrompt').textContent = clue;
    cognitiveLastSpeech = `Here is a clue. ${clue} What is it?`;
    renderCognitiveAnswers(cognitiveRoundOptions, 'object');
  }
}
function renderMemoryTray(items) {
  const stage = document.querySelector('#cognitiveStage');
  const tray = document.createElement('div'); tray.className = 'cognitive-memory-tray'; tray.setAttribute('role', 'group'); tray.setAttribute('aria-label', 'Pictures to remember');
  items.forEach(item => {
    const card = document.createElement('div'); card.className = 'cognitive-memory-item'; card.setAttribute('role', 'img'); card.setAttribute('aria-label', item.name); card.append(cognitiveIcon(item)); tray.append(card);
  });
  stage.replaceChildren(tray);
}
function renderTargetPicture(item, label) {
  const stage = document.querySelector('#cognitiveStage');
  const target = document.createElement('div'); target.className = 'cognitive-target-picture'; target.setAttribute('role', 'img'); target.setAttribute('aria-label', label); target.append(cognitiveIcon(item)); stage.append(target);
}
function showMissingChoices() {
  if (cognitivePhase !== 'look') return;
  cognitivePhase = 'answer';
  const remaining = cognitiveTray.filter(item => item.id !== cognitiveRoundTarget.id);
  const stage = document.querySelector('#cognitiveStage'); stage.replaceChildren();
  const missing = document.createElement('p'); missing.className = 'cognitive-small-prompt'; missing.textContent = 'One picture is missing. Which one was there?'; stage.append(missing);
  renderMemoryTray(remaining);
  const answers = document.createElement('div'); answers.className = 'cognitive-answer-grid';
  cognitiveRoundOptions.forEach(item => answers.append(createCognitiveAnswer(item, 'object')));
  stage.append(answers);
  cognitiveLastSpeech = 'One picture is missing. Which one did you see?';
  document.querySelector('.cognitive-answer')?.focus();
}
function showRememberChoices() {
  if (cognitivePhase !== 'preview') return;
  cognitivePhase = 'answer';
  document.querySelector('#cognitivePrompt').textContent = 'Find the picture you just saw.';
  const stage = document.querySelector('#cognitiveStage'); stage.replaceChildren();
  const answers = document.createElement('div'); answers.className = 'cognitive-answer-grid';
  cognitiveRoundOptions.forEach(item => answers.append(createCognitiveAnswer(item, 'object')));
  stage.append(answers); cognitiveLastSpeech = 'Find the picture you just saw.';
  document.querySelector('.cognitive-answer')?.focus();
}
function renderCognitiveAnswers(options, type) {
  const stage = document.querySelector('#cognitiveStage');
  const answers = document.createElement('div'); answers.className = 'cognitive-answer-grid';
  options.forEach(item => answers.append(createCognitiveAnswer(item, type)));
  stage.append(answers);
}
function createCognitiveAnswer(item, type) {
  const button = document.createElement('button'); button.type = 'button'; button.className = 'cognitive-answer';
  button.dataset.answerId = item.id;
  const visibleLabel = type === 'use' ? item.label : item.name;
  button.setAttribute('aria-label', visibleLabel);
  button.append(cognitiveIcon(item, 'cognitive-answer-art'));
  const label = document.createElement('span'); label.className = 'cognitive-answer-label'; label.textContent = visibleLabel; button.append(label);
  button.addEventListener('click', () => answerCognitive(item, button, type));
  return button;
}
function speakCognitive(text) {
  cognitiveLastSpeech = text;
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    setVoiceStatus('speechUnsupported'); return;
  }
  speakWithSelectedLanguage(text, 0.78, 1);
}
function setCognitiveFeedback(text, speak = true, className = 'cognitive-feedback') {
  const feedback = document.querySelector('#cognitiveFeedback');
  feedback.className = className; feedback.textContent = text;
  if (speak) speakCognitive(text);
}
function finishCognitiveLevel() {
  if (cognitiveLevelFinished) return;
  cognitiveLevelFinished = true;
  document.querySelector('#cognitiveNextRound').hidden = true;
  const nextLevel = document.querySelector('#cognitiveNextLevel');
  nextLevel.hidden = false;
  nextLevel.textContent = 'Next Level';
  const message = `Wonderful work. You finished Level ${activeCognitiveLevel}.`;
  setCognitiveFeedback(message, true, 'cognitive-feedback cognitive-kind-feedback');
  saveCognitiveLevel(activeCognitiveGame, activeCognitiveLevel);
  nextLevel.focus();
}
function answerCognitive(item, button, type) {
  if (cognitiveAnswered || cognitiveLevelFinished) return;
  cognitiveAnswered = true;
  document.querySelector('#cognitiveHint').disabled = true;
  document.querySelectorAll('#cognitiveStage .cognitive-answer').forEach(answer => { answer.disabled = true; });
  let isCorrect = false;
  let answerText = '';
  if (activeCognitiveGame === 'uses') {
    isCorrect = item.id === cognitiveRoundTarget.useId;
    const correctUse = cognitiveUses.find(use => use.id === cognitiveRoundTarget.useId);
    answerText = `${cognitiveRoundTarget.name} is used to ${correctUse.label.toLowerCase()}.`;
  } else {
    isCorrect = item.id === cognitiveRoundTarget.id;
    answerText = `This is the ${cognitiveRoundTarget.name.toLowerCase()}.`;
  }
  const correctButton = document.querySelector(`#cognitiveStage .cognitive-answer[data-answer-id="${activeCognitiveGame === 'uses' ? cognitiveRoundTarget.useId : cognitiveRoundTarget.id}"]`);
  correctButton?.classList.add('cognitive-answer-correct');
  if (isCorrect) {
    setCognitiveFeedback(`That's right! ${answerText} Well done.`, true, 'cognitive-feedback cognitive-kind-feedback');
  } else {
    button.classList.add('cognitive-answer-gentle');
    setCognitiveFeedback(`Good try. ${answerText} That's all right.`, true, 'cognitive-feedback cognitive-kind-feedback');
  }
  if (cognitiveRoundIndex < cognitiveGameInfo[activeCognitiveGame].rounds[activeCognitiveLevel - 1]) {
    const nextRound = document.querySelector('#cognitiveNextRound');
    nextRound.hidden = false; nextRound.textContent = 'Next picture'; nextRound.focus();
  } else finishCognitiveLevel();
}
function nextCognitiveRound() {
  clearCognitiveTimers();
  prepareCognitiveRound();
  const firstButton = document.querySelector('#cognitiveStage .cognitive-ready, #cognitiveStage .cognitive-answer');
  firstButton?.focus();
}
function cognitiveGameHint() {
  if (cognitiveLevelFinished) {
    setCognitiveFeedback('You did it. Choose Next Level when you are ready.', true, 'cognitive-feedback cognitive-kind-feedback'); return;
  }
  if (activeCognitiveGame === 'matching') {
    clearCognitiveTimers();
    const deck = window.cognitiveMatchDeck || [];
    const first = deck.findIndex((item, index) => !cognitiveMatchedCards.has(index) && deck.some((other, otherIndex) => otherIndex !== index && !cognitiveMatchedCards.has(otherIndex) && other.id === item.id));
    const second = deck.findIndex((item, index) => index !== first && !cognitiveMatchedCards.has(index) && item.id === deck[first]?.id);
    if (first >= 0 && second >= 0) {
      if (cognitiveSelectedCards.length) { cognitiveSelectedCards.forEach(index => updateMatchingCard(index)); cognitiveSelectedCards = []; }
      updateMatchingCard(first, { flipped: true, hint: true }); updateMatchingCard(second, { flipped: true, hint: true });
      setCognitiveFeedback('Here are two pictures that are the same.', true);
      cognitiveHintTimer = window.setTimeout(() => {
        const firstMatched = cognitiveMatchedCards.has(first); const secondMatched = cognitiveMatchedCards.has(second);
        updateMatchingCard(first, { flipped: firstMatched, matched: firstMatched }); updateMatchingCard(second, { flipped: secondMatched, matched: secondMatched }); cognitiveHintTimer = null;
      }, 2200);
    }
  } else if (activeCognitiveGame === 'missing') {
    const message = cognitivePhase === 'look' ? 'Take a good look at these pictures. One will be missing.' : 'Try to remember the pictures you saw. One is missing.';
    setCognitiveFeedback(message, true);
  } else if (activeCognitiveGame === 'uses') {
    const use = cognitiveUses.find(candidate => candidate.id === cognitiveRoundTarget.useId);
    setCognitiveFeedback(use.hint, true);
  } else if (activeCognitiveGame === 'remember') {
    if (cognitivePhase === 'preview') setCognitiveFeedback('Look at the picture. Take your time.', true);
    else if (!cognitiveAnswered) {
      const stage = document.querySelector('#cognitiveStage');
      let preview = stage.querySelector('.cognitive-hint-preview');
      if (!preview) { preview = document.createElement('div'); preview.className = 'cognitive-hint-preview'; preview.setAttribute('role', 'img'); preview.setAttribute('aria-label', 'A quick look at the picture to remember'); preview.append(cognitiveIcon(cognitiveRoundTarget)); stage.prepend(preview); }
      setCognitiveFeedback('Here is a quick look. Take your time.', true);
      if (cognitiveHintTimer) window.clearTimeout(cognitiveHintTimer);
      cognitiveHintTimer = window.setTimeout(() => { preview.remove(); cognitiveHintTimer = null; }, 2500);
    }
  } else if (activeCognitiveGame === 'identify') {
    setCognitiveFeedback(cognitiveRoundTarget.useHint || 'Think about what this object can do.', true);
  }
}
document.querySelector('#cognitiveRepeatVoice').addEventListener('click', () => speakCognitive(cognitiveLastSpeech || 'Take your time. We can do this together.'));
document.querySelector('#cognitiveHint').addEventListener('click', cognitiveGameHint);
document.querySelector('#cognitiveStopVoice').addEventListener('click', () => {
  if ('speechSynthesis' in window) cancelCurrentSpeech();
  setVoiceStatus('stopped');
});
document.querySelector('#cognitiveNextRound').addEventListener('click', nextCognitiveRound);
document.querySelector('#cognitiveNextLevel').addEventListener('click', () => {
  if (activeCognitiveLevel < 3) startCognitiveLevel(activeCognitiveGame, activeCognitiveLevel + 1);
  else showCognitiveMenu('You finished all three levels. Wonderful work. Choose another game whenever you like.');
});
buildCognitiveMenuProgress();
function buildCognitiveMenuProgress() { renderCognitiveProgress(); }

// The assistant keeps voice input and spoken guidance in the user's chosen language.
const VOICE_LANGUAGE_KEY = 'neuark-voice-language-v1';
const voiceLanguages = {
  'ta-IN': {
    name: 'Tamil', native: 'தமிழ்', voices: ['ta-IN'],
    ui: { speak: 'வழிமுறைகளைக் கேளுங்கள்', repeat: 'மீண்டும்', hint: 'உதவி', stop: 'குரலை நிறுத்து', listen: 'குரல் கட்டளை', stopListening: 'கேட்பதை நிறுத்து', choose: 'மொழியைத் தேர்வு செய்', dialog: 'குரல் உதவி', language: 'தேர்ந்தெடுத்த மொழி' },
    status: { selected: 'தமிழ் தேர்ந்தெடுக்கப்பட்டது.', listening: 'நான் கேட்கிறேன். மெதுவாகப் பேசுங்கள்.', speaking: 'வழிமுறைகளை மெதுவாகச் சொல்கிறேன்.', stopped: 'குரல் நிறுத்தப்பட்டது.', stoppedListening: 'கேட்பது நிறுத்தப்பட்டது.', notRecognized: 'மன்னிக்கவும், புரியவில்லை. பொத்தான்களைப் பயன்படுத்தலாம்.', permission: 'மைக்ரோஃபோன் அனுமதி தேவை. அனுமதியைச் சரிபார்க்கவும்.', noSpeech: 'குரல் கேட்கவில்லை. மீண்டும் முயற்சி செய்யுங்கள்.', network: 'குரல் சேவை இப்போது கிடைக்கவில்லை.', mic: 'மைக்ரோஃபோன் கிடைக்கவில்லை.', recognitionUnsupported: 'இந்த உலாவியில் குரல் உள்ளீடு கிடைக்கவில்லை. தொடுதலைப் பயன்படுத்தலாம்.', languageUnsupported: 'இந்த உலாவியில் இந்த மொழிக்கான குரல் உள்ளீடு இல்லை.', speechUnsupported: 'இந்த உலாவியில் குரல் வாசிப்பு இல்லை. திரையில் உள்ள வழிமுறைகளைப் பின்பற்றலாம்.', error: 'குரல் உதவி இப்போது கிடைக்கவில்லை.', commandDone: 'சரி. செய்து முடித்தேன்.' },
    instructions: { smart: "இந்த உதவியாளர் இணையதளத்தைப் பயன்படுத்த உதவும். செயல்பாடுகளைத் திறக்கவும் வழிமுறைகளை மீண்டும் கேட்கவும் சொல்லலாம். பிற கேள்விகளுக்கு குடும்பத்தினர் அல்லது பராமரிப்பாளரிடம் கேளுங்கள்.", home: 'வணக்கம். படங்களில் ஒன்றைத் தேர்ந்தெடுத்து தொடங்கலாம். அவசரம் இல்லை.', life: 'ஒரு புகைப்படத்தையும் பெயரையும் சேர்க்கலாம். படத்தைத் தட்டினால் அந்த நபரைப் பற்றிக் கேட்கலாம்.', helper: 'படத்தைப் பாருங்கள். கீழே உள்ள பொருத்தமான படத்தைத் தேர்ந்தெடுக்கலாம்.', garden: 'அமைதியாக அமருங்கள். மெதுவாக மூச்சை உள்ளிழுத்து வெளியே விடுங்கள்.', family: 'படத்தில் யார் இருக்கிறார் என்று பாருங்கள். குடும்ப உறுப்பினரின் படத்தைத் தேர்ந்தெடுக்கலாம்.', routine: 'இன்றைய திட்டம்: எழுந்திருங்கள், பல் துலக்குங்கள், குளியுங்கள், சாப்பிடுங்கள், தண்ணீர் குடியுங்கள், நடந்து செல்லுங்கள், தூங்கத் தயாராகுங்கள்.', cognitive: 'ஒரு விளையாட்டையும் நிலையையும் தேர்ந்தெடுக்கலாம். படங்களைப் பின்பற்றுங்கள். அவசரம் இல்லை.', voice: 'மொழியைத் தேர்ந்தெடுங்கள். வழிமுறைகளைக் கேட்கலாம், மீண்டும் கேட்கலாம், அல்லது குரலில் கேள்வி கேட்கலாம்.' },
    hints: { smart: "இந்த இணையதளத்தில் ஒரு செயல்பாட்டைத் திறக்கச் சொல்லுங்கள். வழிமுறைகளை மீண்டும் கேட்கவும் உதவி கேட்கலாம்.", home: 'விரும்பிய செயலைத் தொடங்க ஒரு பெரிய படத்தைத் தட்டுங்கள்.', life: 'குடும்பத்தினர் புகைப்படத்தையும் பெயரையும் சேர்க்கலாம்.', helper: 'பொருளைப் பார்த்து, அதே படத்தைத் தேர்ந்தெடுக்கலாம்.', garden: 'மலர், மரம், பறவை அல்லது குளத்தைத் தட்டிப் பாருங்கள்.', family: 'படத்தைப் பார்த்து குடும்பத்தினரின் படத்தைத் தேர்ந்தெடுக்கலாம்.', cognitive: 'படங்களை மெதுவாகப் பாருங்கள். விருப்பமிருந்தால் குறிப்பைத் தேர்ந்தெடுக்கலாம்.', routine: 'ஒரு நேரத்தில் ஒரு படியை மட்டும் பாருங்கள்.', voice: 'உங்களுக்கு வசதியான மொழியைத் தேர்ந்தெடுக்கலாம்.' },
    commands: { home: ['முகப்பு', 'முகப்புக்கு திரும்பு', 'வீட்டிற்கு திரும்பு'], repeat: ['மீண்டும்', 'மறுபடியும்', 'திரும்பச் சொல்லு'], hint: ['உதவி', 'குறிப்பு', 'சிறு உதவி'], stop: ['குரலை நிறுத்து', 'பேச்சை நிறுத்து', 'நிறுத்து'], speak: ['வழிமுறைகள்', 'வழிமுறைகளைச் சொல்லு'], open: { life: ['என் வாழ்க்கைக் கதை'], helper: ['இன்றைய உதவியாளர்'], garden: ['அமைதியான தோட்டம்', 'அமைதி தோட்டத்திற்குச் செல்', 'அமைதித் தோட்டத்திற்குச் செல்', 'அமைதியான தோட்டத்திற்குச் செல்', 'தோட்டத்திற்குச் செல்'], family: ['குடும்ப விளையாட்டு'], cognitive: ['அறிவாற்றல் விளையாட்டுகள்'], routine: ['தினசரி வழக்கம்'], voice: ['குரல் உதவியாளர்'] } }
  },
  'en-IN': {
    name: 'English', native: 'English', voices: ['en-IN', 'en-US'],
    ui: { speak: 'Speak Instructions', repeat: 'Repeat', hint: 'Hint', stop: 'Stop Voice', listen: 'Voice Input', stopListening: 'Stop Listening', choose: 'Choose Language', dialog: 'Voice Controls', language: 'Selected language' },
    status: { selected: 'English is selected.', listening: 'I am listening. Speak slowly when you are ready.', speaking: 'I am speaking gently.', englishFallback: 'English (India) recognition is unavailable here. Trying English (United States).', stopped: 'Voice stopped.', stoppedListening: 'Listening stopped.', notRecognized: "I didn't catch that. You can use the buttons instead.", permission: 'Microphone permission is needed. Please check the browser permission.', noSpeech: "I didn't hear anything. You can try again.", network: 'Voice input is unavailable right now.', mic: 'A microphone is not available.', recognitionUnsupported: 'Voice input is not supported in this browser. Touch controls are ready.', languageUnsupported: 'This browser cannot recognize this language. Touch controls are ready.', speechUnsupported: 'Spoken instructions are not supported here. Follow the pictures on screen.', error: 'Voice help is unavailable right now.', commandDone: 'All right. Done.' },
    instructions: { smart: "I can help you use this website. I can open activities and repeat instructions. For other questions, please ask family or a caregiver.", home: 'Hello. Choose a picture to begin. We can take our time.', life: 'Add a photo and the person’s name. Tap a photo to hear who it is.', helper: 'Look at the picture. Choose the matching picture below.', garden: 'Let’s enjoy a quiet moment. Breathe in gently, then breathe out slowly.', family: 'Look at the photo. Choose a picture of the family member. There is no hurry.', routine: 'Here is today’s plan. Wake up, brush your teeth, bathe, eat, drink water, take a walk, and get ready for sleep.', cognitive: 'Choose a game and a level. Follow the pictures. There is no rush.', voice: 'Choose a language. You can hear instructions, repeat them, or ask for help out loud.' },
    hints: { smart: "Ask me to open an activity or repeat instructions on this website.", home: 'Tap a large picture to open an activity.', life: 'A family member can add a photo and a name.', helper: 'Look closely, then choose the same kind of object.', garden: 'Tap a flower, a tree, a bird, or the pond.', family: 'Look at the family photo, then choose the matching person.', cognitive: 'Look at the pictures one at a time. You can use a hint whenever you like.', routine: 'You only need to think about one step at a time.', voice: 'Choose the language that feels comfortable.' },
    commands: { home: ['home', 'go home', 'return home', 'back home'], repeat: ['repeat', 'say again', 'repeat that', 'again'], hint: ['hint', 'give me a hint', 'help me'], stop: ['stop voice', 'stop speaking', 'stop'], speak: ['speak instructions', 'instructions', 'read instructions'], open: { life: ['my life story', 'life story'], helper: ["today's helper", 'today helper'], garden: ['calm garden', 'garden'], family: ['family participation game', 'family game'], cognitive: ['cognitive games', 'brain games'], routine: ['daily routine', 'routine'], voice: ['voice assistant'] } }
  },
  'hi-IN': {
    name: 'Hindi', native: 'हिन्दी', voices: ['hi-IN'],
    ui: { speak: 'निर्देश सुनें', repeat: 'दोहराएँ', hint: 'संकेत', stop: 'आवाज़ रोकें', listen: 'बोलकर बताएं', stopListening: 'सुनना रोकें', choose: 'भाषा चुनें', dialog: 'आवाज़ सहायता', language: 'चुनी हुई भाषा' },
    status: { selected: 'हिन्दी चुनी गई है।', listening: 'मैं सुन रही हूँ। जब तैयार हों, धीरे बोलें।', speaking: 'मैं धीरे से बता रही हूँ।', stopped: 'आवाज़ रोक दी गई है।', stoppedListening: 'सुनना रोक दिया गया है।', notRecognized: 'माफ़ कीजिए, समझ नहीं पाई। आप बटन इस्तेमाल कर सकते हैं।', permission: 'माइक्रोफ़ोन की अनुमति चाहिए। ब्राउज़र की अनुमति जाँचें।', noSpeech: 'आवाज़ सुनाई नहीं दी। आप फिर कोशिश कर सकते हैं।', network: 'आवाज़ सेवा अभी उपलब्ध नहीं है।', mic: 'माइक्रोफ़ोन उपलब्ध नहीं है।', recognitionUnsupported: 'इस ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। स्पर्श वाले बटन इस्तेमाल करें।', languageUnsupported: 'यह ब्राउज़र इस भाषा को पहचान नहीं पा रहा है।', speechUnsupported: 'इस ब्राउज़र में आवाज़ सुनाना उपलब्ध नहीं है। चित्र देखकर आगे बढ़ें।', error: 'आवाज़ सहायता अभी उपलब्ध नहीं है।', commandDone: 'ठीक है। हो गया।' },
    instructions: { smart: "मैं इस वेबसाइट का उपयोग करने में आपकी मदद करूँगी। मैं गतिविधियाँ खोल सकती हूँ और निर्देश दोहरा सकती हूँ। दूसरे सवालों के लिए परिवार या देखभाल करने वाले से पूछें।", home: 'नमस्ते। शुरू करने के लिए एक तस्वीर चुनें। कोई जल्दी नहीं है।', life: 'एक तस्वीर और उस व्यक्ति का नाम जोड़ें। तस्वीर छूकर सुनें कि यह कौन है।', helper: 'तस्वीर देखें। नीचे से मिलती-जुलती तस्वीर चुनें।', garden: 'थोड़ा आराम करें। धीरे से साँस लें और धीरे से छोड़ें।', family: 'तस्वीर देखें। परिवार के सदस्य की तस्वीर चुनें। आराम से करें।', routine: 'आज की योजना है: उठना, दाँत साफ़ करना, नहाना, खाना, पानी पीना, टहलना और सोने की तैयारी करना।', cognitive: 'एक खेल और स्तर चुनें। तस्वीरें देखकर खेलें। कोई जल्दी नहीं है।', voice: 'अपनी भाषा चुनें। निर्देश सुनें या आवाज़ से मदद माँगें।' },
    hints: { smart: "इस वेबसाइट पर कोई गतिविधि खोलने या निर्देश दोहराने के लिए कहें।", home: 'कोई गतिविधि खोलने के लिए बड़ा चित्र छुएँ।', life: 'परिवार का कोई सदस्य तस्वीर और नाम जोड़ सकता है।', helper: 'वस्तु को देखें और उससे मिलती तस्वीर चुनें।', garden: 'फूल, पेड़, पक्षी या तालाब छुएँ।', family: 'परिवार की तस्वीर देखें और मिलती तस्वीर चुनें।', cognitive: 'एक बार में एक तस्वीर देखें। संकेत लेने में कोई बात नहीं।', routine: 'एक समय में एक ही कदम पर ध्यान दें।', voice: 'अपनी सुविधा की भाषा चुनें।' },
    commands: { home: ['घर', 'मुख्य पृष्ठ', 'घर वापस'], repeat: ['दोहराएँ', 'फिर से बोलें', 'दोबारा'], hint: ['संकेत', 'मदद', 'इशारा'], stop: ['आवाज़ रोकें', 'बोलना बंद', 'रोकें'], speak: ['निर्देश सुनें', 'निर्देश', 'बताइए क्या करना है'], open: { life: ['मेरी जीवन कहानी'], helper: ['आज का सहायक'], garden: ['शांत बगीचा'], family: ['परिवार का खेल'], cognitive: ['दिमागी खेल', 'संज्ञानात्मक खेल'], routine: ['दिनचर्या'], voice: ['आवाज़ सहायक'] } }
  },
  'ml-IN': {
    name: 'Malayalam', native: 'മലയാളം', voices: ['ml-IN'],
    ui: { speak: 'നിർദ്ദേശങ്ങൾ കേൾക്കുക', repeat: 'വീണ്ടും', hint: 'സൂചന', stop: 'ശബ്ദം നിർത്തുക', listen: 'ശബ്ദ നിർദ്ദേശം', stopListening: 'കേൾക്കുന്നത് നിർത്തുക', choose: 'ഭാഷ തിരഞ്ഞെടുക്കുക', dialog: 'ശബ്ദ സഹായം', language: 'തിരഞ്ഞെടുത്ത ഭാഷ' },
    status: { selected: 'മലയാളം തിരഞ്ഞെടുത്തു.', listening: 'ഞാൻ കേൾക്കുകയാണ്. തയ്യാറാകുമ്പോൾ പതുക്കെ പറയൂ.', speaking: 'ഞാൻ പതുക്കെ പറയാം.', stopped: 'ശബ്ദം നിർത്തി.', stoppedListening: 'കേൾക്കുന്നത് നിർത്തി.', notRecognized: 'ക്ഷമിക്കണം, മനസ്സിലായില്ല. ബട്ടണുകൾ ഉപയോഗിക്കാം.', permission: 'മൈക്രോഫോൺ അനുമതി വേണം. ബ്രൗസർ അനുമതി പരിശോധിക്കൂ.', noSpeech: 'ശബ്ദം കേട്ടില്ല. വീണ്ടും ശ്രമിക്കാം.', network: 'ശബ്ദ സേവനം ഇപ്പോൾ ലഭ്യമല്ല.', mic: 'മൈക്രോഫോൺ ലഭ്യമല്ല.', recognitionUnsupported: 'ഈ ബ്രൗസറിൽ ശബ്ദ തിരിച്ചറിയൽ ലഭ്യമല്ല. സ്പർശ ബട്ടണുകൾ ഉപയോഗിക്കാം.', languageUnsupported: 'ഈ ഭാഷ തിരിച്ചറിയാൻ ബ്രൗസറിന് കഴിയില്ല.', speechUnsupported: 'ഈ ബ്രൗസറിൽ ശബ്ദ നിർദ്ദേശങ്ങൾ ലഭ്യമല്ല. ചിത്രങ്ങൾ നോക്കി തുടരാം.', error: 'ശബ്ദ സഹായം ഇപ്പോൾ ലഭ്യമല്ല.', commandDone: 'ശരി. ചെയ്തു.' },
    instructions: { smart: "ഈ വെബ്സൈറ്റ് ഉപയോഗിക്കാൻ ഞാൻ സഹായിക്കാം. പ്രവർത്തനങ്ങൾ തുറക്കാനും നിർദ്ദേശങ്ങൾ വീണ്ടും പറയാനും കഴിയും. മറ്റ് ചോദ്യങ്ങൾക്ക് കുടുംബത്തോടോ പരിചാരകനോടോ ചോദിക്കൂ.", home: 'നമസ്കാരം. തുടങ്ങാൻ ഒരു ചിത്രം തിരഞ്ഞെടുക്കൂ. തിരക്കില്ല.', life: 'ഒരു ഫോട്ടോയും ആളുടെ പേരും ചേർക്കൂ. ആരാണെന്ന് കേൾക്കാൻ ഫോട്ടോ തൊടൂ.', helper: 'ചിത്രം നോക്കൂ. താഴെ അതിനോട് പൊരുത്തമുള്ള ചിത്രം തിരഞ്ഞെടുക്കൂ.', garden: 'നമുക്ക് ശാന്തമായി ഇരിക്കാം. പതുക്കെ ശ്വാസം ഉള്ളിലേക്ക് എടുത്ത് പുറത്തേക്ക് വിടൂ.', family: 'ഫോട്ടോ നോക്കി കുടുംബാംഗത്തിന്റെ ചിത്രം തിരഞ്ഞെടുക്കൂ. സമയമെടുത്തോളൂ.', routine: 'ഇന്നത്തെ ക്രമം: എഴുന്നേൽക്കുക, പല്ലുതേക്കുക, കുളിക്കുക, ഭക്ഷണം കഴിക്കുക, വെള്ളം കുടിക്കുക, നടക്കുക, ഉറങ്ങാൻ തയ്യാറാകുക.', cognitive: 'ഒരു കളിയും നിലയും തിരഞ്ഞെടുക്കൂ. ചിത്രങ്ങൾ നോക്കി കളിക്കൂ. തിരക്കില്ല.', voice: 'നിങ്ങൾക്ക് ഇഷ്ടമുള്ള ഭാഷ തിരഞ്ഞെടുക്കൂ. നിർദ്ദേശങ്ങൾ കേൾക്കാം അല്ലെങ്കിൽ ശബ്ദത്തിൽ സഹായം ചോദിക്കാം.' },
    hints: { smart: "ഒരു പ്രവർത്തനം തുറക്കാനോ നിർദ്ദേശങ്ങൾ വീണ്ടും പറയാനോ എന്നോട് പറയൂ.", home: 'ഒരു പ്രവർത്തനം തുറക്കാൻ വലിയ ചിത്രം തൊടൂ.', life: 'കുടുംബാംഗത്തിന് ഫോട്ടോയും പേരും ചേർക്കാം.', helper: 'വസ്തു നോക്കി അതേ തരത്തിലുള്ള ചിത്രം തിരഞ്ഞെടുക്കൂ.', garden: 'പൂവ്, മരം, പക്ഷി, കുളം എന്നിവ തൊടൂ.', family: 'കുടുംബ ഫോട്ടോ നോക്കി പൊരുത്തമുള്ള ചിത്രം തിരഞ്ഞെടുക്കൂ.', cognitive: 'ഓരോ ചിത്രവും പതുക്കെ നോക്കൂ. സൂചന ഉപയോഗിക്കാം.', routine: 'ഒരു സമയം ഒരു കാര്യത്തെക്കുറിച്ച് മാത്രം ചിന്തിക്കൂ.', voice: 'നിങ്ങൾക്ക് സുഖമുള്ള ഭാഷ തിരഞ്ഞെടുക്കൂ.' },
    commands: { home: ['വീട്', 'മുഖ്യ പേജ്', 'വീട്ടിലേക്ക് മടങ്ങുക'], repeat: ['വീണ്ടും', 'ആവർത്തിക്കുക', 'ഒന്നുകൂടി പറയൂ'], hint: ['സൂചന', 'സഹായം'], stop: ['ശബ്ദം നിർത്തുക', 'സംസാരം നിർത്തുക', 'നിർത്തുക'], speak: ['നിർദ്ദേശങ്ങൾ കേൾക്കുക', 'നിർദ്ദേശങ്ങൾ'], open: { life: ['എന്റെ ജീവിതകഥ'], helper: ['ഇന്നത്തെ സഹായി'], garden: ['ശാന്തമായ പൂന്തോട്ടം'], family: ['കുടുംബ കളി'], cognitive: ['ഓർമ്മ കളികൾ', 'ബുദ്ധി കളികൾ'], routine: ['ദിവസചര്യ'], voice: ['ശബ്ദ സഹായി'] } }
  },
  'te-IN': {
    name: 'Telugu', native: 'తెలుగు', voices: ['te-IN'],
    ui: { speak: 'సూచనలు వినండి', repeat: 'మళ్లీ చెప్పండి', hint: 'సూచన', stop: 'వాయిస్ ఆపండి', listen: 'వాయిస్ ఇన్‌పుట్', stopListening: 'వినడం ఆపండి', choose: 'భాషను ఎంచుకోండి', dialog: 'వాయిస్ సహాయం', language: 'ఎంచుకున్న భాష' },
    status: { selected: 'తెలుగు ఎంచుకున్నారు.', listening: 'నేను వింటున్నాను. సిద్ధమైనప్పుడు నెమ్మదిగా మాట్లాడండి.', speaking: 'నేను నెమ్మదిగా చెబుతున్నాను.', stopped: 'వాయిస్ ఆగింది.', stoppedListening: 'వినడం ఆగింది.', notRecognized: 'క్షమించండి, అర్థం కాలేదు. బటన్లను ఉపయోగించవచ్చు.', permission: 'మైక్రోఫోన్ అనుమతి కావాలి. బ్రౌజర్ అనుమతిని చూడండి.', noSpeech: 'వాయిస్ వినిపించలేదు. మళ్లీ ప్రయత్నించండి.', network: 'వాయిస్ సేవ ఇప్పుడు అందుబాటులో లేదు.', mic: 'మైక్రోఫోన్ అందుబాటులో లేదు.', recognitionUnsupported: 'ఈ బ్రౌజర్‌లో వాయిస్ గుర్తింపు లేదు. స్పర్శ బటన్లను ఉపయోగించండి.', languageUnsupported: 'ఈ భాషను బ్రౌజర్ గుర్తించలేకపోతోంది.', speechUnsupported: 'ఈ బ్రౌజర్‌లో వాయిస్ సూచనలు లేవు. చిత్రాలను చూసి కొనసాగండి.', error: 'వాయిస్ సహాయం ఇప్పుడు అందుబాటులో లేదు.', commandDone: 'సరే. పూర్తయింది.' },
    instructions: { smart: "ఈ వెబ్‌సైట్‌ను ఉపయోగించడంలో నేను సహాయపడతాను. కార్యకలాపాలను తెరవగలను, సూచనలను మళ్లీ చెప్పగలను. ఇతర ప్రశ్నలకు కుటుంబ సభ్యుడిని లేదా సంరక్షకుడిని అడగండి.", home: 'నమస్కారం. ప్రారంభించడానికి ఒక చిత్రాన్ని ఎంచుకోండి. తొందర లేదు.', life: 'ఒక ఫోటో, ఆ వ్యక్తి పేరు జోడించండి. ఎవరో వినడానికి ఫోటోను తాకండి.', helper: 'చిత్రాన్ని చూడండి. కింద సరిపోలే చిత్రాన్ని ఎంచుకోండి.', garden: 'కొద్దిసేపు ప్రశాంతంగా ఉండండి. నెమ్మదిగా శ్వాస తీసి వదలండి.', family: 'ఫోటో చూడండి. కుటుంబ సభ్యుని చిత్రాన్ని ఎంచుకోండి. నెమ్మదిగా చేయండి.', routine: 'ఈరోజు క్రమం: లేవండి, పళ్లు తోమండి, స్నానం చేయండి, తినండి, నీళ్లు తాగండి, నడవండి, నిద్రకు సిద్ధం అవ్వండి.', cognitive: 'ఒక ఆట, ఒక స్థాయిని ఎంచుకోండి. చిత్రాలను అనుసరించండి. తొందర లేదు.', voice: 'మీకు సౌకర్యమైన భాష ఎంచుకోండి. సూచనలు వినండి లేదా వాయిస్‌తో సహాయం అడగండి.' },
    hints: { smart: "కార్యకలాపం తెరవమని లేదా సూచనలను మళ్లీ చెప్పమని అడగండి.", home: 'కార్యకలాపం తెరవడానికి పెద్ద చిత్రాన్ని తాకండి.', life: 'కుటుంబ సభ్యుడు ఫోటో, పేరును జోడించవచ్చు.', helper: 'వస్తువును చూసి సరిపోలే చిత్రాన్ని ఎంచుకోండి.', garden: 'పువ్వు, చెట్టు, పక్షి లేదా కొలను తాకండి.', family: 'కుటుంబ ఫోటో చూసి సరిపోలే వ్యక్తిని ఎంచుకోండి.', cognitive: 'చిత్రాలను ఒక్కొక్కటిగా చూడండి. సూచన తీసుకోవచ్చు.', routine: 'ఒకేసారి ఒక అడుగు గురించి మాత్రమే ఆలోచించండి.', voice: 'మీకు నచ్చిన భాషను ఎంచుకోండి.' },
    commands: { home: ['ఇల్లు', 'ముఖ్య పేజీ', 'హోమ్‌కు వెళ్లు'], repeat: ['మళ్లీ చెప్పు', 'మళ్లీ', 'పునరావృతం'], hint: ['సూచన', 'సహాయం'], stop: ['వాయిస్ ఆపు', 'మాట్లాడటం ఆపు', 'ఆపు'], speak: ['సూచనలు వినండి', 'సూచనలు'], open: { life: ['నా జీవిత కథ'], helper: ['ఈరోజు సహాయకుడు'], garden: ['ప్రశాంత తోట'], family: ['కుటుంబ ఆట'], cognitive: ['జ్ఞాపక ఆటలు', 'ఆలోచన ఆటలు'], routine: ['రోజువారీ క్రమం'], voice: ['వాయిస్ సహాయకుడు'] } }
  },
  'kn-IN': {
    name: 'Kannada', native: 'ಕನ್ನಡ', voices: ['kn-IN'],
    ui: { speak: 'ಸೂಚನೆಗಳನ್ನು ಕೇಳಿ', repeat: 'ಮತ್ತೆ ಹೇಳಿ', hint: 'ಸುಳಿವು', stop: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ', listen: 'ಧ್ವನಿ ಇನ್‌ಪುಟ್', stopListening: 'ಕೇಳುವುದನ್ನು ನಿಲ್ಲಿಸಿ', choose: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ', dialog: 'ಧ್ವನಿ ಸಹಾಯ', language: 'ಆಯ್ದ ಭಾಷೆ' },
    status: { selected: 'ಕನ್ನಡ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ.', listening: 'ನಾನು ಕೇಳುತ್ತಿದ್ದೇನೆ. ಸಿದ್ಧರಾದಾಗ ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ.', speaking: 'ನಾನು ನಿಧಾನವಾಗಿ ಹೇಳುತ್ತೇನೆ.', stopped: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಲಾಗಿದೆ.', stoppedListening: 'ಕೇಳುವುದನ್ನು ನಿಲ್ಲಿಸಲಾಗಿದೆ.', notRecognized: 'ಕ್ಷಮಿಸಿ, ಅರ್ಥವಾಗಲಿಲ್ಲ. ಬಟನ್‌ಗಳನ್ನು ಬಳಸಬಹುದು.', permission: 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ಬೇಕು. ಬ್ರೌಸರ್ ಅನುಮತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.', noSpeech: 'ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.', network: 'ಧ್ವನಿ ಸೇವೆ ಈಗ ಲಭ್ಯವಿಲ್ಲ.', mic: 'ಮೈಕ್ರೊಫೋನ್ ಲಭ್ಯವಿಲ್ಲ.', recognitionUnsupported: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಇಲ್ಲ. ಸ್ಪರ್ಶ ಬಟನ್‌ಗಳನ್ನು ಬಳಸಿ.', languageUnsupported: 'ಈ ಭಾಷೆಯನ್ನು ಬ್ರೌಸರ್ ಗುರುತಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.', speechUnsupported: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಸೂಚನೆಗಳು ಲಭ್ಯವಿಲ್ಲ. ಚಿತ್ರಗಳನ್ನು ನೋಡಿ ಮುಂದುವರಿಯಿರಿ.', error: 'ಧ್ವನಿ ಸಹಾಯ ಈಗ ಲಭ್ಯವಿಲ್ಲ.', commandDone: 'ಸರಿ. ಆಯಿತು.' },
    instructions: { smart: "ಈ ಜಾಲತಾಣವನ್ನು ಬಳಸಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ಚಟುವಟಿಕೆಗಳನ್ನು ತೆರೆಯಬಹುದು ಮತ್ತು ಸೂಚನೆಗಳನ್ನು ಮತ್ತೆ ಹೇಳಬಹುದು. ಬೇರೆ ಪ್ರಶ್ನೆಗಳಿಗೆ ಕುಟುಂಬದವರನ್ನು ಅಥವಾ ಆರೈಕೆದಾರರನ್ನು ಕೇಳಿ.", home: 'ನಮಸ್ಕಾರ. ಆರಂಭಿಸಲು ಒಂದು ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಆತುರವಿಲ್ಲ.', life: 'ಒಂದು ಫೋಟೋ ಮತ್ತು ಆ ವ್ಯಕ್ತಿಯ ಹೆಸರನ್ನು ಸೇರಿಸಿ. ಯಾರೆಂದು ಕೇಳಲು ಫೋಟೋ ಮುಟ್ಟಿ.', helper: 'ಚಿತ್ರವನ್ನು ನೋಡಿ. ಕೆಳಗೆ ಹೊಂದುವ ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.', garden: 'ಸ್ವಲ್ಪ ಶಾಂತವಾಗಿ ಇರೋಣ. ನಿಧಾನವಾಗಿ ಉಸಿರೆಳೆದು ಬಿಡಿ.', family: 'ಫೋಟೋ ನೋಡಿ. ಕುಟುಂಬದವರ ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಸಮಯ ತೆಗೆದುಕೊಳ್ಳಿ.', routine: 'ಇಂದಿನ ಕ್ರಮ: ಎದ್ದೇಳಿ, ಹಲ್ಲುಜ್ಜಿ, ಸ್ನಾನ ಮಾಡಿ, ಊಟ ಮಾಡಿ, ನೀರು ಕುಡಿ, ನಡೆಯಿರಿ, ನಿದ್ರೆಗೆ ಸಿದ್ಧರಾಗಿ.', cognitive: 'ಒಂದು ಆಟ ಮತ್ತು ಹಂತವನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಚಿತ್ರಗಳನ್ನು ಅನುಸರಿಸಿ. ಆತುರವಿಲ್ಲ.', voice: 'ನಿಮಗೆ ಆರಾಮದ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಸೂಚನೆಗಳನ್ನು ಕೇಳಿ ಅಥವಾ ಧ್ವನಿಯಲ್ಲಿ ಸಹಾಯ ಕೇಳಿ.' },
    hints: { smart: "ಚಟುವಟಿಕೆ ತೆರೆಯಲು ಅಥವಾ ಸೂಚನೆಗಳನ್ನು ಮತ್ತೆ ಹೇಳಲು ಕೇಳಿ.", home: 'ಚಟುವಟಿಕೆ ತೆರೆಯಲು ದೊಡ್ಡ ಚಿತ್ರವನ್ನು ಮುಟ್ಟಿ.', life: 'ಕುಟುಂಬದವರು ಫೋಟೋ ಮತ್ತು ಹೆಸರನ್ನು ಸೇರಿಸಬಹುದು.', helper: 'ವಸ್ತುವನ್ನು ನೋಡಿ ಹೊಂದುವ ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.', garden: 'ಹೂವು, ಮರ, ಹಕ್ಕಿ ಅಥವಾ ಕೊಳವನ್ನು ಮುಟ್ಟಿ.', family: 'ಕುಟುಂಬದ ಫೋಟೋ ನೋಡಿ ಹೊಂದುವ ವ್ಯಕ್ತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.', cognitive: 'ಚಿತ್ರಗಳನ್ನು ಒಂದೊಂದಾಗಿ ನೋಡಿ. ಸುಳಿವು ಕೇಳಬಹುದು.', routine: 'ಒಂದು ಸಮಯದಲ್ಲಿ ಒಂದೇ ಹೆಜ್ಜೆಯ ಬಗ್ಗೆ ಯೋಚಿಸಿ.', voice: 'ನಿಮಗೆ ಇಷ್ಟವಾದ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.' },
    commands: { home: ['ಮನೆ', 'ಮುಖ್ಯ ಪುಟ', 'ಮನೆಗೆ ಹೋಗು'], repeat: ['ಮತ್ತೆ ಹೇಳಿ', 'ಮತ್ತೊಮ್ಮೆ', 'ಪುನರಾವರ್ತಿಸಿ'], hint: ['ಸುಳಿವು', 'ಸಹಾಯ'], stop: ['ಧ್ವನಿ ನಿಲ್ಲಿಸಿ', 'ಮಾತು ನಿಲ್ಲಿಸಿ', 'ನಿಲ್ಲಿಸಿ'], speak: ['ಸೂಚನೆಗಳನ್ನು ಕೇಳಿ', 'ಸೂಚನೆಗಳು'], open: { life: ['ನನ್ನ ಜೀವನ ಕಥೆ'], helper: ['ಇಂದಿನ ಸಹಾಯಕ'], garden: ['ಶಾಂತ ತೋಟ'], family: ['ಕುಟುಂಬ ಆಟ'], cognitive: ['ಸ್ಮರಣ ಆಟಗಳು', 'ಜ್ಞಾನ ಆಟಗಳು'], routine: ['ದಿನಚರಿ'], voice: ['ಧ್ವನಿ ಸಹಾಯಕ'] } }
  },
  'ko-KR': {
    name: 'Korean', native: '한국어', voices: ['ko-KR'],
    ui: { speak: '안내 듣기', repeat: '다시 듣기', hint: '도움말', stop: '음성 멈추기', listen: '음성으로 말하기', stopListening: '듣기 멈추기', choose: '언어 선택', dialog: '음성 도움', language: '선택한 언어' },
    status: { selected: '한국어를 선택했어요.', listening: '듣고 있어요. 준비되면 천천히 말씀해 주세요.', speaking: '천천히 안내해 드릴게요.', stopped: '음성을 멈췄어요.', stoppedListening: '듣기를 멈췄어요.', notRecognized: '죄송해요. 이해하지 못했어요. 버튼을 사용해도 괜찮아요.', permission: '마이크 권한이 필요해요. 브라우저 권한을 확인해 주세요.', noSpeech: '목소리가 들리지 않았어요. 다시 시도해 주세요.', network: '지금은 음성 서비스를 사용할 수 없어요.', mic: '마이크를 사용할 수 없어요.', recognitionUnsupported: '이 브라우저에서는 음성 인식을 지원하지 않아요. 화면의 버튼을 사용해 주세요.', languageUnsupported: '이 브라우저에서는 이 언어를 인식할 수 없어요.', speechUnsupported: '이 브라우저에서는 음성 안내를 지원하지 않아요. 그림을 보고 진행해 주세요.', error: '지금은 음성 도움을 사용할 수 없어요.', commandDone: '알겠어요. 완료했어요.' },
    instructions: { smart: '이 웹사이트를 사용하도록 도와드릴게요. 활동을 열고 안내를 다시 말할 수 있어요. 다른 질문은 가족이나 돌봄 제공자에게 물어보세요.', home: '안녕하세요. 그림을 하나 골라 시작해요. 천천히 해도 괜찮아요.', life: '사진과 이름을 추가해요. 사진을 누르면 누구인지 들을 수 있어요.', helper: '그림을 보고 아래에서 같은 그림을 골라요.', garden: '잠시 편히 쉬어요. 천천히 숨을 들이쉬고 내쉬어요.', family: '사진을 보고 가족의 그림을 골라요. 서두르지 않아도 돼요.', routine: '오늘의 순서예요. 일어나기, 양치하기, 씻기, 식사하기, 물 마시기, 산책하기, 잠자리에 들기예요.', cognitive: '게임과 단계를 골라요. 그림을 보며 천천히 해요.', voice: '편한 언어를 골라요. 안내를 듣거나 음성으로 도움을 요청할 수 있어요.' },
    hints: { smart: '활동을 열거나 안내를 다시 말해 달라고 해 보세요.', home: '활동을 열려면 큰 그림을 눌러요.', life: '가족이 사진과 이름을 추가할 수 있어요.', helper: '물건을 보고 어울리는 그림을 골라요.', garden: '꽃, 나무, 새 또는 연못을 눌러 보세요.', family: '가족 사진을 보고 같은 사람을 골라요.', cognitive: '그림을 하나씩 살펴봐요. 도움말을 눌러도 괜찮아요.', routine: '한 번에 한 단계씩 생각해요.', voice: '편하게 들을 수 있는 언어를 골라요.' },
    commands: { home: ['홈', '집으로', '홈으로 돌아가'], repeat: ['다시', '다시 말해', '반복'], hint: ['도움말', '힌트', '도와줘'], stop: ['음성 멈춰', '말하기 멈춰', '멈춰'], speak: ['안내 듣기', '안내해 줘', '설명해 줘'], open: { life: ['내 인생 이야기'], helper: ['오늘의 도우미'], garden: ['평온한 정원'], family: ['가족 게임'], cognitive: ['인지 게임', '기억 게임'], routine: ['일과'], voice: ['음성 도우미'] } }
  }
};

// Keep Smart Assistant voice copy sourced from the shared translation catalog.
// Older embedded strings here may have lost non-Latin characters during editing.
const smartVoiceInstructionSource = 'I can help you use this website. I can open activities, show your daily plan, and repeat instructions. I do not answer general questions.';
const smartVoiceHintSource = 'I did not understand that question. I can help with this website. Please tap one of the pictures or ask your family or caregiver.';
for (const language of Object.keys(voiceLanguages)) {
  voiceLanguages[language].instructions.smart = window.NeuarkI18n?.translate(smartVoiceInstructionSource, language) || smartVoiceInstructionSource;
  voiceLanguages[language].hints.smart = window.NeuarkI18n?.translate(smartVoiceHintSource, language) || smartVoiceHintSource;
}

let selectedVoiceLanguage = 'en-IN';
let assistantLastSpeech = '';
let speechRequestVersion = 0;
let pendingVoiceLoadCancel = null;
function cancelCurrentSpeech() {
  speechRequestVersion++;
  if (pendingVoiceLoadCancel) { pendingVoiceLoadCancel(); pendingVoiceLoadCancel = null; }
  try { window.speechSynthesis?.cancel(); } catch {}
}
let activeRecognition = null;
let voiceInputListening = false;
let recognitionHadError = false;
const voiceDialog = document.querySelector('#voiceControlDialog');
const voiceAssistantStatus = document.querySelector('#voiceAssistantStatus');
const voiceDialogStatus = document.querySelector('#voiceDialogStatus');
const globalVoiceStatus = document.querySelector('#globalVoiceStatus');
const voiceRuntimeStatus = {
  'ta-IN': { voiceLoading: 'தமிழ் குரலைத் தேடுகிறேன்.', voiceUnavailable: 'இந்த சாதனத்தில் தமிழ் குரல் இல்லை. திரையில் உள்ள வழிமுறைகளைப் பின்பற்றலாம்.', speechError: 'தமிழ் குரலை இயக்க முடியவில்லை. திரையில் உள்ள வழிமுறைகளைப் பின்பற்றலாம்.' },
  'en-IN': { voiceLoading: 'Checking for an English voice.', voiceUnavailable: 'No English voice is available on this device. You can follow the pictures and words on screen.', speechError: 'The English voice could not start. You can follow the pictures and words on screen.' },
  'hi-IN': { voiceLoading: 'हिन्दी आवाज़ खोज रही हूँ।', voiceUnavailable: 'इस डिवाइस में हिन्दी आवाज़ उपलब्ध नहीं है। आप तस्वीरें और निर्देश देख सकते हैं।', speechError: 'हिन्दी आवाज़ शुरू नहीं हो सकी। आप तस्वीरें और निर्देश देख सकते हैं।' },
  'ml-IN': { voiceLoading: 'മലയാള ശബ്ദം തിരയുന്നു.', voiceUnavailable: 'ഈ ഉപകരണത്തിൽ മലയാള ശബ്ദം ലഭ്യമല്ല. ചിത്രങ്ങളും നിർദ്ദേശങ്ങളും നോക്കി തുടരാം.', speechError: 'മലയാള ശബ്ദം തുടങ്ങാനായില്ല. ചിത്രങ്ങളും നിർദ്ദേശങ്ങളും നോക്കാം.' },
  'te-IN': { voiceLoading: 'తెలుగు వాయిస్ కోసం చూస్తున్నాను.', voiceUnavailable: 'ఈ పరికరంలో తెలుగు వాయిస్ లేదు. చిత్రాలు, సూచనలు చూసి కొనసాగండి.', speechError: 'తెలుగు వాయిస్ ప్రారంభం కాలేదు. చిత్రాలు, సూచనలు చూడండి.' },
  'kn-IN': { voiceLoading: 'ಕನ್ನಡ ಧ್ವನಿಯನ್ನು ಹುಡುಕುತ್ತಿದ್ದೇನೆ.', voiceUnavailable: 'ಈ ಸಾಧನದಲ್ಲಿ ಕನ್ನಡ ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ. ಚಿತ್ರಗಳು ಮತ್ತು ಸೂಚನೆಗಳನ್ನು ನೋಡಿ ಮುಂದುವರಿಯಿರಿ.', speechError: 'ಕನ್ನಡ ಧ್ವನಿ ಪ್ರಾರಂಭವಾಗಲಿಲ್ಲ. ಚಿತ್ರಗಳು ಮತ್ತು ಸೂಚನೆಗಳನ್ನು ನೋಡಿ.' },
  'ko-KR': { voiceLoading: '한국어 음성을 찾고 있어요.', voiceUnavailable: '이 기기에서 한국어 음성을 사용할 수 없어요. 그림과 안내를 보고 계속해 주세요.', speechError: '한국어 음성을 시작하지 못했어요. 그림과 안내를 보고 진행해 주세요.' }
};
function readVoiceLanguage() {
  try { const stored = localStorage.getItem(VOICE_LANGUAGE_KEY); return voiceLanguages[stored] ? stored : 'en-IN'; }
  catch { return 'en-IN'; }
}
selectedVoiceLanguage = readVoiceLanguage();
const siteLanguageSelect = document.querySelector('#siteLanguageSelect');
let renderedWebsiteLanguage = null;
function currentVoiceCopy() { return voiceLanguages[selectedVoiceLanguage] || voiceLanguages['en-IN']; }
function setVoiceStatus(key) {
  const text = currentVoiceCopy().status[key] || voiceRuntimeStatus[selectedVoiceLanguage]?.[key] || currentVoiceCopy().status.error;
  voiceAssistantStatus.textContent = text; voiceDialogStatus.textContent = text; globalVoiceStatus.textContent = text;
  const localStatusIds = { life: 'voiceStatus', family: 'gameVoiceStatus', helper: 'helperVoiceStatus', routine: 'routineVoiceStatus', garden: 'gardenVoiceStatus', cognitive: 'cognitiveVoiceStatus', smart: 'smartVoiceStatus' };
  const localStatus = document.getElementById(localStatusIds[activeAssistantView()]);
  if (localStatus) localStatus.textContent = text;
}
function setVoiceStatusText(text) {
  voiceAssistantStatus.textContent = text; voiceDialogStatus.textContent = text; globalVoiceStatus.textContent = text;
}
function updateVoiceLanguageUI() {
  const copy = currentVoiceCopy();
  if (siteLanguageSelect) siteLanguageSelect.value = selectedVoiceLanguage;
  document.querySelectorAll('[data-voice-language]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.voiceLanguage === selectedVoiceLanguage));
  });
  document.querySelectorAll('[data-voice-action]').forEach(button => {
    const actionName = button.dataset.voiceAction;
    button.textContent = voiceInputListening && actionName === 'listen' ? copy.ui.stopListening : copy.ui[actionName];
  });
  document.querySelector('#voiceLanguageTitle').textContent = copy.ui.choose;
  document.querySelector('#voiceDialogTitle').textContent = copy.ui.dialog;
  document.querySelector('#changeVoiceLanguage').textContent = copy.ui.choose;
  document.querySelector('#selectedVoiceLanguage').textContent = `${copy.ui.language}: ${copy.native}`;
  document.querySelector('#voiceDialogLanguage').textContent = `${copy.ui.language}: ${copy.native}`;
  window.NeuarkI18n?.setLanguage(selectedVoiceLanguage);
  if (renderedWebsiteLanguage !== selectedVoiceLanguage) {
    renderedWebsiteLanguage = selectedVoiceLanguage;
    renderReminders();
    renderCognitiveProgress();
  }
  const locale = selectedVoiceLanguage === 'en-IN' ? 'en-IN' : selectedVoiceLanguage;
  document.querySelector('#weekday').textContent = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(now);
  document.querySelector('#date').textContent = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric' }).format(now);
}
function selectVoiceLanguage(language, announce = true) {
  if (!voiceLanguages[language]) return false;
  if (language !== selectedVoiceLanguage) assistantLastSpeech = '';
  selectedVoiceLanguage = language;
  try { localStorage.setItem(VOICE_LANGUAGE_KEY, language); } catch {}
  updateVoiceLanguageUI();
  if (announce) { setVoiceStatus('selected'); speakWithSelectedLanguage(currentVoiceCopy().status.selected); }
  return true;
}
document.querySelectorAll('[data-voice-language]').forEach(button => button.addEventListener('click', () => selectVoiceLanguage(button.dataset.voiceLanguage)));
siteLanguageSelect?.addEventListener('change', () => selectVoiceLanguage(siteLanguageSelect.value));
function speakWithSelectedLanguage(text, rate = 0.84, pitch = 1) {
  text = window.NeuarkI18n?.translate(text, selectedVoiceLanguage) || text;
  assistantLastSpeech = text;
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') { setVoiceStatus('speechUnsupported'); return false; }
  cancelCurrentSpeech();
  const requestVersion = speechRequestVersion;
  const synthesis = window.speechSynthesis;
  const startSpeech = voices => {
    if (requestVersion !== speechRequestVersion) return false;
    const voice = chooseSpeechVoice(voices, selectedVoiceLanguage);
    if (!voice) { setVoiceStatus('voiceUnavailable'); return false; }
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Math.min(0.84, Math.max(0.72, Number(rate) || 0.82));
      utterance.pitch = Math.min(1.1, Math.max(0.9, Number(pitch) || 1));
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.onstart = () => { if (requestVersion === speechRequestVersion) setVoiceStatus('speaking'); };
      utterance.onerror = event => {
        if (requestVersion !== speechRequestVersion) return;
        setVoiceStatus(['language-unavailable', 'voice-unavailable'].includes(event.error) ? 'voiceUnavailable' : 'error');
      };
      synthesis.speak(utterance);
      return true;
    } catch { if (requestVersion === speechRequestVersion) setVoiceStatus('error'); return false; }
  };
  let voices = [];
  try { voices = synthesis.getVoices?.() || []; } catch {}
  if (voices.length) return startSpeech(voices);

  setVoiceStatus('voiceLoading');
  let finished = false;
  let timeoutId = null;
  let cancelWait;
  const cleanup = () => {
    if (timeoutId !== null) window.clearTimeout(timeoutId);
    if (synthesis.removeEventListener) synthesis.removeEventListener('voiceschanged', onVoicesChanged);
    else if (synthesis.onvoiceschanged === onVoicesChanged) synthesis.onvoiceschanged = null;
    if (pendingVoiceLoadCancel === cancelWait) pendingVoiceLoadCancel = null;
  };
  const finish = loadedVoices => {
    if (finished) return;
    finished = true; cleanup();
    if (requestVersion !== speechRequestVersion) return;
    if (!loadedVoices.length) { setVoiceStatus('voiceUnavailable'); return; }
    startSpeech(loadedVoices);
  };
  const onVoicesChanged = () => {
    let available = [];
    try { available = synthesis.getVoices?.() || []; } catch {}
    if (available.length) finish(available);
  };
  cancelWait = () => finish([]);
  pendingVoiceLoadCancel = cancelWait;
  if (synthesis.addEventListener) synthesis.addEventListener('voiceschanged', onVoicesChanged);
  else synthesis.onvoiceschanged = onVoicesChanged;
  timeoutId = window.setTimeout(() => {
    let available = [];
    try { available = synthesis.getVoices?.() || []; } catch {}
    finish(available);
  }, 1200);
  return true;
}
function chooseSpeechVoice(voices, language) {
  const allowed = (voiceLanguages[language]?.voices || [language]).map(code => code.toLowerCase());
  const normalized = voices.map(voice => ({ voice, lang: String(voice.lang || '').toLowerCase().replace('_', '-') }));
  for (const code of allowed) {
    const exact = normalized.find(candidate => candidate.lang === code);
    if (exact) return exact.voice;
  }
  if (language === 'en-IN') return null;
  const base = language.split('-')[0].toLowerCase();
  return normalized.find(candidate => candidate.lang === base || candidate.lang.startsWith(`${base}-`))?.voice || null;
}
function activeAssistantView() {
  if (!smartView.hidden) return 'smart';
  if (!voiceAssistantView.hidden) return 'voice';
  if (!lifeView.hidden) return 'life';
  if (!helperView.hidden) return 'helper';
  if (!gameView.hidden) return 'family';
  if (!routineView.hidden) return 'routine';
  if (!gardenView.hidden) return 'garden';
  if (!cognitiveView.hidden) return 'cognitive';
  return 'home';
}
function speakCurrentInstructions() {
  const view = activeAssistantView();
  return speakWithSelectedLanguage(currentVoiceCopy().instructions[view] || currentVoiceCopy().instructions.home, 0.82, 1);
}
function openVoiceAssistant() {
  cancelCurrentSpeech();
  stopVoiceInput(false);
  if (naturePlaying) stopNatureSounds(false);
  if (breathingTimer) stopBreathing(false);
  homeView.hidden = true; lifeView.hidden = true; gameView.hidden = true; helperView.hidden = true; routineView.hidden = true; gardenView.hidden = true; cognitiveView.hidden = true; smartView.hidden = true;
  voiceAssistantView.hidden = false; updateVoiceLanguageUI(); voiceAssistantView.focus();
}
function openSmartAssistant() {
  closeCurrentActivitiesForVoiceNavigation();
  smartView.hidden = false;
  smartView.focus();
}
function closeCurrentActivitiesForVoiceNavigation() {
  clearCognitiveTimers(); cancelCurrentSpeech(); stopVoiceInput(false);
  if (naturePlaying) stopNatureSounds(false);
  if (breathingTimer) stopBreathing(false);
  [homeView, lifeView, gameView, helperView, routineView, gardenView, cognitiveView, voiceAssistantView, smartView].forEach(view => { view.hidden = true; });
}
function openActivityFromVoice(activity) {
  closeCurrentActivitiesForVoiceNavigation();
  switch (activity) {
    case 'life': openLifeStory(); break;
    case 'helper': openHelperActivity(); break;
    case 'garden': openCalmGarden(); break;
    case 'family': openFamilyGame(); break;
    case 'cognitive': openCognitiveGames(); break;
    case 'routine': openDailyRoutine(); break;
    case 'smart': openSmartAssistant(); break;
    case 'voice': openVoiceAssistant(); break;
  }
}
function returnHomeFromVoice() {
  closeCurrentActivitiesForVoiceNavigation();
  homeView.hidden = false;
  document.querySelector('#main').focus();
}
function runVoiceHint() {
  const view = activeAssistantView();
  if (view === 'smart') { setSmartAssistantResponse('capabilities'); return; }
  const hint = currentVoiceCopy().hints[view] || currentVoiceCopy().hints.home;
  if (view === 'helper' && !document.querySelector('#helperHint').disabled) document.querySelector('#helperHint').click();
  else if (view === 'family') document.querySelector('#gameHint').click();
  else if (view === 'cognitive' && !document.querySelector('#cognitiveMenu').hidden) cognitiveGameHint();
  if (view === 'helper') document.querySelector('#helperFeedback').textContent = hint;
  if (view === 'family') document.querySelector('#gameFeedback').textContent = hint;
  if (view === 'cognitive') document.querySelector('#cognitiveFeedback').textContent = hint;
  if (view === 'garden') document.querySelector('#gardenMessage').textContent = hint;
  if (view === 'life') document.querySelector('#voiceStatus').textContent = hint;
  speakWithSelectedLanguage(hint, 0.8, 1);
}
function stopAllVoice() {
  if ('speechSynthesis' in window) cancelCurrentSpeech();
  stopVoiceInput(false);
  setVoiceStatus('stopped');
}
function handleVoiceAction(actionName) {
  if (actionName === 'speak') speakCurrentInstructions();
  else if (actionName === 'repeat') speakWithSelectedLanguage(assistantLastSpeech || currentVoiceCopy().instructions[activeAssistantView()], 0.82, 1);
  else if (actionName === 'hint') runVoiceHint();
  else if (actionName === 'stop') stopAllVoice();
  else if (actionName === 'listen') voiceInputListening ? stopVoiceInput(true) : startVoiceInput();
}
function setSmartAssistantResponse(message, speak = true) {
  const source = message === 'capabilities'
    ? 'I can help you use this website. I can open activities, show your daily plan, and repeat instructions. I do not answer general questions.'
    : 'I did not understand that question. I can help with this website. Please tap one of the pictures or ask your family or caregiver.';
  const response = document.querySelector('#smartAssistantResponse');
  response.textContent = source;
  window.NeuarkI18n?.walk(response);
  if (speak) speakWithSelectedLanguage(source, 0.8, 1);
}
document.querySelector('#smartExplain').addEventListener('click', () => setSmartAssistantResponse('capabilities'));
document.querySelector('#smartRoutine').addEventListener('click', () => { openActivityFromVoice('routine'); speakCurrentInstructions(); });
document.querySelector('#smartGarden').addEventListener('click', () => { openActivityFromVoice('garden'); speakCurrentInstructions(); });
document.querySelector('#smartGoHome').addEventListener('click', () => { returnHomeFromVoice(); speakCurrentInstructions(); });
document.querySelector('#smartAssistantHome').addEventListener('click', returnHomeFromVoice);
document.querySelectorAll('[data-voice-action]').forEach(button => button.addEventListener('click', () => handleVoiceAction(button.dataset.voiceAction)));
document.querySelector('#voiceAssistantLauncher').addEventListener('click', () => { updateVoiceLanguageUI(); voiceDialog.showModal(); });
document.querySelector('#changeVoiceLanguage').addEventListener('click', () => { voiceDialog.close(); openVoiceAssistant(); });
document.querySelector('#voiceAssistantHome').addEventListener('click', returnHomeFromVoice);
voiceDialog.addEventListener('close', () => { if (voiceInputListening) stopVoiceInput(false); });
updateVoiceLanguageUI();

const voiceInputAliases = {
  'ta-IN': ['குரல் கட்டளை', 'குரலில் பேசு'], 'en-IN': ['voice input', 'listen to me', 'voice command'],
  'hi-IN': ['बोलकर बताएं', 'आवाज़ से बोलें'], 'ml-IN': ['ശബ്ദ നിർദ്ദേശം', 'ശബ്ദത്തിൽ പറയൂ'],
  'te-IN': ['వాయిస్ ఇన్‌పుట్', 'వాయిస్‌తో చెప్పు'], 'kn-IN': ['ಧ್ವನಿ ಇನ್‌ಪುಟ್', 'ಧ್ವನಿಯಲ್ಲಿ ಹೇಳಿ'], 'ko-KR': ['음성으로 말하기', '음성 명령']
};
const languageVoiceAliases = {
  'ta-IN': ['தமிழ்', 'tamil'], 'en-IN': ['english', 'ஆங்கிலம்', 'अंग्रेज़ी', 'ഇംഗ്ലീഷ്', 'ఆంగ్లం', 'ಇಂಗ್ಲಿಷ್', '영어'],
  'hi-IN': ['हिन्दी', 'हिंदी', 'hindi'], 'ml-IN': ['മലയാളം', 'malayalam'], 'te-IN': ['తెలుగు', 'telugu'], 'kn-IN': ['ಕನ್ನಡ', 'kannada'], 'ko-KR': ['한국어', 'korean']
};
const smartAssistantOpenAliases = {
  'ta-IN': ['ஸ்மார்ட் உதவியாளர்', 'உதவியாளர்'], 'en-IN': ['smart assistant'], 'hi-IN': ['स्मार्ट सहायक', 'सहायक'],
  'ml-IN': ['സ്മാർട്ട് സഹായി', 'സഹായി'], 'te-IN': ['స్మార్ట్ అసిస్టెంట్', 'సహాయకుడు'], 'kn-IN': ['ಸ್ಮಾರ್ಟ್ ಸಹಾಯಕ', 'ಸಹಾಯಕ'], 'ko-KR': ['스마트 도우미', '도우미']
};
const smartQuestionAliases = {
  'ta-IN': { capabilities: ['என்ன உதவி செய்ய முடியும்', 'என்ன செய்ய முடியும்'], next: ['அடுத்து என்ன செய்ய வேண்டும்', 'அடுத்து என்ன'] },
  'en-IN': { capabilities: ['what can you help me with', 'what can you do', 'what can i ask you'], next: ['what should i do next', 'what is next', 'what comes next'] },
  'hi-IN': { capabilities: ['आप मेरी क्या मदद कर सकते हैं', 'आप क्या कर सकते हैं'], next: ['अब मुझे क्या करना चाहिए', 'आगे क्या है'] },
  'ml-IN': { capabilities: ['എനിക്ക് എന്ത് സഹായം ചെയ്യാം', 'നിങ്ങൾക്ക് എന്ത് ചെയ്യാൻ കഴിയും'], next: ['ഇനി ഞാൻ എന്ത് ചെയ്യണം', 'അടുത്തത് എന്താണ്'] },
  'te-IN': { capabilities: ['మీరు నాకు ఏ సహాయం చేయగలరు', 'మీరు ఏమి చేయగలరు'], next: ['తర్వాత నేను ఏమి చేయాలి', 'తర్వాత ఏమిటి'] },
  'kn-IN': { capabilities: ['ನೀವು ನನಗೆ ಏನು ಸಹಾಯ ಮಾಡಬಹುದು', 'ನೀವು ಏನು ಮಾಡಬಹುದು'], next: ['ಮುಂದೆ ನಾನು ಏನು ಮಾಡಬೇಕು', 'ಮುಂದೇನು'] },
  'ko-KR': { capabilities: ['무엇을 도와줄 수 있나요', '무엇을 할 수 있나요'], next: ['다음에는 무엇을 하면 되나요', '다음은 무엇인가요'] }
};
function normalizeVoiceText(text) {
  try { return String(text || '').toLocaleLowerCase().normalize('NFC').replace(/[\p{P}\p{S}]/gu, ' ').replace(/\s+/g, ' ').trim(); }
  catch { return String(text || '').toLocaleLowerCase().replace(/[.,!?]/g, ' ').replace(/\s+/g, ' ').trim(); }
}
function hasVoiceAlias(text, aliases = []) {
  return aliases.some(alias => {
    const normalizedAlias = normalizeVoiceText(alias);
    return normalizedAlias && text.includes(normalizedAlias);
  });
}
function closeVoiceDialogIfOpen() { if (voiceDialog.open) voiceDialog.close(); }
// Activity names are matched independently of the current screen so a request
// such as "அமைதி தோட்டத்திற்குச் செல்" always opens the garden, including from
// Smart Assistant. Include common spoken names in each supported language.
const activityNavigationAliases = {
  life: [
    'my life story', 'life story', 'my story', 'open life story', 'show my life story',
    'வாழ்க்கைக் கதை', 'என் வாழ்க்கைக் கதை', 'வாழ்க்கை கதை', 'என் வாழ்க்கை கதையைத் திற',
    'जीवन कहानी', 'मेरी जीवन कहानी', 'എന്റെ ജീവിതകഥ', 'ജീവിതകഥ', 'నా జీవిత కథ', 'జీవిత కథ', 'ನನ್ನ ಜೀವನ ಕಥೆ', 'ಜೀವನ ಕಥೆ', '나의 인생 이야기', '인생 이야기'
  ],
  helper: [
    "today's helper", 'today helper', 'open today helper', 'show me today helper',
    'இன்றைய உதவியாளர்', 'இன்றைய உதவியாளரைத் திற', 'இன்றைய உதவியாளர் பகுதிக்குச் செல்',
    'आज का सहायक', 'आज के सहायक', 'ഇന്നത്തെ സഹായി', 'ഇന്നത്തെ സഹായിയെ തുറക്കൂ', 'ఈరోజు సహాయకుడు', 'ಇಂದಿನ ಸಹಾಯಕ', '오늘의 도우미'
  ],
  garden: [
    'peaceful garden', 'calm garden', 'garden', 'open the garden', 'go to the garden', 'take me to the garden',
    'அமைதி தோட்டம்', 'அமைதித் தோட்டம்', 'அமைதியான தோட்டம்', 'அமைதி தோட்டத்திற்குச் செல்', 'அமைதித் தோட்டத்திற்குச் செல்', 'அமைதியான தோட்டத்திற்குச் செல்', 'தோட்டத்திற்குச் செல்',
    'शांत बगीचा', 'शांत बगीचे में चलो', 'शांति बगीचा', 'शांति बगीचे में चलो', 'शांत बगीचे पर चलें',
    'ശാന്തമായ പൂന്തോട്ടം', 'പൂന്തോട്ടത്തിലേക്ക് പോകൂ', 'ప్రశాంతమైన తోట', 'తోటకు వెళ్లు', 'ಶಾಂತ ಉದ್ಯಾನ', 'ಉದ್ಯಾನಕ್ಕೆ ಹೋಗು', '평화로운 정원', '정원으로 가자'
  ],
  family: [
    'family participation game', 'family game', 'play family game', 'open family game',
    'குடும்பப் பங்கேற்பு விளையாட்டு', 'குடும்ப பங்கேற்பு விளையாட்டு', 'குடும்ப விளையாட்டு', 'குடும்ப விளையாட்டைத் திற',
    'परिवार का खेल', 'परिवार के साथ खेल', 'കുടുംബ ഗെയിം', 'കുടുംബ കളി', 'కుటుంబ ఆట', 'ಕುಟುಂಬದ ಆಟ', '가족 참여 게임', '가족 게임'
  ],
  voice: [
    'voice assistant', 'open voice assistant', 'voice help',
    'குரல் உதவியாளர்', 'குரல் உதவியாளரைத் திற', 'குரல் உதவி',
    'आवाज़ सहायक', 'वॉइस असिस्टेंट', 'ശബ്ദ സഹായി', 'വോയ്സ് അസിസ്റ്റന്റ്', 'వాయిస్ అసిస్టెంట్', 'ధ్వని సహాయకుడు', 'ಧ್ವನಿ ಸಹಾಯಕ', 'ಧ್ವನಿ ಸಹಾಯಕರು', '음성 도우미', '음성 비서'
  ],
  routine: [
    'daily routine', 'my daily routine', 'open daily routine', 'show my routine',
    'தினசரி வழக்கம்', 'என் தினசரி வழக்கம்', 'தினசரி வழக்கத்தைத் திற', 'தினசரி அட்டவணை',
    'दैनिक दिनचर्या', 'मेरी दिनचर्या', 'रोज़ का कार्यक्रम', 'ദിനചര്യ', 'ദിവസചര്യ', 'నా దినచర్య', 'రోజువారీ క్రమం', 'ದಿನಚರಿ', 'ದೈನಂದಿನ ಕ್ರಮം', '일상 일정', '하루 일과'
  ]
};
function matchActivityNavigationCommand(normalizedText) {
  // Prefer the most specific phrase when speech recognition returns extra words.
  const activities = Object.entries(activityNavigationAliases)
    .flatMap(([activity, aliases]) => aliases.map(alias => ({ activity, alias: normalizeVoiceText(alias) })))
    .sort((a, b) => b.alias.length - a.alias.length);
  return activities.find(({ alias }) => alias && normalizedText.includes(alias))?.activity || null;
}
function handleRecognizedVoiceCommand(transcript) {
  const normalized = normalizeVoiceText(transcript);
  const commands = currentVoiceCopy().commands;
  if (!normalized) { setVoiceStatus('notRecognized'); return; }
  const requestedActivity = matchActivityNavigationCommand(normalized);
  if (requestedActivity) {
    closeVoiceDialogIfOpen();
    openActivityFromVoice(requestedActivity);
    speakCurrentInstructions();
    return;
  }
  for (const [language, aliases] of Object.entries(languageVoiceAliases)) {
    if (hasVoiceAlias(normalized, aliases)) {
      closeVoiceDialogIfOpen(); selectVoiceLanguage(language); return;
    }
  }
  if (hasVoiceAlias(normalized, smartAssistantOpenAliases[selectedVoiceLanguage])) {
    closeVoiceDialogIfOpen(); openSmartAssistant(); setSmartAssistantResponse('capabilities'); return;
  }
  const smartQuestions = smartQuestionAliases[selectedVoiceLanguage];
  if (hasVoiceAlias(normalized, smartQuestions.capabilities)) {
    closeVoiceDialogIfOpen(); if (activeAssistantView() !== 'smart') openSmartAssistant(); setSmartAssistantResponse('capabilities'); return;
  }
  if (hasVoiceAlias(normalized, smartQuestions.next)) {
    closeVoiceDialogIfOpen(); openActivityFromVoice('routine'); speakCurrentInstructions(); return;
  }
  if (hasVoiceAlias(normalized, voiceInputAliases[selectedVoiceLanguage])) { setVoiceStatus('listening'); return; }
  if (hasVoiceAlias(normalized, commands.stop)) { stopAllVoice(); return; }
  if (hasVoiceAlias(normalized, commands.repeat)) { closeVoiceDialogIfOpen(); handleVoiceAction('repeat'); return; }
  if (hasVoiceAlias(normalized, commands.hint)) { closeVoiceDialogIfOpen(); handleVoiceAction('hint'); return; }
  if (hasVoiceAlias(normalized, commands.speak)) { closeVoiceDialogIfOpen(); handleVoiceAction('speak'); return; }
  if (hasVoiceAlias(normalized, commands.home)) {
    closeVoiceDialogIfOpen(); returnHomeFromVoice(); speakCurrentInstructions(); return;
  }
  for (const [activity, aliases] of Object.entries(commands.open)) {
    if (hasVoiceAlias(normalized, aliases)) {
      closeVoiceDialogIfOpen(); openActivityFromVoice(activity); speakCurrentInstructions(); return;
    }
  }
  if (activeAssistantView() === 'smart') {
    closeVoiceDialogIfOpen();
    setSmartAssistantResponse('unknown');
    return;
  }
  setVoiceStatus('notRecognized');
  speakWithSelectedLanguage(currentVoiceCopy().status.notRecognized, 0.78, 1);
}
function stopVoiceInput(updateStatus = true) {
  const recognizer = activeRecognition;
  activeRecognition = null; voiceInputListening = false;
  updateVoiceLanguageUI();
  if (recognizer) { try { recognizer.stop(); } catch { try { recognizer.abort(); } catch {} } }
  if (updateStatus) setVoiceStatus('stoppedListening');
}
function startVoiceInput(localeOverride = null, englishFallbackTried = false) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) { setVoiceStatus('recognitionUnsupported'); return; }
  try {
    const recognizer = new Recognition();
    activeRecognition = recognizer; voiceInputListening = true; recognitionHadError = false;
    recognizer.lang = localeOverride || selectedVoiceLanguage; recognizer.continuous = false; recognizer.interimResults = false; recognizer.maxAlternatives = 3;
    recognizer.onstart = () => setVoiceStatus('listening');
    recognizer.onresult = event => {
      const result = event.results?.[event.resultIndex || 0]?.[0];
      const transcript = result?.transcript || '';
      voiceInputListening = false; activeRecognition = null; updateVoiceLanguageUI();
      handleRecognizedVoiceCommand(transcript);
    };
    recognizer.onerror = event => {
      if (event.error === 'language-not-supported' && selectedVoiceLanguage === 'en-IN' && !englishFallbackTried) {
        recognitionHadError = true; activeRecognition = null; voiceInputListening = false; updateVoiceLanguageUI();
        setVoiceStatus('englishFallback');
        window.setTimeout(() => startVoiceInput('en-US', true), 0);
        return;
      }
      recognitionHadError = true; voiceInputListening = false;
      const errors = { 'not-allowed': 'permission', 'service-not-allowed': 'permission', 'no-speech': 'noSpeech', network: 'network', 'audio-capture': 'mic', 'language-not-supported': 'languageUnsupported', aborted: 'stoppedListening' };
      setVoiceStatus(errors[event.error] || 'error'); updateVoiceLanguageUI();
    };
    recognizer.onend = () => {
      if (activeRecognition !== recognizer) return;
      activeRecognition = null; voiceInputListening = false; updateVoiceLanguageUI();
      if (!recognitionHadError) setVoiceStatus('noSpeech');
    };
    recognizer.start(); updateVoiceLanguageUI(); setVoiceStatus('listening');
  } catch (error) {
    activeRecognition = null; voiceInputListening = false; updateVoiceLanguageUI();
    setVoiceStatus(error?.name === 'NotAllowedError' ? 'permission' : error?.message?.includes('language') ? 'languageUnsupported' : 'error');
  }
}
