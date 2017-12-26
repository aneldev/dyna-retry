# About
 
Webpack configuration for ES5/ES6 for Typescript Library or Module.
 
Debug with devTools and test with Jest.
 
This boilerplate consist of minimum configuration and dependencies to create a Module written in Typescript.
 
**Have fun!**

# Install

```
git clone https://github.com/aneldev/dyna-ts-module-boilerplate.git my-ts-module
cd my-ts-module
npm run create
```
 
# Dependencies

None.

In development time, the `babel-polyfill` is used but it is not included in `dist`ribution script. The reason is that the Application that uses this model should load the polyfills. In order to avoid double load of polyfills in the final Application the polyfills are not included in `dist`.
 
# Develop
 
## General
 
The source code of your module is under the `src/` folder.

Under the `dev` folder you create a demo application that uses module.

Under the `tests` folder you create the tests for your module.

You can debug both `dev` and `tests` (the last one with some limitations) on browser and node enviroments. 
 
## Debug
 
Create an demo application under the `dev` folder that uses your module.

There are several options how to debug your application. You can debug it on nodeJs or in any web browser.
 
### Debug on any web browser with browser's debugger
 
Call `npm run debug-dev-browser` to start the builder and open a dev server (via webpack).
 
Open http://localhost:8027/ address in any browser.
 
_In this case there is no need to start additionally a builder as the other options, webpack takes care of it._
 
You can use any web browser to test it.
 
### Debug on nodeJs with devTools (via node --inspector)
 
Call `npm run debug-dev-build` to start the builder. This builder watches your changes made in debug/ & src/ folders.
 
Call `npm run debug-dev-devtools` to start and debug with the devTools debugger of your Chrome browser.
 
Alternatively, you can call `npm run debug-dev-devtools-brk` (with -brk at the end) to place a breakpoint on startup of the app to catch early points.
 
Open [chrome://inspect/#devices](chrome://inspect/#devices) to list the debuggable instances in your localhost, you should see your app there to debug it.
 
Alternatively, copy paste the link generated from `debug-dev-devtools`;
it is something like this: chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=127.0.0.1:9229/659747f3-20d7-45d9-8f8d-48c707d6f5eb
 
The debugger is the debugger of your Chrome's browser, you should have Chrome to use.
 
### Debug on nodeJs with node-debug
 
**Dependency**, you have to `npm install -g node-inspector`.
 
Call `npm run debug-dev-build` to start the builder. This builder watches your changes made in debug/ & src/ folders.
 
Call `npm run debug-dev-inspector` to start and node-debug your app.
 
You can close the devTools and this script will be called again to instantiate new devTools (changes in your code will be loaded at this point).
 
Alternatively, can call `npm run debug-dev-inspector-brk` (with -brk at the end) to place a breakpoint on startup of the app to catch early points.
 
The debugger will start automatically (as web page) in your default browser. The debugger works **only** in Chrome.
 
### Run debug code

Call `npm run debug-dev-build` to start the builder. This builder watches your changes made in debug/ & src/ folders.

Call `npm run run-debug-dev-build` and will run you debug application on node.js.

The built code, ready to run is under the `debug-ground/debug-dev-on-nodejs` path.  
 
# Test
 
## Write tests
 
For tests the [Jest](https://facebook.github.io/jest) is used, check the documentation.
 
Test files can be everywhere but they should have name `*.(test|spec).(ts|tsx|js|jsx)`. There is `tests/` folder if you want to use it but this is not a limitation.
 
## Run tests
 
Call `npm run test` to run your tests and coverage. This test also builds your application, ts errors can be shown here.

Call `npm run test-only` to run your tests only including coverage, no build no ts errors.
 
Call `npm run test-watch` to run your tests on any changes, no build, no ts errors, no coverage.
 
## Debug tests (experimental)
 
There is a small mock library where works like Jest but supports only some of the Jest functions. This is the `test/mock-jest.js` file where behave like Jest and can run on any browser and of course under node.js.
 
It doesn't support all the comparisons and features of the Jest but it helps to debug the test files. Feel free to fork it or suggest another way how to debug Jest test files.
 
The debug test commands are similar to the debug app commands. 

### Debug test in any browser

- Run `debug-tests-browser`
- The browser will be opened at `http://localhost:8023`

### Debug test with devtools

- Run `debug-tests-build` _where builds your test code_
- Run `debug-tests-devtools` or `debug-tests-devtools-brk`

### Debug test with node-inspector

- Run `debug-tests-build` _where builds your test code_
- Run `debug-tests-inspector` or `debug-tests-inspector-brk`
 
# Dist / Release
 
Call `npm run build`
to create a distributable version of your project
under the `dist/` folder.
 
The package configuration exports the `dist/` folder so you have to call the `npm run build` every time you want to publish this package. The typescript declarations are there out of the box.

Call `npm run release` to build, publish to npm and push to your repo.
  	
# Others

## Link your modules easily (using npm link)
 
Npm offers out of the box, link on development time of your project and of your own packages.
 
Instead of using in packages `"my-lovely-component": "file_./../../../myPackages/my-lovely-component"` try https://docs.npmjs.com/cli/link
 
**Tip 1:** During development, there is no need to call `build` on any code change, you can import the `src/` folder of this module like this: `import {MyModule} from 'my-module/src';` instead of `import {MyModule} from 'my-module';`.
 
**Tip 2:** You can link this module with your main application using the `npm link` for more read https://docs.npmjs.com/cli/link.
 
**Tip 2.1:** With npm > 5.0.0 the above link can be made defining the "file:xxx" instead of version number. 

## Link your modules easily (with node.js)

In case that npm link doesn't work correctly this boilerplate offer a ready sync mechanism for such as cases.

0. Copy `./syncExternalsList.sample.js` to `./syncExternalsList.js` once only. 
1. Update the `./syncExternalsList.js` list with external apps you want to keep sync.
2. Call `npm run sync-externals`

## Bundle node_modules

By default all node_modules are excluded from the builder. This means that are not in the bundle. 

For debugging reasons... you might want to include them.

In order to include them, edit the webpack.xxx.config.js and comment the `externals: [nodeExternals()]` line.

If you want to exclude specific modules _while are not so clean like `pg`, `helmet`, `express`_, exclude them like this: `externals: ['helmet', 'pg', 'express']`. 

# References

[Webpack configuration](https://webpack.github.io/docs/webpack-dev-server.html#webpack-dev-server-cli)
