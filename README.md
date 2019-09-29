Solomaha Home [ALPHA]
====

Smart Home hub & control panel written using JS, MQTT and React.

## Installation

1. Clone repo && cd:

    ```
    git clone https://github.com/CyanoFresh/sh
    cd sh
    ```

2. Install deps 

    -  production:
    
        ```
        npm ci
        ```
        
    - dev:
    
        ```
        npm i
        ```
      
3. Copy (if dev) and configure env variables:

    ```sh
    cp .env.example .env
    ```
      
4. If needed configure & build the frontend (in `./frontend` folder)

## Topic structure: (probably outdated)

### Web Panel

`user/{ID}` - state of all items

### Switch

- `switch/{ID}` - switch current state
- `switch/{ID}/set` - change switch state:
    
    ```json
    {
      "state": true
    }
    ```
- `switch/{ID}/toggle` - toggle switch current state

### Variable

- `variable/{ID}` - current value:

    ```
    24.6
    ```
    
- `variable/{ID}/set` - update value ***[TODO]***

### RGB

- `rgb/{ID}` - current state
- `rgb/{ID}/set` - update state. Example:
    
    ```json
    {
        "mode": "color",
        "red": 255,
        "green": 255,
        "blue": 255
    }
    ```

    ```json
    {
        "mode": "rainbow"
    }
    ```

### Buzzer
    
- `buzzer/{ID}/unlock` - unlock command
- `buzzer/{ID}/ringing` - ringing event (sent from device)
    
    ```json
    true
    ```
    or:
    ```json
    false
    ```
    
- `buzzer/{ID}/unlocked` - unlocked event (sent from device)

### Plant

- `plant/{ID}` - current state
    
    ```json
    {
        "moisture": 80
    }
    ```
    config update scenario:
    ```json
    {
        "minMoisture": 80,
        "duration": 2
    }
    ```
    can be combined
    
- `plant/{ID}/water` - water command
- `plant/{ID}/watered` - watered event

