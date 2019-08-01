module.exports = [
  {
    id: 'main',
    name: 'Main Panel',
    displayInMenu: true,
    items: [
      {
        id: 'room1',
        name: 'Room 1',
        items: [
          [
            'room1-air_temperature',
            'room1-air_humidity',
            // 'room1-plant',
          ],
          [
            'room1-light',
            'room1-secondary_light',
            // 'room1-rgb',
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
          // [
          //   'corridor-buzzer',
          //   'corridor-door',
          // ],
          // [
          //   'corridor-light',
          // ],
        ],
      },
      {
        id: 'room2',
        name: 'Room 2',
        items: [
          [
            'room2-air_temperature',
            'room2-air_humidity',
          ],
        ],
      },
      {
        id: 'kitchen',
        name: 'Kitchen',
        items: [
          [
            'kitchen-air_temperature',
            'kitchen-air_humidity',
          ],
        ],
      },
    ],
  },
];