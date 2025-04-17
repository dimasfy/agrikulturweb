from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
from flask_pymysql import MySQL
import json

app = Flask(__name__)

pymysql_connect_kwargs = {
    'user': 'kel1',
    'password': 'pi',
    'port': 3306,
    'host': 'localhost',
    'database': 'agrikultur',
    'autocommit': True,
    'cursorclass': 'DictCursor'
}

app.config['pymysql_kwargs'] = pymysql_connect_kwargs
mysql = MySQL(app)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def index():
    return render_template("index.html")
   
@app.route('/data', methods=['POST'])
def data_serial():
    datareq = request.json  
    print(datareq)
    socketio.emit('updateSensorData', json.dumps(datareq))  
    cursor = mysql.connection.cursor()
    cursor.execute("INSERT INTO agrikultur.`kelompok1` (suhu, intensitas_cahaya, status_air, status_padi) VALUES (%s, %s, %s, %s);",
                   (datareq['suhu'], datareq['intensitas'], datareq['water_status'], datareq['harvest_status']))
    cursor.close()
    pesan = {"status": 200, "data": datareq}  
    return jsonify(pesan)  


@socketio.on("connect")
def connect():
    print("Client connected")

@socketio.on("disconnect")
def disconnect():
    print("Client disconnected", request.sid)