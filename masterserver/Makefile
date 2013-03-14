REPORTER = dot

test:
	sh ./node_modules/.bin/mocha --reporter $(REPORTER)

test-jenkins:
	./node_modules/.bin/mocha -R tap

.PHONY: test test-jenkins
