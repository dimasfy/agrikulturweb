#include <Wire.h>
#include <BH1750.h>
#include <DHT.h>
#define DHTPIN 10
#define DHTTYPE DHT22
#define PIN8 8
#define PIN9 9
#define PIN11 11
#define PIN13 13

BH1750 lightMeter;
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  Wire.begin();
  lightMeter.begin();
  dht.begin();
  pinMode(PIN8, INPUT);
  pinMode(PIN9, INPUT);
  pinMode(PIN11, OUTPUT);
  pinMode(PIN13, OUTPUT);
}

void loop() {
  
  // BH1750
  float lux = lightMeter.readLightLevel();
  if (lux < 100) {
    digitalWrite(PIN11, HIGH);
  } else {
    digitalWrite(PIN11, LOW);
  }

  // DHT
  float temperature = dht.readTemperature();
  if (temperature > 30) {
    digitalWrite(PIN13, HIGH);
  } else {
    digitalWrite(PIN13, LOW);
  }

  int pin8State = digitalRead(PIN8); // FSR
  int pin9State = digitalRead(PIN9); // LDR

  Serial.print(temperature);
  Serial.print(",");
  
  Serial.print(lux);
  Serial.print(",");

  if (pin9State == 1){
    Serial.print("4");
  } else {
    Serial.print("5");
  }
  Serial.print(",");
  
  if (pin8State == 1){
    Serial.println("2");
  } else {
    Serial.println("3");
  }

  delay(1000);
}
