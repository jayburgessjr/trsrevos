.PHONY: bootstrap lint test build e2e

bootstrap:
	pnpm install

lint:
	npx eslint .

test:
	npx vitest run

e2e:
	npx playwright test

build:
	npm run build
