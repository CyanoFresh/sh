const config = require('../config');

const filterItems = filterFunc => {
  let result = [];

  config.dashboard.forEach(room => room.items.forEach(itemGroup => {
    result = [
      ...result,
      ...itemGroup.filter(filterFunc),
    ];
  }));

  return result;
};

const getDeviceItems = deviceId => filterItems(item => item.device === deviceId);
const getModuleItems = moduleId => filterItems(item => item.module === moduleId);

module.exports = {
  filterItems,
  getDeviceItems,
  getModuleItems,
};