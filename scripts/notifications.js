// Notification settings management
class NotificationSettings {
    constructor() {
        this.pushNotifications = document.getElementById('pushNotifications');
        this.emailNotifications = document.getElementById('emailNotifications');
        this.locationServices = document.getElementById('locationServices');
        this.saveButton = document.getElementById('saveChanges');

        this.loadSettings();
        this.attachEventListeners();
    }

    loadSettings() {
        // Load saved settings from localStorage
        const settings = JSON.parse(localStorage.getItem('notificationSettings')) || {
            push: true,
            email: true,
            location: true
        };

        this.pushNotifications.checked = settings.push;
        this.emailNotifications.checked = settings.email;
        this.locationServices.checked = settings.location;
    }

    saveSettings() {
        const settings = {
            push: this.pushNotifications.checked,
            email: this.emailNotifications.checked,
            location: this.locationServices.checked
        };

        // Save to localStorage
        localStorage.setItem('notificationSettings', JSON.stringify(settings));

        // Update server settings
        this.updateServerSettings(settings);
    }

    async updateServerSettings(settings) {
        try {
            const response = await fetch('/api/settings/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }

            // Show success message
            this.showToast('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showToast('Failed to save settings', 'error');
        }
    }

    showToast(message, type = 'success') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        // Add to document
        document.body.appendChild(toast);

        // Remove after animation
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    attachEventListeners() {
        this.saveButton.addEventListener('click', () => {
            this.saveSettings();
        });

        // Handle permission requests for push notifications
        this.pushNotifications.addEventListener('change', async (e) => {
            if (e.target.checked) {
                try {
                    const permission = await Notification.requestPermission();
                    if (permission !== 'granted') {
                        e.target.checked = false;
                        this.showToast('Permission denied for push notifications', 'error');
                    }
                } catch (error) {
                    console.error('Error requesting notification permission:', error);
                    e.target.checked = false;
                }
            }
        });

        // Handle location services permission
        this.locationServices.addEventListener('change', async (e) => {
            if (e.target.checked) {
                try {
                    const permission = await navigator.permissions.query({ name: 'geolocation' });
                    if (permission.state === 'denied') {
                        e.target.checked = false;
                        this.showToast('Permission denied for location services', 'error');
                    }
                } catch (error) {
                    console.error('Error requesting location permission:', error);
                    e.target.checked = false;
                }
            }
        });
    }
}

// Initialize notification settings
document.addEventListener('DOMContentLoaded', () => {
    new NotificationSettings();
}); 