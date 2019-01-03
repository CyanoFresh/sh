Solomaha Home
====

## Topic structure:

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

### Variable

- `variable/{ID}` - current value
- `variable/{ID}/set` - update value ***Experimental***

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

### Intercom

- `intercom/{ID}` - current state
- `intercom/{ID}/unlock` - unlock command
- `intercom/{ID}/answer` - answer command

