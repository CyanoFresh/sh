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
    rules: [
      {
        trigger: {
          event: 'buzzer.ringing',
          params: ['corridor.buzzer'],
        },
      },
    ],
  },
];