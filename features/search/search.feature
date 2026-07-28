@regression @search
Feature: Product Search & Catalogue Navigation

  Scenario Outline: Search for products using supported search criteria
    Given products are available in the catalogue
    When the shopper searches using "<searchValue>"
    Then the expected matching products should be displayed

    Examples:
      | searchValue  |
      | NovaBook     |
      | Nova         |
      | Auralite     |
      | Laptops      |

    @known-defect @BUG-006
    Examples:
      | searchValue  |
      | SKU-AUD-PODS |
