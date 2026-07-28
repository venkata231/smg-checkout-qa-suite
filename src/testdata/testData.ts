// Centralized Test Data & Environment Constants

export const TEST_CONFIG = {
  baseUrl: process.env.BASE_URL || 'https://qa-checkout-task.onrender.com',
};

export const TEST_USER = {
  email: process.env.TEST_USERNAME || '',
  password: process.env.TEST_PASSWORD || '',
};

export const TEST_ADDRESS = {
  line1: '10 Automation Street',
  city: 'London',
  postcode: 'EC1A 1QA',
};

export const TEST_CARDS = {
  valid: '4242424242424242',
  declined: '4000000000000002',
};

export const TEST_PRODUCTS = {
  defaultProduct: 'NovaBook Pro 13',
};
