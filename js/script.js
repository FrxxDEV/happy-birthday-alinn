/* ==========================================================================
   INTERACTIVE DIGITAL LOVE LETTER - BIRTHDAY SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    /* ================= 1. FLOATING HEARTS CANVAS ================= */
    const canvas = document.getElementById('hearts-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let hearts = [];
    const heartColors = ['#f8bbd0', '#f48fb1', '#800020', '#a32a42', '#ffffff', '#e8a598'];

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Heart {
        constructor(x, y) {
            this.x = x || Math.random() * canvas.width;
            this.y = y || canvas.height + Math.random() * 50;
            this.size = Math.random() * 14 + 10;
            this.speedY = Math.random() * 1.2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.8;
            this.color = heartColors[Math.floor(Math.random() * heartColors.length)];
            this.opacity = Math.random() * 0.6 + 0.2;
            this.angle = Math.random() * Math.PI * 2;
            this.angularVelocity = (Math.random() - 0.5) * 0.02;
        }

        update() {
            this.y -= this.speedY;
            this.x += Math.sin(this.angle) * 0.6 + this.speedX;
            this.angle += this.angularVelocity;

            // Reset when reaching top
            if (this.y < -30) {
                this.y = canvas.height + 20;
                this.x = Math.random() * canvas.width;
            }
        }

        draw() {
            if (!ctx) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle * 0.2);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;

            // Draw Heart Shape
            ctx.beginPath();
            const topCurveHeight = this.size * 0.3;
            ctx.moveTo(0, topCurveHeight);
            ctx.bezierCurveTo(0, 0, -this.size / 2, 0, -this.size / 2, topCurveHeight);
            ctx.bezierCurveTo(-this.size / 2, (this.size + topCurveHeight) / 2, 0, this.size, 0, this.size);
            ctx.bezierCurveTo(0, this.size, this.size / 2, (this.size + topCurveHeight) / 2, this.size / 2, topCurveHeight);
            ctx.bezierCurveTo(this.size / 2, 0, 0, 0, 0, topCurveHeight);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
    }

    function initHearts() {
        if (!canvas) return;
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const count = Math.min(Math.floor(window.innerWidth / 25), 35);
        for (let i = 0; i < count; i++) {
            hearts.push(new Heart());
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            hearts.forEach(heart => {
                heart.update();
                heart.draw();
            });
            requestAnimationFrame(animate);
        }
        animate();
    }

    initHearts();

    // Spawn Burst of Floating Hearts at (x,y)
    function spawnHeartBurst(x, y, amount = 15) {
        for (let i = 0; i < amount; i++) {
            const h = new Heart(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 60);
            h.speedY = Math.random() * 3 + 1.5;
            h.speedX = (Math.random() - 0.5) * 3;
            hearts.push(h);
        }
    }

    /* ================= 2. AUDIO & MUSIC BOX SYNTH FALLBACK ================= */
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');
    const musicWidget = document.getElementById('music-widget');
    const musicStatus = document.getElementById('music-status');
    let isPlaying = false;
    let synthPlaying = false;
    let audioCtx = null;

    // Web Audio API Music Box Fallback (Plays Happy Birthday melody if MP3 file is empty/missing)
    function playMusicBoxSynth() {
        if (synthPlaying) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
            synthPlaying = true;

            // Notes frequency map
            const notes = {
                'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
                'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25
            };

            // Happy Birthday melody notes & durations
            const melody = [
                { note: 'G4', duration: 0.3 }, { note: 'G4', duration: 0.3 },
                { note: 'A4', duration: 0.6 }, { note: 'G4', duration: 0.6 },
                { note: 'C5', duration: 0.6 }, { note: 'B4', duration: 1.2 },
                
                { note: 'G4', duration: 0.3 }, { note: 'G4', duration: 0.3 },
                { note: 'A4', duration: 0.6 }, { note: 'G4', duration: 0.6 },
                { note: 'D5', duration: 0.6 }, { note: 'C5', duration: 1.2 },

                { note: 'G4', duration: 0.3 }, { note: 'G4', duration: 0.3 },
                { note: 'G5', duration: 0.6 }, { note: 'E5', duration: 0.6 },
                { note: 'C5', duration: 0.6 }, { note: 'B4', duration: 0.6 }, { note: 'A4', duration: 0.8 }
            ];

            let time = audioCtx.currentTime + 0.1;

            function playNote(freq, startTime, duration) {
                if (!audioCtx || audioCtx.state === 'closed') return;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = 'sine'; // Soft chime music box tone
                osc.frequency.setValueAtTime(freq, startTime);

                // Music box decay
                gain.gain.setValueAtTime(0.3, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(startTime);
                osc.stop(startTime + duration);
            }

            melody.forEach(item => {
                const freq = notes[item.note] || 523.25;
                playNote(freq, time, item.duration);
                time += item.duration + 0.08;
            });

        } catch (e) {
            console.log("Audio synth error:", e);
        }
    }

    function playAudio() {
        if (!bgMusic) return;
        
        // Try playing native MP3 file
        const playPromise = bgMusic.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                updateMusicUI(true);
            }).catch(err => {
                console.log("MP3 autoplay restricted or file empty. Falling back to soft music box synth.", err);
                // Fallback to Web Audio API Music Box
                playMusicBoxSynth();
                isPlaying = true;
                updateMusicUI(true);
            });
        }
    }

    function pauseAudio() {
        if (bgMusic) {
            bgMusic.pause();
        }
        if (audioCtx && audioCtx.state === 'running') {
            audioCtx.suspend();
        }
        isPlaying = false;
        updateMusicUI(false);
    }

    function updateMusicUI(active) {
        if (active) {
            musicWidget?.classList.remove('paused');
            if (musicStatus) musicStatus.textContent = 'Diputar 🎶';
        } else {
            musicWidget?.classList.add('paused');
            if (musicStatus) musicStatus.textContent = 'Jeda ⏸️';
        }
    }

    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            if (isPlaying) {
                pauseAudio();
            } else {
                playAudio();
            }
        });
    }

    /* ================= 3. ENVELOPE OPENING ANIMATION ================= */
    const envelopeContainer = document.getElementById('envelope-container');
    const envelope = document.getElementById('envelope');
    const openingScreen = document.getElementById('opening-screen');
    const mainContent = document.getElementById('main-content');
    let hasOpened = false;

    if (envelopeContainer) {
        envelopeContainer.addEventListener('click', (e) => {
            if (hasOpened) return;
            hasOpened = true;

            // 1. Play Background Music
            playAudio();

            // 2. Open Envelope Animation
            envelope.classList.add('open');

            // 3. Heart Burst
            const rect = envelope.getBoundingClientRect();
            spawnHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);

            // 4. Smooth Transition to Main Content
            setTimeout(() => {
                openingScreen.classList.add('fade-out');

                setTimeout(() => {
                    openingScreen.classList.add('hidden');
                    mainContent.classList.remove('hidden');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 800);

            }, 1200);
        });
    }

    /* ================= 4. LOVE REACTION COUNTER ================= */
    const loveBtn = document.getElementById('love-btn');
    const loveCounter = document.getElementById('love-counter');
    let count = 0;

    if (loveBtn && loveCounter) {
        loveBtn.addEventListener('click', (e) => {
            count++;
            loveCounter.textContent = count;

            // Heart burst animation from button
            const rect = loveBtn.getBoundingClientRect();
            spawnHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);

            // Button bounce
            loveBtn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                loveBtn.style.transform = 'none';
            }, 200);
        });
    }

    /* ================= 5. CANDLE BLOWING INTERACTION ================= */
    const blowBtn = document.getElementById('blow-btn');
    const flame = document.getElementById('flame');
    const smoke = document.getElementById('smoke');
    const wishResult = document.getElementById('wish-result');
    const blowBtnText = document.getElementById('blow-btn-text');

    function blowCandle() {
        if (!flame) return;

        flame.classList.add('hidden');
        if (smoke) smoke.classList.remove('hidden');

        if (wishResult) wishResult.classList.remove('hidden');
        if (blowBtnText) blowBtnText.textContent = '✨ Hope All Your Wishes Come True!';

        // Burst of celebratory hearts & sparkles
        if (blowBtn) {
            const rect = blowBtn.getBoundingClientRect();
            spawnHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 30);
        }
    }

    if (blowBtn) {
        blowBtn.addEventListener('click', blowCandle);
    }
    if (flame) {
        flame.addEventListener('click', blowCandle);
    }

    /* ================= 6. PHOTO GALLERY LIGHTBOX MODAL ================= */
    const polaroidCards = document.querySelectorAll('.polaroid-card');
    const modal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalClose = document.getElementById('modal-close');
    const modalBackdrop = document.getElementById('modal-backdrop');

    polaroidCards.forEach(card => {
        card.addEventListener('click', () => {
            const img = card.querySelector('.gallery-img');
            const title = card.getAttribute('data-title') || '';
            const desc = card.getAttribute('data-desc') || '';

            if (modalImg && img) modalImg.src = img.src;
            if (modalTitle) modalTitle.textContent = title;
            if (modalDesc) modalDesc.textContent = desc;

            if (modal) modal.classList.remove('hidden');
        });
    });

    function closeModal() {
        if (modal) modal.classList.add('hidden');
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

});
