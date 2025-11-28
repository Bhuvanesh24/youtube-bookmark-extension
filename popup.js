// adding a new bookmark row to the popup

import { getCurrentTab } from "./utils.js";

const addNewBookmark = (bookmarksElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");
    const controlsElement = document.createElement("div");

    controlsElement.className = "bookmark-controls";

    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";
    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);

    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);

    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarksElement.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks = []) => {
    const bookmarksElement = document.getElementsByClassName("bookmarks")[0];
    bookmarksElement.innerHTML = "";

    if (currentBookmarks.length > 0) {
        for (let i = 0; i < currentBookmarks.length; i++) {
            const bookmark = currentBookmarks[i];
            addNewBookmark(bookmarksElement, bookmark);
        }
    }
    else {
        bookmarksElement.innerHTML = `<i class = "row">No bookmarks found.</i>`;
    }
};

const onPlay = async e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getCurrentTab();
    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime,
    });
};

const onDelete = async e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getCurrentTab();
    const bookmarkElementToDelete = document.getElementById("bookmark-" + bookmarkTime);

    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

    const queryParams = activeTab.url.split("?")[1];
    const urlParams = new URLSearchParams(queryParams);
    const videoId = urlParams.get("v");

    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime,
        videoId: videoId,
    }, viewBookmarks);
};

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");
    controlElement.src = "./assets/" + src + ".png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {

    const activeTab = await getCurrentTab();

    if (activeTab && activeTab.url && activeTab.url.includes("youtube.com/watch")) {
        const queryParams = activeTab.url.split("?")[1];
        const urlParams = new URLSearchParams(queryParams);
        const videoId = urlParams.get("v");

        if (videoId) {
            chrome.storage.sync.get([videoId], (data) => {
                const currentVideoBookmarks = data[videoId] ? JSON.parse(data[videoId]) : [];

                viewBookmarks(currentVideoBookmarks);

            })
        } else {
            const container = document.getElementsByClassName("container")[0];
            container.innerHTML = `<div class="title">This is not a youtube video page.</div>`;
        }
    }
    else {
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = `<div class="title">This is not a youtube video page.</div>`;
    }
});
