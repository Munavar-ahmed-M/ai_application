// Generate Twinkling Stars in Background
document.addEventListener('DOMContentLoaded', () => {
    const starsContainer = document.getElementById('stars-container');
    if (starsContainer) {
        const starCount = 80;
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.classList.add('star');
            const size = Math.random() * 2.5 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.setProperty('--duration', `${Math.random() * 4 + 2}s`);
            star.style.animationDelay = `${Math.random() * 5}s`;
            
            // Add slight golden tint to some stars
            if (Math.random() > 0.7) {
                star.style.backgroundColor = '#f3e5ab';
                star.style.boxShadow = '0 0 6px #d4af37';
            }
            
            starsContainer.appendChild(star);
        }
    }

    // Audio Player Toggle
    const musicBtn = document.getElementById('music-btn');
    const bgAudio = document.getElementById('bg-audio');
    const musicIcon = document.getElementById('music-icon');
    let isPlaying = false;

    if (musicBtn && bgAudio) {
        musicBtn.addEventListener('click', () => {
            if (isPlaying) {
                bgAudio.pause();
                musicIcon.className = 'fas fa-music relative z-10 text-lg';
                musicBtn.classList.remove('border-gold', 'scale-105');
                isPlaying = false;
            } else {
                bgAudio.play().then(() => {
                    musicIcon.className = 'fas fa-pause relative z-10 text-lg';
                    musicBtn.classList.add('border-gold', 'scale-105');
                    isPlaying = true;
                }).catch(e => {
                    console.log("Audio autoplay restricted:", e);
                    alert("Please click anywhere on the page first or check browser audio permissions.");
                });
            }
        });
    }

    // Countdown Timer to Nikah Date (October 17, 2025 11:30:00)
    const nikahDate = new Date("October 17, 2025 11:30:00").getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = nikahDate - now;

        if (distance < 0) {
            document.getElementById("countdown").innerHTML = "<div class='col-span-4 text-gold font-cinzel text-xl'>The Blessed Event Has Begun! Alhamdulillah</div>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const daysEl = document.getElementById("days");
        const hoursEl = document.getElementById("hours");
        const minutesEl = document.getElementById("minutes");
        const secondsEl = document.getElementById("seconds");

        if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.innerText = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.innerText = String(seconds).padStart(2, '0');
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // SCRATCH CARD IMPLEMENTATION FOR NIKAH DATE
    initScratchCard();

    // RSVP Form Handler
    const rsvpForm = document.getElementById('rsvp-form');
    const rsvpSuccess = document.getElementById('rsvp-success');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('guest-name').value;
            const contact = document.getElementById('guest-contact').value;
            if (name && contact) {
                rsvpForm.reset();
                rsvpSuccess.classList.remove('hidden');
                rsvpSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                setTimeout(() => {
                    rsvpSuccess.classList.add('fade-out');
                }, 6000);
            }
        });
    }
});

// Scratch Card Logic Function
function initScratchCard() {
    const canvas = document.getElementById('scratch-canvas');
    const wrapper = document.getElementById('scratch-card-wrapper');
    const instruction = document.getElementById('scratch-instruction');
    const status = document.getElementById('scratch-status');
    const resetBtn = document.getElementById('reset-scratch');

    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let scratchedPixels = 0;
    let totalPixels = 0;
    let isRevealed = false;

    function resizeCanvas() {
        canvas.width = wrapper.offsetWidth;
        canvas.height = wrapper.offsetHeight;
        fillScratchCover();
    }

    function fillScratchCover() {
        isRevealed = false;
        scratchedPixels = 0;
        if (status) status.innerText = "Locked 🔒";
        if (instruction) instruction.style.opacity = '1';

        // Create luxurious gradient cover
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1e384f');
        gradient.addColorStop(0.5, '#275374');
        gradient.addColorStop(1, '#1e384f');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw decorative border & text pattern on scratch cover
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3;
        ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 14px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.fillText('✨ SCRATCH WITH FINGER OR MOUSE ✨', canvas.width / 2, 30);

        totalPixels = canvas.width * canvas.height;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX || e.touches[0].clientX) - rect.left,
            y: (e.clientY || e.touches[0].clientY) - rect.top
        };
    }

    function scratch(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getMousePos(e);

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 30, 0, Math.PI * 2, false);
        ctx.fill();

        if (instruction && instruction.style.opacity !== '0') {
            instruction.style.opacity = '0';
        }

        checkScratchPercentage();
    }

    function checkScratchPercentage() {
        if (isRevealed) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparent = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 128) {
                transparent++;
            }
        }

        const percentage = (transparent / (pixels.length / 4)) * 100;
        if (percentage > 35 && !isRevealed) {
            isRevealed = true;
            // Clear entire canvas smoothly
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (status) status.innerText = "Unlocked! 🎉 Alhamdulillah";
            if (instruction) instruction.style.display = 'none';
        }
    }

    // Event Listeners for Mouse & Touch
    canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
    canvas.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', () => { isDrawing = false; });

    canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, { passive: false });
    canvas.addEventListener('touchmove', scratch, { passive: false });
    window.addEventListener('touchend', () => { isDrawing = false; });

    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fillScratchCover();
        });
    }
}
