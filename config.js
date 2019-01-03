module.exports = {
  modules: [
    {
      id: 'switch',
      local: true,
    },
    {
      id: 'variable',
      local: true,
    },
    {
      id: 'intercom',
      local: true,
    },
    {
      id: 'rgb',
      local: true,
    },
  ],
  dashboard: [
    {
      id: 'my-room',
      name: 'My Room',
      items: [
        { id: 'my-room_temperature', module: 'variable', name: 'Air Temperature', suffix: ' °C' },
        { id: 'my-room_humidity', module: 'variable', name: 'Air Humidity', suffix: '%' },
        { id: 'my-room_switch', module: 'switch', name: 'Main Light' },
        { id: 'my-room_switch2', module: 'switch', name: 'Ambient Light' },
        { id: 'my-room_rgb', module: 'rgb', name: 'Ambient Lights' },
      ],
    },
    {
      id: 'corridor',
      name: 'Corridor',
      items: [
        { id: 'corridor_temperature', module: 'variable', name: 'Air Temperature', suffix: ' °C' },
        { id: 'corridor_humidity', module: 'variable', name: 'Air Humidity', suffix: '%' },
        { id: 'corridor_switch', module: 'switch', name: 'Light' },
        { id: 'corridor_intercom', module: 'intercom', name: 'Intercom' },
      ],
    },
  ],
  users: [
    {
      id: 'cyanofresh',
      password: 'qwerty',
      name: 'Alex',
    },
  ],
  devices: [
    {
      id: 'my-room_table',
      password: 'hi',
    }
  ],
};
