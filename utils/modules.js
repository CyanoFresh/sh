module.exports = (core) => {
  function getModulesItems(moduleId) {
    let items = [];

    core.config.dashboard.forEach(room => room.items.forEach(itemGroup => {
      items = [
        ...items,
        ...itemGroup.filter(item => item.module === moduleId),
      ];
    }));

    return items;
  }

  core.config.modules.forEach(config => {
    const items = getModulesItems(config.id);

    // Load module
    try {
      if (config.local) {
        core.modules[config.id] = require(`../modules/${config.id}`)(config, items, core);
      } else {
        core.modules[config.id] = require(config.id)(config, items, core);
      }

      console.log(`Module ${config.id} loaded`);
    } catch (e) {
      console.log(`Module ${config.id} not loaded`, e);
    }
  });
};