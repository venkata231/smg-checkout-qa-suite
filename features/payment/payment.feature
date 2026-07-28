@regression @payment @known-defect @BUG-009
Feature: Payment Method Validation

  Scenario Outline: Prevent order placement with invalid payment details
    Given the shopper has products ready for checkout
    And valid delivery details have been provided
    And the shopper enters "<cardNumber>" as the payment card number
    And the shopper accepts the checkout terms
    When the shopper attempts to place the order
    Then the order should not be created
    And an appropriate payment validation message should be displayed

    Examples:
      | cardNumber   |
      |              |
      | 1234         |
      | invalid-card |
