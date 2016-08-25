# Clay Space Edit
#### The edit experience when using [Clay Space](https://github.com/nymag/clay-space) in your page.

The concept of a Space in Clay is very useful, but the standard edit experience provided by [Kiln](https://github.com/nymag/clay-kiln) makes working with the content of a Space very cumbersome. That's where this component comes in. Clay Space Edit taps into the [plugin system](https://github.com/nymag/clay-kiln/blob/master/README.md#plugins) provided by Kiln to create a custom experience for working with a Space, but requires a precise API for you to use in your own projects.

## Setup

- Install Clay Space (`npm install clay-space`)
- Install Clay Space Edit (`npm install clay-space-edit`)
- Add `clay-space` to the available components in a `_componentList` in whichever place you need it
- Add an instance of `clay-space-edit` to the layout where the Space will appear

Voila! You're now working with Spaces! :rocket: :star2: :space_invader:



## Creating A Space
Once you've got Spaces setup, you'll see an update to any component selectors in the `_componentList` that you put `clay-space` into. By clicking the image in the top right corner of the component selector you will create a new Space from that current component. Doing this will force a page refresh, but once your page has re-loaded you'll now be working inside of the Space and within the editing experience of Clay Space Edit.

![Create a space button](https://github.com/nymag/clay-space-edit/blob/master/media/createSpaceExample.png)

## A Refined Selector

Here's what you'll get when you have a Space:

![Selector UI](https://github.com/nymag/clay-space-edit/blob/master/media/spaceSelector.png)

- The remove button will remove a component from the Space
- Settings will open a dialog for the component's specific settings
- On the far right you'll get an icon to browse the Space. The button will display a number of components within that Space. Clicking on the button will launch a pane which will allow you to interact with the logic for which component to display based on what is available in your specific Space Logic implementation.

## The Browse Pane

![Space Pane](https://github.com/nymag/clay-space-edit/blob/master/media/pane.png)

The Space browse pane is where the :sparkles:magic:sparkles: happens. Here's what you can do n the pane:

- Reorder the component's priority in how they're displayed. The first component whose logic for displaying itself is true will be what 'wins' for the page
- Remove a component from a Space
- Add new components to a Space. Only components listed in the `_componentList` that `clay-space` is included in will be addable
- Open the settings dialog for the Space Logic component to toggle when it displays itself


## Some Things To Remember

- You need to publish for any changes to take affect
- There might be bugs in the experience! When in doubt, refresh the page
- Logic for how something decides if it displays is not controlled in this component, it's purely the edit experience. Issues with when a component displays should be handled in the Space Logic component
- Please create an issue for any bugs you find!


Thanks!
