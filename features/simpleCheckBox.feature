@SimpleCheckbox
Feature: Selenium Easy Checkbox
	Background: Navigate to checkbox demo
		When User goes to URL "http://www.seleniumeasy.com/test"
		And User "clicks" on a "link" that contains text "Input Forms"
		And User "clicks" on a "link" that contains text "Checkbox Demo"

	Scenario: Single checkbox
		And User "enters" following form fields
			| locateBy | cssSelector    | partialText | inputType |
			| css      | #isAgeSelected |             | checkbox  |
		And User should see following elements displayed on page
			| locateBy | cssSelector | partialText                    |
			| css      | #txtAge     | Success - Check box is checked |

	Scenario: Multiple checkbox
		And User "clicks" on a "button" that contains text "Check All"
		And User should see following elements displayed on page
			| locateBy | cssSelector                |
			| css      | input[value="Uncheck All"] |
