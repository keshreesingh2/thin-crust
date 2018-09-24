Browser Automation made easy. Most simple way to automate any website reliably.
___
### Key features
1. Only few BDD style, easy-to-understand, easy-to-remember steps written from the perspective of end user and how they would interact with the the website and enough to cover most required use cases. 
2. Framework agnostic( doesn't depend on any framework code ).
3. doesn't require writing step implementation or any other Javascript Code.
4. doesn't require writing locators, Page Objects, browser.sleep().
___
### Step Examples
```gherkin
## Action steps
When User "clicks" on a "link" that contains text "Input Forms"
When User "clicks" on a "button" that contains text "Show Message"
When User "clicks" on an element that has css "div.expand" and contains text "expand"
## Form entry steps
And User "enters" following form fields
  | locateBy       | cssSelector   | partialText | inputType | value       |
  | css            | #user-message |             |           | <InputMsg>  |
  | inputByLabel   |               | First Name  |           | <firstName> |
  | inputByLabel   |               | Country     | dropdown  | USA         |
## Verification steps
And User should see following elements displayed on page
	| locateBy | cssSelector       | partialText |
	| css      | span#displayvalue | <Total>     |
```
___
### Execution
``` 
yarn wd:update   (once) 

yarn wd:start 
yarn test-cukes
yarn gen-report
```
___
### Dependencies
1. cucumber-js
2. selenium( needs java 8+ )
3. webdriver-manager
