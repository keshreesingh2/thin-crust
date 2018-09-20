var reporter = require('cucumber-html-reporter');

var options = {
    theme: 'bootstrap',
    jsonFile: 'results/result.json',
    output: 'results/cucumber_report.html',
    reportSuiteAsScenarios: true,
    launchReport: true/* ,
        metadata: {
            "App Version":"0.3.2",
            "Test Environment": "STAGING",
            "Browser": "Chrome  54.0.2840.98",
            "Platform": "Windows 10",
            "Parallel": "Scenarios",
            "Executed": "Remote"
        } */
};

reporter.generate(options, function done() {
    process.exit(0);
});