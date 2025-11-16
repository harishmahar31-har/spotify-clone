console.log(`lets write some javascript`)
let currentSong = new Audio();
let songs = [];
let currFolder;

// SEARCH DATABASE
let allSongs = [
    { name: "bulle bachde", path: "/songs/arjan dhillon/Bulle Bachde.mp3" },
    { name: "danabaad", path: "/songs/arjan dhillon/Danabaad.mp3" },
    { name: "haseen", path: "/songs/arjan dhillon/Haseen.mp3" },
    { name: "hold on", path: "/songs/arjan dhillon/Hold On.mp3" },
    { name: "ik tarfa", path: "/songs/arjan dhillon/Ik Tarfa.mp3" },
    { name: "mahol", path: "/songs/arjan dhillon/Mahol.mp3" },
    { name: "nabzan", path: "/songs/arjan dhillon/Nabzan.mp3" },
    { name: "ok hoye paye haan", path: "/songs/arjan dhillon/Ok Hoye Paye Haan.mp3" },
    { name: "score", path: "/songs/arjan dhillon/Score.mp3" },
    { name: "tu jdo auna", path: "/songs/arjan dhillon/Tu Jdo Auna.mp3" }
];


// ⭐ SEARCH → AUTOPLAY
document.getElementById("searchBtn").addEventListener("click", () => {

    let searchText = document.getElementById("searchSong").value.trim().toLowerCase();
    if (!searchText) return;

    let found = allSongs.find(song => song.name.includes(searchText));

    if (found) {
        let parts = found.path.split("/");

        currFolder = parts.slice(0, parts.length - 1).join("/");
        let trackName = parts[parts.length - 1].replace(".mp3", "");

        playMusic(trackName);
        alert("Playing: " + trackName);
    } else {
        alert("Song not found!");
    }
});


// TIME FORMATTER
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}



// ⭐ FIXED SONG LOADER — CLEAN TITLES
async function getSongs(folder) {
    currFolder = folder;

    let a = await fetch(`http://127.0.0.1:3000/${folder}`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");

    songs = [];

    for (let element of as) {

        if (element.href.endsWith(".mp3")) {

            // ⭐ MASTER FIX (NO folder names)
            let filename = decodeURIComponent(element.href)
                .split(/[/\\]/)     // handles / and \ both
                .pop()
                .replace(".mp3", "")
                .trim();

            songs.push(filename);
        }
    }

    // UI update
    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";

    songs.forEach(song => {
        songUL.innerHTML += `
            <li>
                <div class="musinfo">
                    <img src="music.svg">
                    <div class="info">${song}</div>
                </div>

                <div class="playnow">
                    <span>play now</span>
                    <img src="play.svg">
                </div>
            </li>`;
    });

    // Click to play
    document.querySelectorAll(".songlist li").forEach(li => {
        li.addEventListener("click", () => {
            let track = li.querySelector(".info").innerText.trim();
            playMusic(track);
        });
    });

    return songs;
}



// PLAY FUNCTION
const playMusic = (track, pause = false) => {

    currentSong.src = `${currFolder}/` + track + ".mp3";

    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}



// LOAD ALBUM CARDS
async function displayalbums() {

    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardcontainer");

    let array = Array.from(anchors);

    for (let e of array) {

        if (e.href.includes("%5Csongs")) {
            let folder = e.href.split("%5C").slice(-1)[0];

            let meta = await fetch(`http://127.0.0.1:3000/songs/${folder}info.json`);
            let info = await meta.json();

            cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="25" height="25" fill="black">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpg">
                <h5>${info.title}</h5>
                <p>${info.description}</p>
            </div>`;
        }
    }

    // Click album load songs
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            songs = await getSongs(`songs/${card.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}



// MAIN FUNCTION
async function main() {

    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    displayalbums();

    // PLAY / PAUSE
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    // TIME UPDATE
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        document.querySelector(".dot").style.left =
            (currentSong.currentTime / currentSong.duration) * 98 + "%";
    });

    // SEEK
    document.querySelector(".seek").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".dot").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // PREVIOUS
    previous.addEventListener("click", () => {

        let curr = decodeURIComponent(currentSong.src).split(/[/\\]/).pop().replace(".mp3", "");
        let index = songs.indexOf(curr);

        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    // NEXT
    next.addEventListener("click", () => {

        let curr = decodeURIComponent(currentSong.src).split(/[/\\]/).pop().replace(".mp3", "");
        let index = songs.indexOf(curr);

        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });
}

main();
