const konamiCode = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a'
];

let konamiCodePosition = 0;

window.addEventListener('keyup', function(e) {
    const key = e.key;
    const requiredKey = konamiCode[konamiCodePosition];

    if (key === requiredKey) {
        konamiCodePosition++;
        if (konamiCodePosition === konamiCode.length) {
            console.log('Konami Code Activated!');
            konamiCodePosition = 0;
        }
    } else {
        konamiCodePosition = 0;
    }
});