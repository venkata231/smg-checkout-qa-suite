@regression @basket
Feature: Basket Management & Calculation Logic

  Scenario: Update basket quantity and verify totals
    Given an available product is added to the basket
    When the shopper increases the product quantity
    Then the basket quantity should update correctly
    And the product line total should be recalculated correctly
    And the basket subtotal should be recalculated correctly

    When the shopper decreases the product quantity
    Then the basket quantity should update correctly
    And the product line total should be recalculated correctly
    And the basket subtotal should be recalculated correctly
