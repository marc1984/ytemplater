var concat = require('concat-stream'),
	expect = require('chai').expect,
	stream = require('stream'),

	testUtil = require('./test-util'),

	precompiler = require('../lib/precompiler'),
	Engines = require('../lib/engines'),

	Template = require('yui/template').Template;

describe('precompiler.precompileToModule()', function() {
	var engineIds = Object.keys(Engines);

	it('should return a stream for precompiling template files into a single YUI module', function() {
		expect(precompiler.precompileToModule([], {})).to.be.an.instanceOf(stream);
	});

	engineIds.forEach(function(engineId) {

		it('should read the template files, precompile them and wrap them in a YUI module', function(done) {
			var engineInfo = Engines[engineId],
				testTemplateModuleData = {
					name: 'test-full-module',
					dependencies: ['test-dep-1', 'test-dep-2'],
					version: '7.8.9'
				},
				templateNames = ['food', 'name'],
				templatePaths = templateNames.map(function(templateName) {
					return testUtil.getTestTemplateFilePath(templateName, engineId);
				});

			precompiler
				.precompileToModule(templatePaths, testTemplateModuleData)
				.pipe(concat(function(yuiModuleContents) {
					expect(yuiModuleContents).to.equal(
						'YUI.add(\'' + testTemplateModuleData.name + '\', function(Y) {\n\n' +

						'var ' + engineId + 'Engine = new Y.Template(' + engineInfo.className + ');\n\n' +

						testUtil.getExpectedTemplateReviveCode(templateNames[0], engineId) +
						testUtil.getExpectedTemplateReviveCode(templateNames[1], engineId) +

						'}, \'' + testTemplateModuleData.version + '\', { requires: [' +
							'\'template-base\', ' +
							'\'' + engineInfo.moduleName + '\', ' +
							'\'' + testTemplateModuleData.dependencies[0] + '\', ' +
							'\'' + testTemplateModuleData.dependencies[1] + '\'' +
						'] });'
					);

					done();
				}));
		});
	});
});
