const { Builder, By, Key, until, promise } = require('selenium-webdriver');
const { buildDriver, KK, clickUntilClicked, waitUntilDisplayed, enterFormInput, evaluateExpression, timeouts, locators, takeScreenshot } = require('./helperFunctions');

promise.USE_PROMISE_MANAGER = false;
const {
	setWorldConstructor,
	setDefaultTimeout,
	BeforeAll,
	defineStep,
	AfterAll,
	After,
	Status
} = require('cucumber');

setDefaultTimeout(timeouts.STEP_TIMEOUT);
After(takeScreenshot);

BeforeAll(buildDriver);
defineStep(/^User goes to URL "(.*)"$/, async url => {
	try {
		await KK.driver.get(url);
	} catch (e) {
		console.log(`\nerror: \n${e}\n`);
	}
});
defineStep(
	/^User "(clicks)" on a "(button|link)" that contains text "(.*)"$/,
	async function (action, locateBy, partialText) {
		let world = this;
		await clickUntilClicked({
			locateBy:
				locators.BUTTON == locateBy ? locators.BUTTON : locators.LINK,
			partialText: evaluateExpression(world, partialText)
		});
	}
);
defineStep(
	/^User "(clicks)" on an element that has css "(.*)" and contains text "(.*)"$/,
	async function (action, cssSelector, partialText) {
		let world = this;
		await clickUntilClicked({
			locateBy: locators.CSS,
			cssSelector,
			partialText: evaluateExpression(world, partialText)
		});
	}
);
defineStep(/^User "(enters)" following form fields$/, async function (action, inputTable) {
	let inputRows = inputTable.hashes();
	let inputEl, world = this;
	for (let inputRow of inputRows) {
		inputRow.partialText = evaluateExpression(world, inputRow.partialText)
		inputRow.value = evaluateExpression(world, inputRow.value)

		inputEl = await waitUntilDisplayed(inputRow);
		await enterFormInput(inputEl, inputRow);
	}
	return inputEl;
});
defineStep(
	/^User should see following elements displayed on page$/,
	async function(elementsTable) {
		let world = this;
		let elDataRows = elementsTable.hashes();
		for (let elData of elDataRows) {
			elData.partialText = evaluateExpression(world, elData.partialText)
			elData.value = evaluateExpression(world, elData.value)

			await waitUntilDisplayed(elData);
		}
	}
);
defineStep(/^Read test data from "(.*)" into object "(.*)"$/, function (relativePath, objectName) {
	var obj = require(process.cwd() + relativePath);
	this[objectName] = obj;
});
AfterAll(() => { KK.driver.quit(); })
/* defineStep(
	/^User should NOT see following elements displayed on page$/,
	async elementsTable => {}
);
defineStep(
	/^User should see new tab or window opened with URL"(.*)"$/,
	async elementsTable => {}
); */

// defineStep(/^User waits for "(.*)" ms DEBUG ONLY$/, async ms => {
// 	await KK.driver.sleep(ms);
// });

//TODO: for all catch error and quit driver
