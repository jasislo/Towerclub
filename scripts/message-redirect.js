document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.message-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = 'chatssection.html';
        });
    });
});