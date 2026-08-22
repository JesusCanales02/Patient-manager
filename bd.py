import os
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Crear tabla de pacientes
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS patients (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                age TEXT,
                gender TEXT,
                phone TEXT,
                diagnosis TEXT,
                allergies TEXT,
                nextRefill TEXT,
                notes TEXT,
                hidden INT DEFAULT 0
            )
        """)
        # Crear tabla de usuarios para el Login
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                matricula TEXT UNIQUE NOT NULL,
                name TEXT,
                password TEXT NOT NULL
            )
        """)
        # Crear un usuario de prueba si no existe
        cursor.execute("""
            INSERT INTO users (matricula, name, password)
            VALUES ('e9837', 'Usuario Pruebas', '123456')
            ON CONFLICT (matricula) DO NOTHING;
        """)
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error iniciando DB: {e}")

# Manejador antes de cada petición para asegurar las tablas sin tumbar Vercel
@app.before_request
def setup():
    if not getattr(app, '_got_first_request', False):
        init_db()
        app._got_first_request = True

def format_allergies(allergies_data):
    if isinstance(allergies_data, list):
        return ", ".join(map(str, allergies_data))
    return str(allergies_data or '')

@app.route('/api/patients', methods=['GET'])
def get_patients():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM patients ORDER BY id ASC")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients', methods=['POST'])
def add_patient():
    try:
        data = request.json or {}
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO patients (name, age, gender, phone, diagnosis, allergies, nextRefill, notes, hidden)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            str(data.get('name', '')),
            str(data.get('age', '')),
            str(data.get('gender', '')),
            str(data.get('phone', '')),
            str(data.get('diagnosis', '')),
            format_allergies(data.get('allergies')),
            str(data.get('nextRefill', '')),
            str(data.get('notes', '')),
            1 if data.get('hidden') else 0
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Paciente creado'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    try:
        data = request.json or {}
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE patients
            SET name=%s, age=%s, gender=%s, phone=%s, diagnosis=%s, allergies=%s, nextRefill=%s, notes=%s, hidden=%s
            WHERE id=%s
        """, (
            str(data.get('name', '')),
            str(data.get('age', '')),
            str(data.get('gender', '')),
            str(data.get('phone', '')),
            str(data.get('diagnosis', '')),
            format_allergies(data.get('allergies')),
            str(data.get('nextRefill', '')),
            str(data.get('notes', '')),
            1 if data.get('hidden') else 0,
            patient_id
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Paciente actualizado'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE patients SET hidden = 1 WHERE id = %s", (patient_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Paciente ocultado/archivado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json or {}
        matricula = data.get('matricula')
        password = data.get('password')

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, matricula, name FROM users WHERE matricula = %s AND password = %s",
            (matricula, password)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user:
            return jsonify({'message': 'Login exitoso', 'user': user}), 200
        else:
            return jsonify({'error': 'Matrícula o contraseña incorrecta'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)