import os
import mysql.connector
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_db_connection():
    # Conexión oficial de MySQL compatible con el SSL de Aiven
    connection = mysql.connector.connect(
        host=os.environ.get('DB_HOST'),
        user=os.environ.get('DB_USER'),
        password=os.environ.get('DB_PASSWORD'),
        database=os.environ.get('DB_NAME'),
        port=int(os.environ.get('DB_PORT', 3306)),
        ssl_disabled=False
    )
    return connection

def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS patients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                age VARCHAR(50),
                gender VARCHAR(50),
                phone VARCHAR(50),
                diagnosis TEXT,
                allergies TEXT,
                nextRefill VARCHAR(50),
                notes TEXT,
                hidden TINYINT(1) DEFAULT 0
            )
        """)
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error al inicializar la base de datos: {e}")

# Crear la tabla al arrancar
init_db()

# 1. Obtener todos los pacientes (GET)
@app.route('/api/patients', methods=['GET'])
def get_patients():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM patients")
        patients = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(patients), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 2. Agregar nuevo paciente (POST)
@app.route('/api/patients', methods=['POST'])
def add_patient():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO patients (name, age, gender, phone, diagnosis, allergies, nextRefill, notes, hidden)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data.get('name'),
            data.get('age'),
            data.get('gender'),
            data.get('phone'),
            data.get('diagnosis'),
            data.get('allergies'),
            data.get('nextRefill'),
            data.get('notes'),
            1 if data.get('hidden') else 0
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Paciente creado correctamente'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 3. Actualizar paciente (PUT)
@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            UPDATE patients
            SET name=%s, age=%s, gender=%s, phone=%s, diagnosis=%s, allergies=%s, nextRefill=%s, notes=%s, hidden=%s
            WHERE id=%s
        """
        values = (
            data.get('name'),
            data.get('age'),
            data.get('gender'),
            data.get('phone'),
            data.get('diagnosis'),
            data.get('allergies'),
            data.get('nextRefill'),
            data.get('notes'),
            1 if data.get('hidden') else 0,
            patient_id
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Paciente actualizado correctamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 4. Eliminar paciente (DELETE)
@app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM patients WHERE id=%s", (patient_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Paciente eliminado correctamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)