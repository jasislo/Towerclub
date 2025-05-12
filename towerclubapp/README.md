# Tower Club App

## Overview
The Tower Club App is a web application designed to manage users, products, and orders for the Tower Club. It utilizes Flask as the web framework and SQLAlchemy for database interactions.

## Project Structure
```
towerclubapp
├── src
│   ├── models
│   │   └── models.py       # Domain models for the application
│   ├── routes
│   │   └── index.py        # Routing for handling HTTP requests
│   ├── services
│   │   └── __init__.py     # Service functions for business logic
│   ├── app.py              # Entry point of the application
│   └── config.py           # Configuration settings
├── requirements.txt         # Project dependencies
├── .env                     # Environment variables
└── README.md                # Project documentation
```

## Setup Instructions
1. **Clone the repository:**
   ```
   git clone https://github.com/yourusername/towerclubapp.git
   cd towerclubapp
   ```

2. **Create a virtual environment:**
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies:**
   ```
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a `.env` file in the root directory and add your environment variables, such as database URL and secret keys.

5. **Run the application:**
   ```
   python src/app.py
   ```

## Usage
- Access the application in your web browser at `http://localhost:5000`.
- Use the defined routes to interact with the application.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.