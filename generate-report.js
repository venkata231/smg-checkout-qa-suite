const report = require('multiple-cucumber-html-reporter');

report.generate({
  jsonDir: './reports/',
  reportPath: './reports/html-report/',
  metadata: {
    browser: {
      name: 'chrome',
      version: '122'
    },
    device: 'Local Test Machine',
    platform: {
      name: 'macOS',
      version: 'ARM64'
    }
  },
  customData: {
    title: 'QA Technical Assessment Execution',
    data: [
      { label: 'Project', value: 'Shopper Checkout QA Lab' },
      { label: 'Target URL', value: 'https://qa-checkout-task.onrender.com/' },
      { label: 'Environment', value: 'Staging' },
      { label: 'Execution Mode', value: 'Automated Playwright + Cucumber BDD' }
    ]
  }
});
