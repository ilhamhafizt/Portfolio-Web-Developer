"""
Portfolio Contact Form - Python Flask Backend
PostgreSQL Database (pgAdmin 4 compatible)

Requirements:
    pip install flask flask-cors psycopg2-binary python-dotenv

Setup:
    1. Buat file .env di folder ini (lihat contoh .env.example)
    2. Buat database di pgAdmin 4 (lihat instruksi di bawah)
    3. Jalankan: python app.py

pgAdmin 4 Setup:
    - Buka pgAdmin 4
    - Buat database baru: portfolio_db
    - Query Tool → jalankan CREATE TABLE di bawah ini
    - Isi konfigurasi di .env

SQL Setup (jalankan di pgAdmin 4 Query Tool):
    CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        subject VARCHAR(200),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import psycopg2.extras
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["*"])  # In production, replace * with your domain

# ===== DATABASE CONFIG =====
DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "port":     os.getenv("DB_PORT", "5432"),
    "dbname":   os.getenv("DB_NAME", "portfolio_db"),
    "user":     os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
}


def get_connection():
    """Create and return a PostgreSQL connection."""
    return psycopg2.connect(**DB_CONFIG)


def init_db():
    """Create the contacts table if it doesn't exist."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS contacts (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL,
            subject VARCHAR(200),
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    cur.close()
    conn.close()
    print("✅ Database initialized — contacts table ready.")


# ===== ROUTES =====

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "ok", "message": "Portfolio API is running 🚀"})


@app.route("/contact", methods=["POST"])
def submit_contact():
    """Receive contact form data and store in PostgreSQL."""
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data received"}), 400

    name    = (data.get("name") or "").strip()
    email   = (data.get("email") or "").strip()
    subject = (data.get("subject") or "").strip()
    message = (data.get("message") or "").strip()

    # Basic validation
    if not name or not email or not message:
        return jsonify({"error": "Name, email, and message are required."}), 422

    if "@" not in email:
        return jsonify({"error": "Invalid email address."}), 422

    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO contacts (name, email, subject, message)
            VALUES (%s, %s, %s, %s)
            RETURNING id, created_at;
            """,
            (name, email, subject, message)
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Contact message saved successfully.",
            "id": row[0],
            "timestamp": str(row[1])
        }), 201

    except psycopg2.OperationalError as e:
        print(f"❌ DB connection error: {e}")
        return jsonify({"error": "Database connection failed. Please check your config."}), 500

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": "Internal server error."}), 500


@app.route("/contacts", methods=["GET"])
def get_contacts():
    """Get all contact messages (for admin/dev use)."""
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT * FROM contacts ORDER BY created_at DESC;")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify({"data": [dict(r) for r in rows], "count": len(rows)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===== RUN =====
if __name__ == "__main__":
    print("🌿 Starting Portfolio Backend...")
    init_db()
    app.run(debug=True, host="0.0.0.0", port=5000)
