import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/hooks';

// --------------------------------------------------
// PRODUCT SEARCH & CATALOGUE STEPS
// --------------------------------------------------

Given('products are available in the catalogue', async function (this: CustomWorld) {
  await this.cataloguePage.openCatalogue();
  const count = await this.cataloguePage.getProductCount();
  expect(count).to.be.above(0);
});

When('the shopper searches using {string}', async function (this: CustomWorld, searchValue: string) {
  this.testData.searchValue = searchValue;
  await this.cataloguePage.searchProduct(searchValue);
});

Then('the expected matching products should be displayed', async function (this: CustomWorld) {
  const query = this.testData.searchValue;
  const titles = await this.cataloguePage.getDisplayedProductTitles();
  expect(titles.length).to.be.above(0, `No products found for search term "${query}"`);
});
