import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_NAME = "farmacia.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                age TEXT,
                gender TEXT,
                phone TEXT,
                diagnosis TEXT,
                allergies TEXT,
                nextRefill TEXT,
                notes TEXT,
                hidden INTEGER DEFAULT 0
            )
        """)
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error iniciando SQLite: {e}")

init_db()

@app.route('/api/patients', methods=['GET'])
def get_patients():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM patients")
        rows = cursor.fetchall()
        conn.close()
        patients = [dict(row) for row in rows]
        return jsonify(patients), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients', methods=['POST'])
def add_patient():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO patients (name, age, gender, phone, diagnosis, allergies, nextRefill, notes, hidden)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.get('name'), data.get('age'), data.get('gender'), data.get('phone'),
            data.get('diagnosis'), data.get('allergies'), data.get('nextRefill'),
            data.get('notes'), 1 if data.get('hidden') else 0
        ))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Paciente creado'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE patients
            SET name=?, age=?, gender=?, phone=?, diagnosis=?, allergies=?, nextRefill=?, notes=?, hidden=?
            WHERE id=?
        """, (
            data.get('name'), data.get('age'), data.get('gender'), data.get('phone'),
            data.get('diagnosis'), data.get('allergies'), data.get('nextRefill'),
            data.get('notes'), 1 if data.get('hidden') else 0, patient_id
        ))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Paciente actualizado'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Paciente eliminado'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)