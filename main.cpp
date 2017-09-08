#include "MicroBit.h"
MicroBit uBit;

#define EVENT_ID    8888
#define AlarmOn   18
#define AlarmOff  19

bool run = false;

void onConnected(MicroBitEvent) {
  //uBit.display.print("C");
}

 
void onDisconnected(MicroBitEvent){
  //uBit.display.print("D");
}


void onControllerEvent(MicroBitEvent e) {
  //uBit.display.print(e.value);

  if (e.value == AlarmOn)  
    run = true;
 
  if (e.value == AlarmOff)   
    run = false;

}

void showHeart() {
  while (1) {
    if (run) {
      uBit.io.P1.setAnalogValue(0); 
      uBit.sleep(100);
      uBit.io.P1.setAnalogValue(1023); 
      uBit.sleep(100);
    }
    
    uBit.sleep(500);    
  }
}

int main() {
    uBit.init();
    uBit.display.scroll("DC");
    create_fiber(showHeart);

    new MicroBitIOPinService(*uBit.ble, uBit.io);

    uBit.messageBus.listen(MICROBIT_ID_BLE, MICROBIT_BLE_EVT_CONNECTED, onConnected);
    uBit.messageBus.listen(MICROBIT_ID_BLE, MICROBIT_BLE_EVT_DISCONNECTED, onDisconnected);
    uBit.messageBus.listen(EVENT_ID, MICROBIT_EVT_ANY, onControllerEvent);

    
    release_fiber();
}
