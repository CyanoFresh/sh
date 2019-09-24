module.exports = [
  {
    id: 'switch',
    local: true,
    frontend: true,
  },
  {
    id: 'variable',
    local: true,
    frontend: true,
  },
  {
    id: 'buzzer',
    local: true,
    frontend: true,
  },
  {
    id: 'rgb',
    local: true,
    frontend: true,
  },
  {
    id: 'plant',
    local: true,
    frontend: true,
  },
  {
    id: 'motion-switch',
    local: true,
    frontend: true,
  },
  {
    id: 'telegram',
    local: true,
    frontend: false,
    chatId: process.env.TELEGRAM_CHATID,
    token: process.env.TELEGRAM_TOKEN,
    listeners: [
      {
        name: 'On server start',
        callback: instance =>
          instance.core.on('core.init', () =>
            instance.send('Server started'),
          ),
      },
      {
        name: 'On device disconnect',
        callback: instance => setTimeout(
          () =>
            instance.core.on('device.disconnected',
              deviceId =>
                instance.send(`Device '${deviceId}' disconnected`),
            ),
          5000,
        ),
      },
      {
        name: 'On device connect',
        callback: instance => setTimeout(
          () =>
            instance.core.on('device.connected',
              deviceId =>
                instance.send(`Device '${deviceId}' connected`),
            ),
          5000,
        ),
      },
      {
        name: 'On buzzer unlocked',
        callback: instance => instance.core.on('buzzer.unlocked', () => instance.send(`Buzzer was unlocked`)),
      },
      {
        name: 'On buzzer auto unlock change',
        callback: instance => instance.core.on(
          'buzzer.auto_unlock',
          (itemId, isAutoUnlock) =>
            isAutoUnlock && instance.send(`Buzzer will be auto-unlocked for 5 minutes`)
        ),
      },
    ],
  },
];
