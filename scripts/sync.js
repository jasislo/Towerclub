function syncUserData() {
    // Sync with backend
    const userData = JSON.parse(localStorage.getItem('userAccountData') || '{}');
    
    fetch('/api/user/sync', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        // Update local storage with any changes from server
        localStorage.setItem('userAccountData', JSON.stringify(data));
    })
    .catch(error => console.error('Error syncing user data:', error));
}