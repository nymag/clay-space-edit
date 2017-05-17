# Clay Space Edit
#### The edit experience when using a [Space](https://github.com/nymag/clay-space-edit/wiki/Introduction) in your page.

The concept of a Space in Clay is very useful, but the standard edit experience provided by [Kiln](https://github.com/nymag/clay-kiln) makes working with the content of a Space very cumbersome. That's where this component comes in. Clay Space Edit taps into the [plugin system](https://github.com/nymag/clay-kiln/blob/master/README.md#plugins) provided by Kiln to create a custom experience for working with a Space, but requires a precise API for you to use in your own projects.

## Getting Started

All the information you need for setting up a Space can be found in [the wiki of this repository](https://github.com/nymag/clay-space-edit/wiki). If you're unfamiliar with everything that goes into making your own Space, you might want to step through the [Introduction](https://github.com/nymag/clay-space-edit/wiki/Introduction). If you're already familiar with the core concepts then skip straight to the [API Reference](https://github.com/nymag/clay-space-edit/wiki/API-Reference).

## Developing Clay-Space-Edit

- Get coding, first time: `nvm use && yarn install && npm run watch`
- Next time: `nvm use && npm run watch`
- Use [npm link](https://docs.npmjs.com/cli/link) to run your Clay implementation against your dev build of Clay-Space-Edit.
- To test and lint, do `npm test`
