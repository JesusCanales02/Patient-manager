import os
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://postgres.dgbanpalylbtmaihrfib:farmacia123!@aws-0-us-west-2.pooler.supabase.com:6543/postgres')

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
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
        conn.commit()
        cursor.close()
        conn.close()
        print("Tabla patients verificada/creada en Supabase")
    except Exception as e:
        print(f"Error iniciando Supabase: {e}")

init_db()

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

@app.route('/admin', methods=['GET'])
def admin_view():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM patients ORDER BY id ASC")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        html = "<h2>Base de Datos Supabase - Pacientes</h2><table border='1' cellpadding='8' style='border-collapse:collapse; font-family:sans-serif;'>"
        if rows:
            html += "<tr style='background-color:#f2f2f2;'>" + "".join([f"<th>{col}</th>" for col in rows[0].keys()]) + "</tr>"
            for row in rows:
                html += "<tr>" + "".join([f"<td>{val if val is not None else ''}</td>" for val in row.values()]) + "</tr>"
        else:
            html += "<tr><td>No hay pacientes registrados.</td></tr>"
        html += "</table>"
        return html, 200
    except Exception as e:
        return f"Error leyendo base de datos: {str(e)}", 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)