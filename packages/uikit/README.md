# White label UI Kit

- [Result](#result)
- [Structure](#structure)
- [Installation](#installation)
- [Library](#library)
- [Storybook](#storybook)
- [How to use?](#howto)

## <a name="result"></a>Result

- https://location-tips-ui.web.app/

## <a name="structure"></a>Structure

### @repo/uikit

Main folder splitted to:

- `atoms` contains the basic components such as `MButton` `MIcon` `MInput`, etc. Each component has common style and two implementations for react and angular
- `molecules` big components, composition from atoms
- `organisms` something like page or form
- `styles` this folder contains basic styles extracted from figma using `@repo/uikit-figma` service
- `icons` icons catalog from figma
- `fonts` fonts for brands
- `types` typescript types
- `utils` any useful functions 

## <a name="installation"></a>Installation

```
npm install
```

## <a name="library"></a>Library

### Build

- React library
```
nx run build
```

### Tests

- Start all tests
```
npm run test
```

### Deploy

- Update `src/package.json` version to the release number you are planning to deploy

- After merging to main you need to create new release in github. Github action triggers by realease creation

- We are using github npm packages repository `npm.pkg.github.com`


## <a name="storybook"></a>Storybook

### Run

- Run storybook for react
```
nx run storybook
```

### Build

- Run storybook for react
```
nx run build:storybook
```

### Deploy

- Just merge to `main` branch and storybook will be deployed 

## <a name="result"></a>How to use library

### Edit `.npmrc`

- we are using github npm registry, thats to install our library you need to configure `.npmrc`
create github token with access to project packages (access to read) `https://github.com/settings/tokens`
find `.npmrc` in your home folder `vi ~/.npmrc`
add the following strings to it
```
@location-tips:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<GITHUB_TOKEN>
```

### Installation

```
npm insatall @location-tips/location-tips-@repo/uikit
```

### Using in the code

- Import main css file that is includes the all css variables

```
import "@location-tips/location-tips-@repo/uikit/styles/index.css";
```

- Import components from @repo/uikit separatly, your bundler will be happy
```
...
import { MButton } from "@location-tips/location-tips-@repo/uikit/atoms/MButton"; 
import { MInput } from "@location-tips/location-tips-@repo/uikit/atoms/MInput"; 
...
```
