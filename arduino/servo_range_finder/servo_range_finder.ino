#include <Servo.h>

// USE this to find the range of your servo and plug the max and min
// into the node script for the camera
// open serial port and press W and enter to increment by 20 microseconds
// press S and enter to decrement by 20 microseconds

Servo myservo;

char c = 'a';

int val = 1450;

void setup(){
  myservo.attach(7);
  myservo.writeMicroseconds(val); 
  //myservo.write(90);
  Serial.begin(9600);
}

void loop(){
  if(Serial.available() > 0){
    c = Serial.read();
    
    changeServo(c);
  }
}

void changeServo(char b){
   switch(b){
      case 'w':
        val+=20;
        myservo.writeMicroseconds(val);
        Serial.println(val);
        break;
      case 's':
        val -= 20;
        myservo.writeMicroseconds(val);
        Serial.println(val);
        break;
      default:
        Serial.println("invalid char");
        break;
   }

}
