console.log(`lets write some javascript`);
// alert("please ")

let currentSong = new Audio();
let songs;
let currFolder;

// Clean name function
function cleanName(str) {
    return decodeURIComponent(str)
        .replace(/\\/g, "/")
        .split("/").pop()
        .replace(".mp3", "")
        .trim();
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;

    let res = await fetch(`/${folder}/list.json`);
    let data = await res.json();

    songs = data.songs.map(s => cleanName(s));

    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";

    songs.forEach(song => {
        songUL.innerHTML += `
            <li>
                <div class="musinfo">
                    <img src="logo/music.svg">
                    <div class="info">${song}</div>
                </div>
                <div class="playnow">
                    <span>play now</span>
                    <img src="logo/play.svg">
                </div>
            </li>
        `;
    });

    document.querySelectorAll(".songlist li").forEach(li => {
        li.addEventListener("click", () => {
            playMusic(li.querySelector(".info").innerText);
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    console.log("track---", track, currFolder);

    currentSong.src = `/${currFolder}/${track}.mp3`;

    if (!pause) {
        currentSong.play();
        play.src = "logo/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayalbums() {
    let res = await fetch("/songs/albums.json");
    let data = await res.json();

    let cardContainer = document.querySelector(".cardcontainer");
    cardContainer.innerHTML = "";

    data.albums.forEach(album => {
        cardContainer.innerHTML += `
            <div class="card" data-folder="${album.folder}">
                <div class="play">
                    <svg width="25" height="25" fill="black">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
                <img src="/songs/${album.folder}/cover.jpg">
                <h5>${album.title}</h5>
                <p>${album.description}</p>
            </div>
        `;
    });

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;
            songs = await getSongs(`songs/${folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await getSongs("songs/arjan dhillon");
    playMusic(songs[0], true);

    displayalbums();

    // PLAY BUTTON
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "logo/pause.svg";
        } else {
            currentSong.pause();
            play.src = "logo/play.svg";
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

    // HAMBURGER OPEN
    document.querySelector(".hburgerlibrary").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // HAMBURGER CLOSE
    document.querySelector(".hburgerlibraryclose").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    // OPTIONS PANEL
    const imageBox = document.getElementById("imageBox");
    const img = imageBox.querySelector("img");

    imageBox.addEventListener("click", function handleDivClick() {
        img.src = "logo/arrow-right.svg";
        document.querySelector(".options2").style.top = "0";
        imageBox.removeEventListener("click", handleDivClick);

        img.addEventListener("click", function handleImageClick(e) {
            e.stopPropagation();
            img.src = "logo/arrow-left.svg";
            document.querySelector(".options2").style.top = "-110%";
            imageBox.addEventListener("click", handleDivClick);
            img.removeEventListener("click", handleImageClick);
        });
    });

    // PREVIOUS
    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(cleanName(currentSong.src));
        if (index - 1 >= 0) playMusic(songs[index - 1]);
    });

    // NEXT
    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(cleanName(currentSong.src));
        if (index + 1 < songs.length) playMusic(songs[index + 1]);
    });

    // ⭐⭐⭐ SEARCH → AUTOPLAY ⭐⭐⭐
    document.getElementById("searchBtn").addEventListener("click", () => {
        let query = document.getElementById("searchSong").value.trim().toLowerCase();
        if (!query) return;

        let foundSong = songs.find(s => s.toLowerCase().includes(query));

        if (foundSong) playMusic(foundSong);
        else alert("Song not found!");
    });
}

main();
