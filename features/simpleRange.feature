@SimpleRange
Feature: Selenium Easy Range
	Background: Navigate to Range demo
		When User goes to URL "http://www.seleniumeasy.com/test/drag-drop-range-sliders-demo.html"

	Scenario: Single Range
		And User "enters" following form fields
			| locateBy | cssSelector    | partialText | inputType | value   |
			| css      | #slider1 input |             | range     | right-10 |
