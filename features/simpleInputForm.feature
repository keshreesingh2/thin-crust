@SimpleInputForm
Feature: Selenium Easy Input Form
	Background: Navigate Simple Form Demo
		When User goes to URL "http://www.seleniumeasy.com/test/basic-first-form-demo.html"
		And Read test data from "/resources/simpleInputForm.json" into object "testData"
	# And User "clicks" on a "link" that contains text "Input Forms"
	# And User "clicks" on a "link" that contains text "Simple Form Demo"

	Scenario Outline: Simple form 1
		And User "enters" following form fields
			| locateBy | cssSelector   | partialText | inputType | value      |
			| css      | #user-message |             |           | <InputMsg> |
		And User "clicks" on a "button" that contains text "Show Message"
		And User should see following elements displayed on page
			| locateBy | cssSelector  | partialText |
			| css      | span#display | <InputMsg>  |
		Examples:
			| InputMsg                            |
			| ${testData.form1.scenario[0].input} |
			| ${testData.form1.scenario[1].input} |

	Scenario Outline: Simple form 2
		And User "enters" following form fields
			| locateBy | cssSelector | partialText | inputType | value    |
			| css      | #sum1       |             |           | <Input1> |
			| css      | #sum2       |             |           | <Input2> |
		And User "clicks" on a "button" that contains text "Get Total"
		And User should see following elements displayed on page
			| locateBy | cssSelector       | partialText |
			| css      | span#displayvalue | <Total>     |
		Examples:
			| Input1                               | Input2                               | Total                               |
			| ${testData.form2.scenario[0].input1}  | ${testData.form2.scenario[0].input2} | ${testData.form2.scenario[0].total} |
			| ${testData.form2.scenario[1].input1} | ${testData.form2.scenario[1].input2} | ${testData.form2.scenario[1].total} |
