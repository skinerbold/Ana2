document.addEventListener('DOMContentLoaded', () => {
    let draggableImages = [];
    const targets = document.querySelectorAll('.video-target');
    const resetButton = document.getElementById('resetButton');
    const originalImages = Array.from(document.querySelectorAll('.draggable-image'));
    const container = document.querySelector('.container');

    const initVideos = () => {
        document.querySelectorAll('video').forEach(video => {
            video.muted = true;
            video.loop = true;
            video.play().catch(error => {
                video.controls = true;
            });
        });
    };

    const initGame = () => {
        container.classList.remove('game-completed');
        const imagesContainer = document.querySelector('.images-container');
        imagesContainer.innerHTML = '';
        
        const clonedImages = originalImages.map(img => {
            const newImg = img.cloneNode(true);
            newImg.style.opacity = '1';
            newImg.style.transform = 'none';
            return newImg;
        });
        
        clonedImages.sort(() => Math.random() - 0.5);
        clonedImages.forEach(img => imagesContainer.appendChild(img));

        draggableImages = Array.from(document.querySelectorAll('.draggable-image'));
        draggableImages.forEach(img => {
            img.addEventListener('dragstart', handleDragStart);
            img.addEventListener('dragend', handleDragEnd);
            img.addEventListener('touchstart', handleTouchStart);
            img.addEventListener('touchmove', handleTouchMove);
            img.addEventListener('touchend', handleTouchEnd);
        });

        document.getElementById('congratsVideo').style.display = 'none';
        targets.forEach(target => target.classList.remove('incorrect', 'drag-over'));
        
        initVideos();
    };

    const handleDragStart = (e) => {
        e.dataTransfer.setData('match', e.target.dataset.match);
        e.target.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('dragging');
    };

    const handleTouchStart = (e) => {
        const img = e.target;
        img.classList.add('dragging');
        img.dataset.match = img.dataset.match;
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const dragging = document.querySelector('.dragging');
        if (dragging) {
            dragging.style.position = 'absolute';
            dragging.style.left = `${touch.clientX - dragging.offsetWidth/2}px`;
            dragging.style.top = `${touch.clientY - dragging.offsetHeight/2}px`;
        }
    };

    const handleTouchEnd = (e) => {
        const dragging = document.querySelector('.dragging');
        if (!dragging) return;

        const elements = document.elementsFromPoint(
            e.changedTouches[0].clientX,
            e.changedTouches[0].clientY
        );

        const target = elements.find(el => el.classList.contains('video-target'));
        if (target) {
            const event = new Event('drop');
            event.dataTransfer = { getData: () => dragging.dataset.match };
            target.dispatchEvent(event);
        }

        dragging.classList.remove('dragging');
        dragging.style.position = '';
        dragging.style.left = '';
        dragging.style.top = '';
    };

    targets.forEach(target => {
        target.addEventListener('dragover', (e) => e.preventDefault());
        
        target.addEventListener('dragenter', (e) => {
            e.target.closest('.video-target').classList.add('drag-over');
        });
        
        target.addEventListener('dragleave', (e) => {
            e.target.closest('.video-target').classList.remove('drag-over');
        });
        
        target.addEventListener('drop', (e) => {
            e.preventDefault();
            const target = e.target.closest('.video-target');
            target.classList.remove('drag-over');
            
            const dragged = document.querySelector('.dragging');
            const match = e.dataTransfer?.getData('match') || dragged.dataset.match;
            
            if (target.dataset.command === match) {
                handleCorrectMatch(dragged);
            } else {
                handleIncorrectMatch(target);
            }
        });
    });

    const handleCorrectMatch = (element) => {
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'scale(0)';
        
        setTimeout(() => {
            element.remove();
            const imagesContainer = document.querySelector('.images-container');
            imagesContainer.style.display = 'grid';
            void imagesContainer.offsetHeight;
            checkCompletion();
        }, 300);
    };

    const handleIncorrectMatch = (target) => {
        target.classList.add('incorrect');
        setTimeout(() => target.classList.remove('incorrect'), 1000);
    };

    const checkCompletion = () => {
        if (document.querySelectorAll('.draggable-image').length === 0) {
            showCongratulations();
        }
    };

    const showCongratulations = () => {
        const congrats = document.getElementById('congratsVideo');
        const video = congrats.querySelector('video');
        
        container.classList.add('game-completed');
        congrats.style.display = 'block';
        video.play().catch(error => video.controls = true);
    };

    resetButton.addEventListener('click', initGame);
    document.addEventListener('dragstart', (e) => {
        if (!e.target.classList.contains('draggable-image')) {
            e.preventDefault();
        }
    });

    initGame();
});