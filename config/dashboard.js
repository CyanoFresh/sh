module.exports = [
  {
    id: 'room1',
    name: 'Room One',
    items: [
      [
        {
          id: 'room1-air_temperature',
          module: 'variable',
          device: 'room1-table',
          name: 'Air Temperature',
          suffix: ' °C',
        },
        {
          id: 'room1-air_humidity',
          module: 'variable',
          device: 'room1-table',
          name: 'Air Humidity',
          suffix: '%',
        },
        {
          id: 'room1-plant',
          module: 'plant',
          device: 'room1-plant',
          name: 'Plant',
        },
      ],
      [
        { id: 'room1-light', module: 'switch', name: 'Light' },
        { id: 'room1-secondary_light', module: 'switch', name: 'Secondary Light' },
        { id: 'room1-rgb', module: 'rgb', name: 'LED Strip' },
        // { id: 'room1-rgb2', module: 'rgb', name: 'Mood Light 2' },
      ],
    ],
  },
  {
    id: 'corridor',
    name: 'Corridor',
    items: [
      [
        { id: 'corridor-buzzer', module: 'buzzer', name: 'Intercom' },
        { id: 'corridor-door', module: 'variable', name: 'Door' },
      ],
      [
        { id: 'corridor-light', module: 'motion-switch', name: 'Light' },
      ],
    ],
  },
  {
    id: 'balcony',
    name: 'Balcony',
    items: [
      [
        {
          id: 'balcony-air_temperature',
          module: 'variable',
          device: 'balcony-meteo',
          name: 'Air Temperature',
          suffix: ' °C',
        },
        {
          id: 'balcony-air_humidity',
          device: 'balcony-meteo',
          module: 'variable',
          name: 'Air Humidity',
          suffix: '%',
        },
        {
          id: 'balcony-air_pressure',
          device: 'balcony-meteo',
          module: 'variable',
          name: 'Air Pressure',
          suffix: ' hPa',
          historyCount: 60,
        },
      ],
    ],
  },
];