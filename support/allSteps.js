const { Builder, By, Key, until, promise } = require('selenium-webdriver');

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
const KK = {};
const timeouts = {
	TASK_TIMEOUT: 10 * 1000,
	STEP_TIMEOUT: 1 * 30 * 1000
};
const locators = {
	LINK: 'link',
	BUTTON: 'button',
	INPUT_BY_LABEL: 'input_by_label',
	CSS: 'css'
};
const errors = {
	NOT_FOUND: `not found on page\n`,
	NOT_DISPLAYED: `should be displayed, but it is not\n`,
	NOT_CLICKABLE: `should be clickable, but it is not\n`,
	NOT_CLICKED: `should receive click, but it can not\n`,
	NOT_ENTERED: `should recieve input, but did not\n`
};
const inputTypes = {
	DROPDOWN: 'dropdown',
	RADIO: 'radio',
	CHECKBOX: 'checkbox'
};
setDefaultTimeout(timeouts.STEP_TIMEOUT);
After(async function (scenario) {
	let world = this,
		screenShot;
	if (scenario.result.status === Status.FAILED) {
		screenShot = await KK.driver.takeScreenshot();
		world.attach(screenShot, 'image/png');
	}
	return screenShot;
});
KK.finders = {
	findByPartialButtonText: (partialText, using) => {
		using = using || document;
		var elements = using.querySelectorAll(
			'button, input[type="button"], input[type="submit"]'
		);
		var matches = [];
		for (var i = 0; i < elements.length; ++i) {
			var element = elements[i];
			var elementText;
			if (element.tagName.toLowerCase() == 'button') {
				elementText = element.textContent || element.innerText || '';
			} else {
				elementText = element.value;
			}
			if (elementText.indexOf(partialText) > -1) {
				matches.push(element);
			}
		}
		return matches;
	},
	findByCssContainingText: (cssSelector, partialText, using) => {
		using = using || document;
		/* if (partialText.indexOf('__REGEXP__') === 0) {
			var match = partialText.split('__REGEXP__')[1].match(/\/(.*)\/(.*)?/)
			partialText = new RegExp(match[1], match[2] || '')
		} */
		var elements = using.querySelectorAll(cssSelector);
		var matches = [];
		for (var i = 0; i < elements.length; ++i) {
			var element = elements[i];
			var elementText = element.textContent || element.innerText || '';
			var elementMatches /* partialText instanceof RegExp ?
				partialText.test(elementText) : */ =
				elementText.indexOf(partialText) > -1;

			if (elementMatches) {
				matches.push(element);
			}
		}
		return matches;
	},
	findByInputLabel: (partialText, using) => {
		//TODO: cases where 'span' is used instead of 'label' tag
		using = using || document;
		var labelEls = using.querySelectorAll('label');
		var matches = [];
		for (var i = 0; i < labelEls.length; ++i) {
			var labelEl = labelEls[i];
			var elementText = labelEl.textContent || labelEl.innerText || '';
			if (elementText.indexOf(partialText) > -1) {
				var inputEl = using.querySelector('#' + labelEl.htmlFor);
				matches.push(inputEl);
				break;
			}
		}
		return matches;
	}
};
async function getPageElement(row, using) {
	//TODO: add logic validate row config data
	let el;
	if (row.locateBy == locators.CSS) {
		await KK.driver.wait(
			until.elementLocated(
				By.js(
					KK.finders.findByCssContainingText,
					row.cssSelector,
					row.partialText,
					using
				)
			),
			timeouts.TASK_TIMEOUT,
			errors.NOT_FOUND
		);
		el = await KK.driver.findElement(
			By.js(
				KK.finders.findByCssContainingText,
				row.cssSelector,
				row.partialText,
				using
			)
		);
	} else if (row.locateBy == locators.BUTTON) {
		await KK.driver.wait(
			until.elementLocated(
				By.js(KK.finders.findByPartialButtonText, row.partialText)
			),
			timeouts.TASK_TIMEOUT,
			errors.NOT_FOUND
		);
		el = await KK.driver.findElement(
			By.js(KK.finders.findByPartialButtonText, row.partialText)
		);
	} else if (row.locateBy == locators.LINK) {
		await KK.driver.wait(
			until.elementLocated(By.partialLinkText(row.partialText)),
			timeouts.TASK_TIMEOUT,
			errors.NOT_FOUND
		);
		el = await KK.driver.findElement(By.partialLinkText(row.partialText));
	} else if (row.locateBy == locators.INPUT_BY_LABEL) {
		await KK.driver.wait(
			until.elementLocated(
				By.js(KK.finders.findByInputLabel, row.partialText)
			),
			timeouts.TASK_TIMEOUT,
			errors.NOT_FOUND
		);
		el = await KK.driver.findElement(
			By.js(KK.finders.findByInputLabel, row.partialText)
		);
	}
	return el;
}
async function waitUntilDisplayed(row, using) {
	let el = await getPageElement(row, using);
	await KK.driver.wait(
		until.elementIsVisible(el),
		timeouts.TASK_TIMEOUT,
		errors.NOT_DISPLAYED
	);
	return el;
}
/* function waitUntilNotDisplayed() {} */
async function waitUntilClickable(row, using) {
	let el = await waitUntilDisplayed(row, using);
	await KK.driver.wait(
		until.elementIsEnabled(el),
		timeouts.TASK_TIMEOUT,
		errors.NOT_CLICKABLE
	);
	return el;
}
async function clickUntilClicked(row, using) {
	try {
		let el = await waitUntilClickable(row, using);
		await el.click();
		return el;
	} catch (e) {
		//TODO: add logic to check other element would recieve click Error and retry until timeout
		throw e;
	}
}
async function enterFormInput(inputEl, inputRow) {
	let el;
	if (inputRow.inputType == inputTypes.DROPDOWN) {
		el = await clickUntilClicked(inputRow);
		await clickUntilClicked(
			{
				locateBy: locators.CSS,
				cssSelector: 'option',
				partialText: inputRow.value
			},
			inputEl
		);
	} else if (
		inputRow.inputType == inputTypes.CHECKBOX ||
		inputRow.inputType == inputTypes.RADIO
	) {
		el = await clickUntilClicked(inputRow);
	} else {
		el = await inputEl.sendKeys(inputRow.value);
	}
	return el;
}
function afterTick() { }

