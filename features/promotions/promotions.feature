@regression @promotions
Feature: Promotional Offers & Discounts

  Scenario Outline: Apply an eligible promotional offer
    Given the shopper has products in the basket
    And the shopper has continued to checkout
    When the shopper applies promo code "<promoCode>"
    Then the promotional discount should be calculated correctly
    And the final payable total should be recalculated correctly

    Examples:
      | promoCode |
      | SAVE10    |
      | WELCOME5  |

  @known-defect @BUG-008
  Scenario: Prevent the same promotional offer from being applied multiple times
    Given the shopper has products in the basket
    And the shopper has continued to checkout
    And the shopper has already applied the WELCOME5 promotional code
    When the shopper attempts to apply WELCOME5 again
    Then the promotional offer should not be applied again
    And the discount should remain unchanged

  @known-defect @BUG-014
  Scenario: Prevent combining multiple different promotional offers
    Given the shopper has products in the basket
    And the shopper has continued to checkout
    And the shopper has already applied the WELCOME5 promotional code
    When the shopper applies promo code "SAVE10"
    Then the second promotional offer should be rejected
