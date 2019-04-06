module.exports = [
  {
    id: 'main',
    name: 'Main Panel',
    items: [
      {
        id: 'room1',
        name: 'Room One',
        items: [
          [
            'room1-air_temperature',
            'room1-air_humidity',
            'room1-plant',
          ],
          [
            'room1-light',
            'room1-secondary_light',
            'room1-rgb',
          ],
        ],
      },
      {
        id: 'balcony',
        name: 'Balcony',
        items: [
          [
            'balcony-air_temperature',
            'balcony-air_humidity',
            'balcony-air_pressure',
          ],
        ],
      },
      {
        id: 'corridor',
        name: 'Corridor',
        items: [
          [
            'corridor-buzzer',
          ],
          [
            'corridor-light_switch',
          ],
        ],
      },
    ],
  },
  {
    id: 'corridor-display',
    name: 'Corridor Display',
    items: [
      {
        id: 'corridor',
        name: 'Corridor',
        items: [
          [
            'corridor-buzzer',
          ],
          [
            'corridor-light_switch',
          ],
        ],
      },
      {
        id: 'room1',
        name: 'Room One',
        items: [
          [
            'room1-light',
            'room1-secondary_light',
            'room1-rgb',
          ],
        ],
      },
      {
        id: 'balcony',
        name: 'Balcony',
        items: [
          [
            'balcony-air_temperature',
            'balcony-air_pressure',
          ],
        ],
      },
    ],
  },
];