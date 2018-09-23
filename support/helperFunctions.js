const { until, By } = require('selenium-webdriver');
let KK = {
	finders: {
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
					elementText =
						element.textContent || element.innerText || '';
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
				var elementText =
					element.textContent || element.innerText || '';
				var elementMatches /* partialText instanceof RegExp ?
				partialText.test(elementText) : */ = partialText
						? elementText.indexOf(partialText) > -1
						: true;

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
				var elementText =
					labelEl.textContent || labelEl.innerText || '';
				if (elementText.indexOf(partialText) > -1) {
					var inputEl = using.querySelector('#' + labelEl.htmlFor);
					matches.push(inputEl);
					break;
				}
			}
			return matches;
		}
	}
};
const timeouts = {
	TASK_TIMEOUT: 20 * 1000,
	STEP_TIMEOUT: 2 * 30 * 1000
};
const locators = {
	LINK: 'link',
	BUTTON: 'button',
	INPUT_BY_LABEL: 'inputByLabel',
	CSS: 'css'
};
const errors = {
	NOT_FOUND: `\ncould not find an element on page with: `,
	NOT_DISPLAYED: `should be displayed, but it is not`,
	NOT_CLICKABLE: `\nshould be clickable, but it is not`,
	NOT_CLICKED: `\nshould receive click, but it can not`,
	NOT_ENTERED: `\nshould recieve input, but did not`
};
const inputTypes = {
	DROPDOWN: 'dropdown',
	RADIO: 'radio',
	CHECKBOX: 'checkbox'
};
let helperObj = {
	buildDriver: function () {
		const webdriver = require('selenium-webdriver');
		const chrome = require('selenium-webdriver/chrome');
		const firefox = require('selenium-webdriver/firefox');
		KK.driver = new webdriver.Builder()
			.forBrowser('chrome')
			.usingServer('http://localhost:4444/wd/hub')
			.build();
		KK.driver.sleep(500);
		return KK.driver
			.manage()
			.window()
			.maximize();
	},
	getPageElement: async function (row, using) {
		//TODO: add logic validate row config data
		if (row.locateBy == locators.CSS) {
			return await KK.driver.wait(
				until.elementLocated(
					By.js(
						KK.finders.findByCssContainingText,
						row.cssSelector,
						row.partialText,
						using
					)
				),
				timeouts.TASK_TIMEOUT,
				`${errors.NOT_FOUND} ${row.locateBy}, ${row.cssSelector} and ${
				row.partialText
				}`
			);
		} else if (row.locateBy == locators.BUTTON) {
			return await KK.driver.wait(
				until.elementLocated(
					By.js(KK.finders.findByPartialButtonText, row.partialText)
				),
				timeouts.TASK_TIMEOUT,
				`${errors.NOT_FOUND} ${row.locateBy} and ${row.partialText}`
			);
		} else if (row.locateBy == locators.LINK) {
			return await KK.driver.wait(
				until.elementLocated(By.partialLinkText(row.partialText)),
				timeouts.TASK_TIMEOUT,
				`${errors.NOT_FOUND} ${row.locateBy} and ${row.partialText}`
			);
		} else if (row.locateBy == locators.INPUT_BY_LABEL) {
			return await KK.driver.wait(
				until.elementLocated(
					By.js(KK.finders.findByInputLabel, row.partialText)
				),
				timeouts.TASK_TIMEOUT,
				`${errors.NOT_FOUND} ${row.locateBy} and ${row.partialText}`
			);
		}
	},
	waitUntilDisplayed: async function (row, using) {
		let locatedEl = await helperObj.getPageElement(row, using);
		await KK.driver.wait(
			until.elementIsVisible(locatedEl),
			timeouts.TASK_TIMEOUT,
			`element with: ${row.locateBy} and ${row.partialText} ${errors.NOT_DISPLAYED}`
		);
		return locatedEl;
	},
	/* function waitUntilNotDisplayed() {} */
	waitUntilClickable: async function (row, using) {
		let el = await helperObj.waitUntilDisplayed(row, using);
		await KK.driver.wait(
			until.elementIsEnabled(el),
			timeouts.TASK_TIMEOUT,
			errors.NOT_CLICKABLE
		);
		return el;
	},
	clickUntilClicked: async function (row, using) {
		try {
			//await KK.driver.sleep(2000);
			let el = await helperObj.waitUntilClickable(row, using);
			await KK.driver.sleep(500);
			await el.click();
			return el;
		} catch (e) {
			//TODO: add logic to check other element would recieve click Error and retry until timeout
			throw e;
		}
	},
	enterFormInput: async function (inputEl, inputRow) {
		let el;
		if (inputRow.inputType == inputTypes.DROPDOWN) {
			el = await helperObj.clickUntilClicked(inputRow);
			await helperObj.clickUntilClicked(
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
			el = await helperObj.clickUntilClicked(inputRow);
		} else {
			el = await inputEl.sendKeys(inputRow.value);
		}
		return el;
	},
	takeScreenshot: async function (scenario) {
		const { Status } = require('cucumber');
		let world = this,
			screenShot;
		if (scenario.result.status === Status.FAILED) {
			screenShot = await KK.driver.takeScreenshot();
			world.attach(screenShot, 'image/png');
		}
		return screenShot;
	},
	evaluateExpression: function (world, expression) {
		if (!expression) {
			return '';
		} else if (expression.startsWith('${') && expression.endsWith('}')) {
			let myWorld = world;
			let trimmedExpression = expression.substring(2, expression.length - 1)
			var deep_value = function (o, s) {
				s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
				s = s.replace(/^\./, '');           // strip a leading dot
				var a = s.split('.');
				for (var i = 0, n = a.length; i < n; ++i) {
					var k = a[i];
					if (k in o) {
						o = o[k];
					} else {
						return;
					}
				}
				return o;
			};
			return deep_value(myWorld, trimmedExpression);
		} else {
			return expression;
		}
	},
	afterTick: function () { }
};

exports.buildDriver = helperObj.buildDriver;
exports.clickUntilClicked = helperObj.clickUntilClicked;
exports.waitUntilDisplayed = helperObj.waitUntilDisplayed;
exports.enterFormInput = helperObj.enterFormInput;
exports.takeScreenshot = helperObj.takeScreenshot;
exports.evaluateExpression = helperObj.evaluateExpression;
exports.KK = KK;
exports.timeouts = timeouts;
exports.locators = locators;
