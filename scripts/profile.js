document.addEventListener('DOMContentLoaded', () => {
    const profileContainer = document.querySelector('.profile-container');
    const editButton = document.querySelector('.edit-button');
    const settingsButton = document.querySelector('.settings-button');
    const activityItems = document.querySelectorAll('.activity-item');
    const profilePictureInputs = document.querySelectorAll('.profile-picture-input');
    const profilePictures = document.querySelectorAll('.profile-picture');

    // Add fade-in animation
    profileContainer.classList.add('fade-in');

    // Handle edit button click
    editButton.addEventListener('click', () => {
        // Here you would typically open an edit profile modal or navigate to edit page
        console.log('Edit profile clicked');
    });

    // Handle settings button click
    settingsButton.addEventListener('click', () => {
        // Here you would typically open settings modal or navigate to settings page
        console.log('Settings clicked');
    });

    // Format currency values
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    };

    // Format time ago
    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' years ago';

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' months ago';

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' days ago';

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' hours ago';

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' minutes ago';

        return Math.floor(seconds) + ' seconds ago';
    };

    // Update activity times
    const updateActivityTimes = () => {
        activityItems.forEach(item => {
            const timeElement = item.querySelector('.activity-time');
            const timestamp = new Date(timeElement.dataset.timestamp);
            timeElement.textContent = formatTimeAgo(timestamp);
        });
    };

    // Initialize activity times
    updateActivityTimes();

    // Update activity times every minute
    setInterval(updateActivityTimes, 60000);

    // Add hover effect to activity items
    activityItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(5px)';
            item.style.transition = 'transform 0.3s ease';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
        });
    });

    // Example of how to update stats (you would typically get this data from an API)
    const updateStats = (data) => {
        const totalBalance = document.querySelector('.stat-card:nth-child(1) .stat-value');
        const totalProfit = document.querySelector('.stat-card:nth-child(2) .stat-value');
        const totalTrades = document.querySelector('.stat-card:nth-child(3) .stat-value');

        if (totalBalance) totalBalance.textContent = formatCurrency(data.totalBalance);
        if (totalProfit) totalProfit.textContent = formatCurrency(data.totalProfit);
        if (totalTrades) totalTrades.textContent = data.totalTrades;
    };

    // Example of how to update activities (you would typically get this data from an API)
    const updateActivities = (activities) => {
        const activityList = document.querySelector('.activity-list');
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <span class="material-icons">${activity.icon}</span>
                </div>
                <div class="activity-info">
                    <h4>${activity.type}</h4>
                    <p class="activity-time" data-timestamp="${activity.timestamp}">${formatTimeAgo(new Date(activity.timestamp))}</p>
                </div>
                <div class="activity-amount ${activity.amount >= 0 ? 'positive' : 'negative'}">
                    ${formatCurrency(activity.amount)}
                </div>
            </div>
        `).join('');
    };

    // Sync all profile pictures
    const syncProfilePictures = (newSrc) => {
        profilePictures.forEach(picture => {
            picture.src = newSrc;
        });
        // Save to localStorage for cross-page sync
        localStorage.setItem('profilePicture', newSrc);
    };

    // Handle profile picture upload
    profilePictureInputs.forEach(input => {
        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const newSrc = e.target.result;
                    syncProfilePictures(newSrc); // Sync all profile pictures
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // On page load, set profile picture from localStorage if available
    const savedProfilePicture = localStorage.getItem('profilePicture');
    if (savedProfilePicture) {
        profilePictures.forEach(picture => {
            picture.src = savedProfilePicture;
        });
    }

    // Save analytics data
    function saveAnalytics(data) {
        localStorage.setItem('analytics', JSON.stringify(data));
    }

    // Load analytics data
    function loadAnalytics() {
        return JSON.parse(localStorage.getItem('analytics')) || {};
    }

    // On analytics page
    const analytics = loadAnalytics();
    updateAnalyticsUI(analytics);

    // Example user card functionality
    const userCards = document.querySelectorAll('.user-card');
    userCards.forEach(card => {
        const followButton = card.querySelector('.follow-btn');
        followButton.addEventListener('click', () => {
            const username = card.dataset.username;
            // Here you would typically handle the follow/unfollow logic
            console.log(followButton.textContent === 'Follow' ? `Followed ${username}` : `Unfollowed ${username}`);
            followButton.textContent = followButton.textContent === 'Follow' ? 'Unfollow' : 'Follow';
        });
    });
});