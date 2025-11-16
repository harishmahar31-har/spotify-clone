console.log(`lets write some javascript`)
let currentSong = new Audio();
let songs;
// let ;




function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }


    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');


    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;

    let res = await fetch(`/${folder}/list.json`);
    let data = await res.json();

    songs = data.songs.map(s => s.replace(".mp3", ""));

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
    console.log('track---',track,currFolder)
    // let audio = new Audio("/songs/" + track)
    // console.log(decodeURI(track).split('.mp3')[0].split('ncs\\')[1])
    currentSong.src = `/${currFolder}/${track}.mp3`;

    console.log('cuurent---',currentSong.src)
    if (!pause) {
        currentSong.play()
        play.src = "logo/pause.svg"

    }
    console.log("song1---"+decodeURI(track))
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

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
    await getSongs("songs/ncs");
    playMusic(songs[0], true)

    //display all the albums on the page
    displayalbums()

    // attach event listener to play , previous and next
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "logo/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "logo/play.svg"
        }
    })
    //listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".dot").style.left = (currentSong.currentTime / currentSong.duration) * 98 + "%";
    })

    //add an event listener to seekbar
    document.querySelector(".seek").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".dot").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //add event listener to hamburger
    document.querySelector(".hburgerlibrary").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //add event listener to close hamburger
    document.querySelector(".hburgerlibraryclose").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    const imageBox = document.getElementById("imageBox");
    const img = imageBox.querySelector("img");

    imageBox.addEventListener("click", function handleDivClick() {
        // Step 1: change image when div is clicked
        img.src = "logo/arrow-right.svg";
        document.querySelector(".options2").style.top = "0"

        // Step 2: temporarily remove this event so it doesn’t trigger again
        imageBox.removeEventListener("click", handleDivClick);

        // Step 3: add click event on the new image
        img.addEventListener("click", function handleImageClick(e) {
            e.stopPropagation(); // prevent triggering div’s click accidentally
            img.src = "logo/arrow-left.svg"; // change back to original image
            document.querySelector(".options2").style.top = "-110%"
            // Step 4: restore original div click behavior
            imageBox.addEventListener("click", handleDivClick);

            // Step 5: remove this temporary image listener
            img.removeEventListener("click", handleImageClick);
        });
    });

    //add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        
        console.log('previous--',decodeURIComponent(currentSong.src).split(/[/\\]/).pop())
        let index = songs.indexOf(decodeURIComponent(currentSong.src).split(/[/\\]/).pop().split('.mp3')[0])
        console.log('index-'+index)
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])

        }
    })


    //add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log('cur- '+decodeURI(currentSong.src.split("/").slice(-1)[0]))
        // just name of it
        let index = songs.indexOf(decodeURIComponent(currentSong.src).split(/[/\\]/).pop().split('.mp3')[0])
        console.log('index-'+index)

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])

        }

    })


    
    
    
}

main()
