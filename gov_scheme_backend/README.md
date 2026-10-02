# AI-Powered Government Scheme Assistant

## 📌 Problem Statement
Citizens find it difficult to identify eligible government welfare schemes due to complex criteria and language barriers.  
This project provides a simple web-based assistant to help users find schemes they are eligible for.

---

## 🚀 Features
- Check eligibility for government schemes
- Multilingual support (English, Hindi, Marathi)
- Backend using FastAPI
- Frontend using HTML, CSS, JavaScript
- User-friendly interface

---

## 🛠️ Tech Stack
- Python (FastAPI)
- HTML, CSS, JavaScript
- JSON (scheme data)
- CORS Middleware

---

## 📂 Project Structure
```
gov_scheme_backend/
├── app/
│   ├── main.py           # FastAPI application
│   └── schemes.json      # Scheme data
├── frontend/
│   ├── index.html        # Main page
│   ├── script.js         # Frontend logic
│   └── style.css         # Styling
└── README.md             # Project documentation
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.7+
- pip (Python package installer)

### 1. Clone the repository
```bash
git clone <repository-url>
cd gov_scheme_backend
```

### 2. Install dependencies
```bash
pip install fastapi uvicorn
```

---

## 🚀 Running the Application

### Start the backend server
```bash
uvicorn app.main:app --reload
```
The server will start at `http://127.0.0.1:8000`

### Start the frontend server
Open a new terminal and run:
```bash
cd frontend
python -m http.server 5500
```
The frontend will be available at `http://localhost:5500`

### Access the application
Open [http://localhost:5500](http://localhost:5500) in your browser.

---

## 📝 How It Works

### 1. User enters details
- Name, Age, Income, State, Category, Gender, Occupation
- Selects preferred language (English/Hindi/Marathi)

### 2. Frontend sends request
```javascript
fetch("http://127.0.0.1:8000/check-eligibility", {
    method: "POST",
    body: JSON.stringify(data)
});
```

### 3. Backend checks eligibility
- Compares user data with schemes in `schemes.json`
- Checks age, income, state, category, and occupation

### 4. Returns eligible schemes
```json
{
    "eligible_schemes": [
        {
            "id": "SCH001",
            "name": "PM Kisan",
            "state": "All",
            "min_age": 18,
            "max_income": null,
            "category": "Farmer",
            "documents": ["Aadhaar Card", "Landholding papers", "Savings Bank Account"],
            "benefits": "₹6000 per year",
            "apply_link": "https://pmkisan.gov.in"
        }
    ]
}
```

### 5. Frontend displays results
- Shows eligible schemes in the selected language
- Includes benefits, required documents, and apply link

---

## 📊 Scheme Data Format

The `app/schemes.json` file contains scheme information in the following format:
```json
[
    {
        "id": "SCH001",
        "name": "Scheme Name",
        "state": "All / State Name",
        "min_age": 18,
        "max_income": 500000,
        "category": "Category Name",
        "documents": ["Document 1", "Document 2"],
        "benefits": "Benefits description",
        "apply_link": "https://example.com"
    }
]
```

---

## 🌐 Multilingual Support

The application supports three languages:
- **English** (en)
- **Hindi** (hi)
- **Marathi** (mr)

Users can switch languages using the dropdown in the frontend.

---

## 🎯 Eligibility Criteria

The backend checks the following criteria:
- **Age**: `user_age >= min_age`
- **Income**: `user_income <= max_income` (if `max_income` is not null)
- **State**: `user_state == scheme_state` or `scheme_state == "All"`
- **Category**: `user_category == scheme_category` or `scheme_category == "All"`
- **Occupation**: `user_occupation == scheme_occupation` or `scheme_occupation == "All"`

---

## 🔧 Adding New Schemes

To add a new scheme:
1. Open `app/schemes.json`
2. Add the scheme object to the array:
```json
{
    "id": "SCH016",
    "name": "New Scheme",
    "state": "All",
    "min_age": 20,
    "max_income": 400000,
    "category": "Student",
    "documents": ["Aadhaar", "ID Proof"],
    "benefits": "Scholarship amount",
    "apply_link": "https://newscheme.gov.in"
}
```
3. Restart the backend server

---

## 🧪 Testing

### Run backend tests
```bash
# (No tests currently implemented)
```

### Manual testing
1. Open [http://localhost:5500](http://localhost:5500)
2. Enter different user details
3. Verify that eligible schemes are displayed correctly
4. Test all three languages

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For issues or questions, please open an issue in the repository.