module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    requireModule: ['ts-node/register', 'dotenv/config'],
    require: ['src/**/*.ts'],
    tags: 'not @ignore',
    format: [
      'progress-bar',
      'summary',
      'json:reports/cucumber_report.json',
      'html:reports/cucumber_report.html'
    ],
    formatOptions: { snippetInterface: 'async-await' },
    timeout: 30000
  }
};
