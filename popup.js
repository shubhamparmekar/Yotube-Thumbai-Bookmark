
document.addEventListener('DOMContentLoaded', () => {
  const saveButton = document.getElementById('save-timestamp');
  const bookmarksList = document.getElementById('bookmarks-list');

  // Save the current timestamp
  saveButton.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab.url);
    if (url.hostname !== 'www.youtube.com') {
      alert('This feature works only on YouTube.');
      return;
    }

    const timestamp = new URLSearchParams(url.search).get('t') || '0';
    const title = tab.title;

    const bookmark = { url: tab.url, title, timestamp };
    chrome.storage.local.get({ bookmarks: [] }, (data) => {
      const bookmarks = data.bookmarks;
      bookmarks.push(bookmark);
      chrome.storage.local.set({ bookmarks });
      displayBookmarks();
    });
  });

  // Display saved bookmarks
  function displayBookmarks() {
    chrome.storage.local.get({ bookmarks: [] }, (data) => {
      bookmarksList.innerHTML = '';
      data.bookmarks.forEach((bookmark, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = bookmark.url;
        a.textContent = `${bookmark.title} - ${formatTimestamp(bookmark.timestamp)}`;
        a.target = '_blank';
        li.appendChild(a);

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'x';
        removeBtn.style.marginLeft = '10px';
        removeBtn.addEventListener('click', () => {
          removeBookmark(index);
        });

        li.appendChild(removeBtn);
        bookmarksList.appendChild(li);
      });
    });
  }

  // Format the timestamp
  function formatTimestamp(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Remove a bookmark
  function removeBookmark(index) {
    chrome.storage.local.get({ bookmarks: [] }, (data) => {
      const bookmarks = data.bookmarks;
      bookmarks.splice(index, 1);
      chrome.storage.local.set({ bookmarks });
      displayBookmarks();
    });
  }

  displayBookmarks();
});
