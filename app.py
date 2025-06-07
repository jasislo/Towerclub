from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from models import db, User, Profile
from config import Config
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
app.config.from_object(Config)
db.init_app(app)

# Create database tables
with app.app_context():
    db.create_all()

# Route for the homepage
@app.route('/')
def home():
    return render_template('index.html')

# Route for the "About Us" page
@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    try:
        user = User(
            email=data['email'],
            name=data['name']
        )
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/update-profile', methods=['POST'])
def update_profile():
    data = request.get_json()
    try:
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if not user.profile:
            profile = Profile(user=user)
            db.session.add(profile)
        else:
            profile = user.profile

        profile.bio = data.get('bio', profile.bio)
        profile.phone = data.get('phone', profile.phone)
        
        db.session.commit()
        return jsonify(user.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

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