BeforeAll(() => {
	const webdriver = require('selenium-webdriver');
	const chrome = require('selenium-webdriver/chrome');
	const firefox = require('selenium-webdriver/firefox');
	KK.driver = new webdriver.Builder()
		.forBrowser('chrome')
		.usingServer('http://localhost:4444/wd/hub')
		.build();
});
defineStep(/^User goes to URL "(.*)"$/, async url => {
	try {
		await KK.driver.get(url);
	} catch (e) {
		console.log(`\nerror: \n${e}\n`);
	}
});
defineStep(
	/^User "(clicks)" on a "(button|link)" that contains text "(.*)"$/,
	async (action, locateBy, partialText) => {
		await clickUntilClicked({
			locateBy:
				locators.BUTTON == locateBy ? locators.BUTTON : locators.LINK,
			partialText
		});
	}
);
defineStep(
	/^User "(clicks)" on an element that has css "(.*)" and contains text "(.*)"$/,
	async (action, cssSelector, partialText) => {
		await clickUntilClicked({
			locateBy: locators.CSS,
			cssSelector,
			partialText
		});
	}
);
defineStep(/^User "(enters)" following form fields$/, async function (action, inputTable) {
	let inputRows = inputTable.hashes();
	let inputEl
	for (let inputRow of inputRows) {
		inputEl = await waitUntilDisplayed(inputRow);
		await enterFormInput(inputEl, inputRow);
	}
	return inputEl;
});
defineStep(
	/^User should see following elements displayed on page$/,
	async elementsTable => {
		let elDataRows = elementsTable.hashes();
		elDataRows.forEach(elData => {
			/* await  */ waitUntilDisplayed(elData);
		});
	}
);
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
