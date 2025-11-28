let youtubeLeftControls, youtubePlayer;
let currentVideo = "";
let currentVideoBookmarks = [];

chrome.runtime.onMessage.addListener((obj, sender, response) => {

    const { type, value, videoId } = obj;




    const fetchBookmarks = () => {

        return new Promise((resolve) => {
            try {
                chrome.storage.sync.get([currentVideo], (data) => {
                    if (chrome.runtime.lastError) {
                        console.warn("Error fetching bookmarks:", chrome.runtime.lastError);
                        resolve([]);
                        return;
                    }
                    resolve(data[currentVideo] ? JSON.parse(data[currentVideo]) : []);
                });
            } catch (e) {
                resolve([]);
            }
        })
    }
    const newVideoLoaded = async () => {
        currentVideoBookmarks = await fetchBookmarks();
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        youtubeLeftControls = document.getElementsByClassName("ytp-right-controls")[0];
        youtubePlayer = document.getElementsByClassName("video-stream")[0];
        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img");
            bookmarkBtn.src = chrome.runtime.getURL('assets/bookmark.png');
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";
            youtubeLeftControls.appendChild(bookmarkBtn);

            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    }
    const addNewBookmarkEventHandler = async () => {
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at" + getTime(currentTime),
        }

        currentVideoBookmarks = await fetchBookmarks();

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        })
    }


    if (type == "NEW") {
        currentVideo = videoId;
        newVideoLoaded();
    }

    if (type == "PLAY") {
        youtubePlayer.currentTime = value;

    }
    if (type == "DELETE") {
        currentVideo = videoId;
        fetchBookmarks().then((bookmarks) => {
            currentVideoBookmarks = bookmarks.filter((b) => b.time != value);
            chrome.storage.sync.set({
                [currentVideo]: JSON.stringify(currentVideoBookmarks)
            });
            response(currentVideoBookmarks);
        });
        return true;
    }

    const getTime = time => {
        const date = new Date(0);
        date.setSeconds(time);
        return date.toISOString().slice(11, 19);
    }

});
