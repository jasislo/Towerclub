document.addEventListener('DOMContentLoaded', () => {
    // Get current user from localStorage or session
    const currentUser = JSON.parse(localStorage.getItem('memberProfile') || '{}').username;
    if (!currentUser) return;

    document.querySelectorAll('.follow-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const userCard = btn.closest('.user-card');
            const targetUser = userCard.getAttribute('data-username');
            if (!targetUser || targetUser === currentUser) return;

            // Get followers from localStorage (simulate backend)
            let followersMap = JSON.parse(localStorage.getItem('followersMap') || '{}');
            if (!followersMap[targetUser]) followersMap[targetUser] = [];
            if (!followersMap[targetUser].includes(currentUser)) {
                followersMap[targetUser].push(currentUser);
                localStorage.setItem('followersMap', JSON.stringify(followersMap));
                btn.textContent = 'Following';
                btn.disabled = true;
            }
        });
    });
});