import paho.mqtt.publish as publish
import serial
import requests
import json

com = serial.Serial('/dev/ttyUSB0', 9600)
kirim_panen = False

def publish_mqtt(topic, message):
    mqtt_host = "192.168.220.158"  
    mqtt_port = 1883  
    publish.single(topic, message, hostname=mqtt_host, port=mqtt_port)
    
def status(water_status, harvest_status):
    water_status = "Air kurang!" if water_status == '4' else "Air cukup!"
    harvest_status = "Siap panen!" if harvest_status == '2' else "Belum siap panen!"
    return water_status, harvest_status
    
while True:
    if com.inWaiting() > 0:
        com_bytes = com.readline()
        data = com_bytes.decode("utf-8").strip()
        split_data = data.split(",")
        
        if len(split_data) == 4:
            suhu = split_data[0]
            intensitas= split_data[1]
            water_status, harvest_status = status(split_data[2], split_data[3])
        else:
            suhu = split_data[0] if len(split_data) > 0 else 0,
            intensitas = split_data[1] if len(split_data) > 1 else 0,
            water_status = split_data[2] if len(split_data) > 2 else 0,
            harvest_status = split_data[3] if len(split_data) > 3 else 0,
            water_status, harvest_status = status(water_status, harvest_status)
                
        data_sensor = {
            "suhu": suhu,
            "intensitas": intensitas,
            "water_status": water_status,
            "harvest_status": harvest_status,
        }
            
        #print(data_sensor)
        response = requests.post('http://localhost:2552/data', json = data_sensor)
        print(response.text)
        
        # publish mqtt
        publish_mqtt("Kelompok1_Agrikultur/data", json.dumps(data_sensor))
        publish_mqtt("Kelompok1_Agrikultur/air", split_data[2])
        
        if split_data[3] == '2' and not kirim_panen:
            publish_mqtt("Kelompok1_Agrikultur/panen", split_data[3])
            kirim_panen = True
        elif split_data[3] != '2':
            kirim_panen = False
        

