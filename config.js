module.exports = {
  modules: [
    {
      name: 'switch',
      local: true,
    },
  ],
  dashboard: [
    {
      id: 'my-room',
      name: 'My Room',
      items: [
        { id: 'my-room_switch', module: 'switch', name: 'Switch 1' },
        { id: 'my-room_switch2', module: 'switch', name: 'Switch 2' },
      ],
    },
    {
      id: 'corridor',
      name: 'Corridor',
      items: [
        { id: 'corridor_switch', module: 'switch', name: 'Switch 3' },
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
