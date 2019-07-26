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
          color: 'red',
        },
        {
          id: 'room1-air_humidity',
          module: 'variable',
          device: 'room1-table',
          name: 'Air Humidity',
          suffix: '%',
          color: 'light_blue',
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
        { id: 'room1-fan', module: 'switch', name: 'Fan' },
        { id: 'room1-rgb', module: 'rgb', name: 'LED Strip' },
        // { id: 'room1-rgb2', module: 'rgb', name: 'Mood Light 2' },
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
          color: 'red',
        },
        {
          id: 'balcony-air_humidity',
          device: 'balcony-meteo',
          module: 'variable',
          name: 'Air Humidity',
          suffix: '%',
          color: 'light_blue',
        },
        {
          id: 'balcony-air_pressure',
          device: 'balcony-meteo',
          module: 'variable',
          name: 'Air Pressure',
          suffix: ' hPa',
          color: 'blue',
        },
      ],
    ],
  },
  {
    id: 'corridor',
    name: 'Corridor',
    items: [
      [
        { id: 'corridor-buzzer', module: 'buzzer', name: 'Intercom' },
      ],
      [
        { id: 'corridor-light', module: 'motion-switch', name: 'Light' },
      ],
    ],
  },
  {
    id: 'room2',
    name: 'Room 2',
    items: [
      [
        {
          id: 'room2-air_temperature',
          module: 'variable',
          device: 'room2-table',
          name: 'Air Temperature',
          suffix: ' °C',
          color: 'red',
        },
        {
          id: 'room2-air_humidity',
          module: 'variable',
          device: 'room2-table',
          name: 'Air Humidity',
          suffix: '%',
          color: 'light_blue',
        },
      ],
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    items: [
      [
        {
          id: 'kitchen-air_temperature',
          module: 'variable',
          device: 'kitchen-table',
          name: 'Air Temperature',
          suffix: ' °C',
          color: 'red',
        },
        {
          id: 'kitchen-air_humidity',
          module: 'variable',
          device: 'kitchen-table',
          name: 'Air Humidity',
          suffix: '%',
          color: 'light_blue',
        },
      ],
    ],
  },
];