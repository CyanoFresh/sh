const WebSocket = require('ws');

const wss = new WebSocket.Server({port: 8080});

const state = {
    switches: [
        {id: 1, name: 'Switch 1', state: false},
        {id: 2, name: 'Switch 2', state: true},
        {id: 3, name: 'Switch 3', state: false},
    ]
};

wss.on('connection', function (ws) {
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        console.log('received: %s', message);

        switch (data.type) {
            case 'UPDATE_SWITCH': {
                state.switches = state.switches.map(item => {
                    if (item.id === data.payload.id) {
                        return {...item, ...data.payload};
                    }

                    return item;
                });

                broadcast({
                    type: 'UPDATE_SWITCH',
                    payload: data.payload,
                });

                break
            }
            default:
                console.log('unknown command type: %s', data.type);
                break
        }
    });

    ws.send(JSON.stringify({
        type: 'INIT',
        payload: state
    }));
});

const broadcast = (data, ws) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
            client.send(JSON.stringify(data))
        }
    })
};