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
    chatId: -123,
    token: '307142828:AAHVfYBPlRnHIXjDGB5qVkjMaR2xPdUF7CQ',
    rules: [
      module => module.send('Server started'),
      module => {
        module.core.aedes.on('publish', ({ topic, payload }) => {
          if (topic === 'variable/door') {
            try {
              const data = JSON.parse(payload.toString());

              let msg = `Door was ${data}`;

              module.send(msg);
            } catch (e) {
              console.error(e);
            }
          }
        });
      },
    ],
  },
];