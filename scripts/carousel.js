let swapTiming = 250;
let stacks = document.getElementsByClassName('stack');

for (let i = 0; i < stacks.length; i++) {
    [...stacks[i].children].reverse().forEach(j => stacks[i].append(j));
    if (stacks[i].children.length > 1) {
        stacks[i].addEventListener('click', swap);
        stacks[i].style.cursor = 'pointer';
    }
}

function swap(e) {
    let thisTarget = e.target
    if (!thisTarget.classList.contains('screenshot')) return;
    thisTarget.style.animation = `fade-out ${swapTiming}ms ease-in forwards`;

    setTimeout(() => {
        thisTarget.style.animation = `fade-in ${swapTiming}ms ease-out forwards`;
        this.prepend(thisTarget);
    }, swapTiming);

    setTimeout(() => {
        // this.prepend(thisTarget);
        thisTarget.style = '';
    }, 2*swapTiming);
}

window.addEventListener('scroll', pulseFeatures);
function pulseFeatures() {
    let features = document.getElementById('features');
    let featuresRect = features.getBoundingClientRect()
    let stacks = document.getElementsByClassName('stack');
    let screenshots = document.getElementsByClassName('screenshot');
    let pulseTiming = 500;
    let pulseDelay = 50;
    
    if (window.scrollY > featuresRect.y + featuresRect.height/3) {
        for (let i = 0; i < screenshots.length; i++) {
            screenshots[i].style.animation = `pulse ${pulseTiming}ms ease-in-out ${pulseDelay*i}ms forwards`;
        }
        window.removeEventListener('scroll', pulseFeatures);
    }
}