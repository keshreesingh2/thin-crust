
Feature: Citi Investing Plan

Scenario: Create a retirement plan
  When User goes to URL "https://citi.com"
  And User "clicks" on a "link" that contains text "Investing"
  And User "clicks" on a "link" that contains text "Investing with Citi"
  And User "clicks" on a "link" that contains text "Your Financial Goals"
  And User "clicks" on a "link" that contains text "Planning Your Retirement"
  And User "clicks" on a "link" that contains text "Start Planning"
