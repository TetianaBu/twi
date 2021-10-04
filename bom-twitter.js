function main() {
  const root = document.getElementById('root');
  const alertMessage = document.getElementById('alertMessage');
  const alertMessageText = document.getElementById('alertMessageText');
  const modifyItemDiv = document.getElementById('modifyItem');
  let timeout;

  window.addEventListener('hashchange', hashHandler, false);
  hashHandler();
  function hashHandler() {
    if (location.hash === '#home') {
      renderHome();
    }
    if (location.hash === '#add') {
      renderTweetTamplate();
    }
    if (location.hash.startsWith('#edit')) {
      let path = location.hash.split('/');
      renderTweetTamplate(Number.parseInt(path[1]));
    }
    if (location.hash === '#liked') {
      renderLiked();
    }
  }

  function modifyItem() {
    modifyItemDiv.style.display = 'none';
  }
  modifyItem();

  function getTweet(id) {
    return getTweets().find((tweet) => tweet.id === id);
  }

  function renderTweetTamplate(id) {
    const tweet = getTweet(id) || { name: '' };

    const createNewTweet = `
    <div class="tweet-wrapper" id="tweet-wrapper"> 
      <textarea id="tweet" minlength="1" maxlength="140" pattern="^[^a-zA-Z0-9_]{1}*$">${tweet.name}</textarea>
      <div class="new-tweet-btn-wrapper">
        <button type="button" id="save">save</button>
        <button type="button" id="cancel">cancel</button>
      </div>
    </div>
    `;
    root.innerHTML = createNewTweet;
    const input_textarea = document.querySelector('#tweet');
    document.getElementById('cancel').addEventListener('click', goBack);
    document.getElementById('save').addEventListener('click', function () {
      savePost(input_textarea.value, id);
    });
  }

  function goBack() {
    window.history.back();
  }

  function generateId() {
    let customId = localStorage.getItem('id') || '1';
    customId = Number.parseInt(customId) + 1;
    localStorage.setItem('id', customId);
    return customId;
  }

  function savePost(name, existingTweetId) {
    let tweets = getTweets();
    const sameTweet = tweets.some((tweet) => tweet.name === name);
    console.log(tweets, name);
    if (!name || sameTweet) {
      alertError();
      return;
    }
    if (existingTweetId) {
      const tweet = tweets.find((tweet) => tweet.id === existingTweetId);
      tweet.name = name;
    } else {
      const tweet = {
        id: generateId(),
        name,
        like: false
      };
      tweets.push(tweet);
    }
    saveTweets(tweets);
    redirectToHomePage();
  }

  function getTweets() {
    return JSON.parse(localStorage.getItem('tweets')) || [];
  }

  function saveTweets(tweets = []) {
    localStorage.setItem('tweets', JSON.stringify(tweets));
  }

  function populateList(tweetsListElement, tweets = getTweets()) {
    tweetsListElement.innerHTML = tweets
      .map((tweet) => {
        return `
      <li id="item${tweet.id}">
      <textarea class="tweet-text" data-index=${tweet.id} readonly>${
          tweet.name
        }</textarea>
        <div class="posts-buttons-wrapper">
          <button class="like-btn" data-index=${tweet.id}}>
          <span class="like-span">${
            tweet.like ? 'dislike' : 'like'
          }</span></button>
          <button class="edit-tweet" data-index=${
            tweet.id
          }> <span>edit</span></button>
          <button class="delete-tweet" data-index=${
            tweet.id
          }><span>delete</span></button>
        </div>
      </li>
    `;
      })
      .join('');
  }

  function alertError() {
    alertMessageText.innerHTML = `You can't tweet about that!`;
    root.appendChild(alertMessage);
    notifacationTimeOut();
  }

  function redirectToAddPage() {
    setAddLocation();
  }
  function redirectToHomePage() {
    setHomeLocation();
  }
  function setHomeLocation() {
    location.hash = 'home';
    return window.location.href + location.hash;
  }
  setHomeLocation();

  function setAddLocation() {
    location.hash = 'add';
  }

  function notifacationTimeOut() {
    window.clearTimeout(timeout);
    timeout = setTimeout(() => {
      alertMessageText.innerHTML = '';
    }, 2000);
  }

  function renderHome() {
    let liked = getTweets().some((tweet) => tweet.like);
    const likedBtn = liked
      ? `<button class="liked-tweet">go to liked</button>`
      : '';
    const homeHTML = `
    <div id="alertMessage" class="hidden"><span id="alertMessageText"></span></div>
      <div id="tweetItems" class="listPage">
        <h1>mini twitter</h1>
        <div id="navigationButtons">
          <button class="addTweet">add tweet</button>
         ${likedBtn}
        </div>
        <ul id="list">
        </ul>
      </div>
		</div>
    `;
    root.innerHTML = homeHTML;
    document
      .querySelector('.addTweet')
      .addEventListener('click', redirectToAddPage);
    let list = document.getElementById('list');

    populateList(list);

    if (liked) {
      document
        .querySelector('.liked-tweet')
        .addEventListener('click', setLikedLocation);
    }

    [...document.querySelectorAll('.delete-tweet')].forEach((delBtn) =>
      delBtn.addEventListener('click', () => {
        let id = Number.parseInt(delBtn.dataset.index);
        removePost(id);
      })
    );
    [...document.querySelectorAll('.like-btn')].forEach((likeBtn) =>
      likeBtn.addEventListener('click', () => {
        let id = Number.parseInt(likeBtn.dataset.index);
        likesHandler(id);
      })
    );
    [...document.querySelectorAll('.edit-tweet')].forEach((editBtn) =>
      editBtn.addEventListener('click', () => {
        let id = Number.parseInt(editBtn.dataset.index);
        editHandler(id);
      })
    );
  }

  function editHandler(id) {
    location.hash = 'edit/' + id;
  }

  function likesHandler(id) {
    const items = getTweets();
    const post = items.find((item) => item.id === id);
    console.log(post);
    if (post.like === false) {
      alertMessageText.innerHTML = `You liked tweet with id ${id}!`;
      post.like = true;
    } else if (post.like === true) {
      alertMessageText.innerHTML = `You no longer like tweet with id ${id}`;
      post.like = false;
    }
    notifacationTimeOut();
    saveTweets(items);
    hashHandler();
    root.appendChild(alertMessage);
  }

  function setLikedLocation() {
    location.hash = 'liked';
  }

  function renderLiked() {
    let likedTweets = getTweets().filter((tweet) => tweet.like);
    const homeHTML = `
    <div id="alertMessage" class="hidden"><span id="alertMessageText"></span></div>
      <div id="tweetItems" class="listPage">
        <h1>your liked tweets</h1>
        <div id="navigationButtons">
          <button class="back-button">back</button>
        </div>
        <ul id="list">
        </ul>
      </div>
		</div>
    `;
    root.innerHTML = homeHTML;
    document
      .querySelector('.back-button')
      .addEventListener('click', redirectToHomePage);
    let list = document.getElementById('list');

    populateList(list, likedTweets);

    [...document.querySelectorAll('.delete-tweet')].forEach((delBtn) =>
      delBtn.addEventListener('click', () => {
        let id = Number.parseInt(delBtn.dataset.index);
        removePost(id);
      })
    );
    [...document.querySelectorAll('.like-btn')].forEach((likeBtn) =>
      likeBtn.addEventListener('click', () => {
        let id = Number.parseInt(likeBtn.dataset.index);
        likesHandler(id);
      })
    );
    [...document.querySelectorAll('.edit-tweet')].forEach((editBtn) =>
      editBtn.addEventListener('click', () => {
        let id = Number.parseInt(editBtn.dataset.index);
        editHandler(id);
      })
    );
  }

  function removePost(id) {
    const items = getTweets();
    const filtered = items.filter((item) => item.id !== id);
    saveTweets(filtered);
    hashHandler();
  }
}

main();
