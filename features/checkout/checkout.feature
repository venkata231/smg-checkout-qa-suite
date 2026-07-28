@regression @checkout
Feature: End-to-End Checkout & Order Placement

  @known-defect @BUG-002
  Scenario: Complete a successful purchase
    Given an available product is added to the basket
    And the shopper has continued to checkout
    And valid delivery details have been provided
    And valid payment details have been provided
    And the shopper has selected a delivery option
    And the shopper has accepted the checkout terms
    When the shopper places the order
    Then the order should be confirmed
    And an order reference should be generated
    And the final payable total should be correct
    And the completed order should appear in order history
    And the active basket should be cleared

  Scenario: Update available stock after a successful purchase
    Given a product with available stock is selected
    And the current available stock quantity is recorded
    And the product is added to the basket
    When the shopper successfully completes the purchase
    And returns to the product catalogue
    Then the available stock should be reduced by the purchased quantity

  Scenario: Verify a completed purchase in order history
    Given the shopper has successfully completed an order
    When the shopper opens order history
    Then the completed order should be displayed
    And the order reference should match the confirmation
    And the order total should match the confirmed purchase
    And the delivery method should match the checkout selection

  @known-defect @BUG-010
  Scenario: Prevent duplicate orders from repeated order submission
    Given the shopper has completed all required checkout information
    And valid payment details have been provided
    And the shopper has accepted the checkout terms
    When the shopper submits the order multiple times in quick succession
    Then only one confirmed order should be created
