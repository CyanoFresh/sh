/**
 * @param {Core} core
 * @constructor
 */
function Modules(core) {
  function getModulesItems(moduleId) {
    return core.config.items.filter(item => item.module === moduleId);
  }

  const modules = {};

  core.config.modules.forEach(config => {
    const items = getModulesItems(config.id);

    // Load module
    try {
      if (config.local) {
        modules[config.id] = require(`../modules/${config.id}`)(config, items, core);
      } else {
        modules[config.id] = require(config.id)(config, items, core);
      }

      console.log(`Module ${config.id} loaded`);
    } catch (e) {
      console.log(`Module ${config.id} not loaded: `, e);
    }
  });

  return modules;
}

module.exports = Modules;