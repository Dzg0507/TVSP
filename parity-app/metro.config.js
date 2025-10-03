const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force localhost for all URLs
config.server = {
  ...config.server,
  port: 8081
};

module.exports = config;
