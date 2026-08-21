import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# CORS abierto para permitir peticiones desde cualquier origen en producción
CORS(app)

db_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,
    pool_reset_session=True,
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", ""),
    database=os.getenv("DB_NAME", "farmacia_db"),
    port=int(os.getenv("DB_PORT", 3306))
)

def get_db_connection():
    return db_pool.get_connection()

@app.route('/api/patients', methods=['GET'])
def get_patients():
    db = None
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM patients ORDER BY id DESC")
        patients = cursor.fetchall()
        
        for p in patients:
            p['hidden'] = bool(p['hidden'])
            
        cursor.close()
        return jsonify(patients), 200

    except mysql.connector.Error as err:
        print(f"Error MySQL: {err}")
        return jsonify({"error": "Error interno al consultar datos"}), 500
    finally:
        if db:
            db.close() 

@app.route('/api/patients', methods=['POST'])
def add_patient():
    data = request.json
    
    if not data or not data.get('name') or not str(data.get('name')).strip():
        return jsonify({"error": "El nombre del paciente es obligatorio"}), 400

    db = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        sql = """INSERT INTO patients (name, age, gender, phone, diagnosis, allergies, nextRefill, notes, hidden)
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
                 
        allergies = ", ".join(data.get('allergies', [])) if isinstance(data.get('allergies'), list) else str(data.get('allergies', 'Ninguna'))
        hidden = 1 if data.get('hidden') else 0
        
        values = (
            str(data.get('name')).strip(),
            str(data.get('age', 'No decir')),
            str(data.get('gender', 'No decir')),
            str(data.get('phone', 'Sin teléfono')),
            str(data.get('diagnosis', 'Sin diagnóstico')),
            allergies,
            str(data.get('nextRefill', 'No asignada')),
            str(data.get('notes', 'Sin notas')),
            hidden
        )
        
        cursor.execute(sql, values)
        db.commit()
        new_id = cursor.lastrowid
        
        cursor.close()
        data['id'] = new_id
        return jsonify(data), 201

    except mysql.connector.Error as err:
        print(f"Error MySQL al insertar: {err}")
        return jsonify({"error": "Error de persistencia en base de datos"}), 500
    finally:
        if db:
            db.close()

@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    data = request.json
    if not data:
        return jsonify({"error": "Payload inválido"}), 400

    db = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        sql = """UPDATE patients 
                 SET name=%s, age=%s, gender=%s, phone=%s, diagnosis=%s, allergies=%s, nextRefill=%s, notes=%s, hidden=%s 
                 WHERE id=%s"""
                 
        allergies = ", ".join(data.get('allergies', [])) if isinstance(data.get('allergies'), list) else str(data.get('allergies', 'Ninguna'))
        hidden = 1 if data.get('hidden') else 0
        
        values = (
            str(data.get('name')).strip(),
            str(data.get('age')),
            str(data.get('gender')),
            str(data.get('phone')),
            str(data.get('diagnosis')),
            allergies,
            str(data.get('nextRefill')),
            str(data.get('notes')),
            hidden,
            patient_id
        )
        
        cursor.execute(sql, values)
        db.commit()
        cursor.close()
        
        return jsonify({"success": True}), 200

    except mysql.connector.Error as err:
        print(f"Error MySQL al actualizar: {err}")
        return jsonify({"error": "No se pudo actualizar el registro"}), 500
    finally:
        if db:
            db.close()

@app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    db = None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        cursor.execute("DELETE FROM patients WHERE id = %s", (patient_id,))
        db.commit()
        cursor.close()
        
        return jsonify({"success": True}), 200

    except mysql.connector.Error as err:
        print(f"Error MySQL al eliminar: {err}")
        return jsonify({"error": "No se pudo eliminar el registro"}), 500
    finally:
        if db:
            db.close()

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)