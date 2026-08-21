import os
import pymysql
import ssl
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_db_connection():
    # Contexto SSL nativo para evitar errores de buffer en PyMySQL
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    connection = pymysql.connect(
        host=os.environ.get('DB_HOST'),
        user=os.environ.get('DB_USER'),
        password=os.environ.get('DB_PASSWORD'),
        database=os.environ.get('DB_NAME'),
        port=int(os.environ.get('DB_PORT', 3306)),
        ssl=ssl_context,
        cursorclass=pymysql.cursors.DictCursor
    )
    
    with connection.cursor() as cursor:
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
    connection.commit()
    return connection

@app.route('/api/patients', methods=['GET'])
def get_patients():
    db = None
    try:
        db = get_db_connection()
        with db.cursor() as cursor:
            cursor.execute("SELECT * FROM patients ORDER BY id DESC")
            patients = cursor.fetchall()
            
            for p in patients:
                p['hidden'] = bool(p['hidden'])
                
            return jsonify(patients), 200
    except Exception as err:
        print(f"Error MySQL: {err}")
        return jsonify({"error": str(err)}), 500
    finally:
        if db:
            db.close()

@app.route('/api/patients', methods=['POST'])
def add_patient():
    db = None
    try:
        data = request.json
        db = get_db_connection()
        with db.cursor() as cursor:
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
                int(data.get('hidden', False))
            )
            cursor.execute(query, values)
        db.commit()
        return jsonify({"message": "Paciente agregado exitosamente"}), 201
    except Exception as err:
        print(f"Error MySQL: {err}")
        return jsonify({"error": str(err)}), 500
    finally:
        if db:
            db.close()

@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    db = None
    try:
        data = request.json
        db = get_db_connection()
        with db.cursor() as cursor:
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
                int(data.get('hidden', False)),
                patient_id
            )
            cursor.execute(query, values)
        db.commit()
        return jsonify({"message": "Paciente actualizado"}), 200
    except Exception as err:
        print(f"Error MySQL: {err}")
        return jsonify({"error": str(err)}), 500
    finally:
        if db:
            db.close()

@app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    db = None
    try:
        db = get_db_connection()
        with db.cursor() as cursor:
            cursor.execute("DELETE FROM patients WHERE id = %s", (patient_id,))
        db.commit()
        return jsonify({"message": "Paciente eliminado"}), 200
    except Exception as err:
        print(f"Error MySQL: {err}")
        return jsonify({"error": str(err)}), 500
    finally:
        if db:
            db.close()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)