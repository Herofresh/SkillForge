// Drizzle migrations import `.sql` files as strings (ADR-026); the same config runs in Jest.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
