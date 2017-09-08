# Pill Reminder Sensor 
# with micro:bit, Google Sheets and NodeJS


1. The schedule time is entered in Google Sheets, column "InputTime"
2. Google Sheets script is running every 5 minutes to check the status and communicate to NodeJS app via webhook (e.g., to activate the alarm)
3. When the time has come, the LED light will blink to alert user to take the pill.
4. The LED light will only stop blinking once user open the container to take the pill.
5. And the timestamp will be recorded  in Google Sheets, column "Timestamp"
6. Finally, the process will start from the beginning again


https://youtu.be/q7HWJAYEdoI
