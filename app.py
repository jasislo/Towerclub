from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

# Load configuration from .env file
app.config.from_mapping(
    SECRET_KEY=os.environ.get('SECRET_KEY', 'dev_key'),
    DEBUG=os.environ.get('DEBUG', False)  # Set DEBUG to False for production
)

# Route for the homepage
@app.route('/')
def home():
    return render_template('index.html')

# Route for the "About Us" page
@app.route('/about')
def about():
    return render_template('about.html')

# Route to handle form submissions
@app.route('/update-profile', methods=['POST'])
def update_profile():
    name = request.form.get('name')
    email = request.form.get('email')
    return jsonify({"message": f"Profile updated for {name} with email {email}!"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to TowerClub</title>
    <link rel="stylesheet" href="/static/styles/main.css">
</head>
<body>
    <header>
        <h1>Welcome to TowerClub</h1>
        <nav>
            <a href="/">Home</a>
            <a href="/about">About Us</a>
        </nav>
    </header>
    <main>
        <p>Smart financial management for everyone.</p>
    </main>
    <footer>
        <p>&copy; 2025 TowerClub. All rights reserved.</p>
    </footer>
</body>
</html>

Towerclub web app/
├── app.py
├── templates/
│   ├── index.html
│   ├── about.html
│   ├── domainmodels.html
│   ├── other_pages.html
├── static/
│   ├── styles/
│   │   ├── main.css
│   │   ├── other_styles.css
│   ├── scripts/
│   │   ├── app.js
│   │   ├── other_scripts.js
│   ├── images/
│       ├── towerclub_logo.png
│       ├── other_images.png
├── requirements.txt
├── .env
├── README.md

body {
    font-family: Arial, sans-serif;
    background-color: #f9f9f9;
    margin: 0;
    padding: 0;
}

form {
    margin: 20px;
    padding: 10px;
    border: 1px solid #ccc;
    background-color: #fff;
}