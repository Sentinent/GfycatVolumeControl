let volume = 0.5;

// sync fallbacks to local storage if not enabled
function getCurrentVolume() {
    chrome.storage.sync.get('volume', (result) => {
        if ('volume' in result) {
            volume = result.volume;
            const videoElem = document.querySelector('video');
            const sliderElem = document.querySelector('.gfycat-volume-slider');
            if (videoElem) videoElem.volume = volume;
            if (sliderElem) sliderElem.value = volume * 100;
        }
    });
}

function setCurrentVolume() {
    chrome.storage.sync.set({ 'volume': volume }, () => {
        // we could do some error checking here with runtime.lastError
    });
}

function createVolumeSlider() {
    const elem = document.createElement('input');
    elem.type = 'range';
    elem.min = 0;
    elem.max = 100;
    elem.step = 1;
    elem.value = volume * 100;
    elem.classList.add('gfycat-volume-slider');

    const videoElem = document.getElementsByTagName('video')[0];
    elem.addEventListener('input', (e) => {
        volume = parseInt(elem.value) / 100;
        videoElem.volume = volume;
    });

    elem.addEventListener('change', (e) => {
        setCurrentVolume();
    });

    return elem;
}

/* General structure as of 4/19/2021
...
    .video-player-container .player-container
        .video-container .media-container
        .player-bottom
            // where we want to inject our volume bar
        .sound-control // only present if this gif has sound, want to check this before injecting
*/
function addVolumeSlider() {
    if (document.querySelector('.gfycat-volume-slider') !== null) {
        return;
    }

    const videoContainer = document.getElementsByClassName('video-player-container')[0];
    if (videoContainer === undefined) // only present on direct links
        return;

    if ([...videoContainer.children].some(x => x.classList.contains('sound-control'))) {
        const playerBottom = document.querySelector('.player-bottom'); // our input injection point
        // should really be under .sound-control, but gfycat has some annoying css that we would have to rewrite in order to make that work

        const slider = createVolumeSlider();
        playerBottom.appendChild(slider);
    }
}

(function main() {
    getCurrentVolume();

    // browsing gifs don't really load a new page, but just update the current DOM instead
    const mutationTarget = document.querySelector('.main-container'); // NOTE: Breakable on updates
    const onMutation = (mutationsList, observer) => {
        addVolumeSlider();
    };
    const mutationObserver = new MutationObserver(onMutation);
    mutationObserver.observe(mutationTarget, { childList: true, subtree: true });

    addVolumeSlider();
})();
