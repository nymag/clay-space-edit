# Clay Space Edit
#### The edit experience when using a [Space](https://github.com/nymag/clay-space-edit/wiki/Introduction) in your page.

The concept of a Space in Clay is very useful, but the standard edit experience provided by [Kiln](https://github.com/nymag/clay-kiln) makes working with the content of a Space very cumbersome. A Space can have any number of Logics in it. The `clay-space-edit` makes editing components in the Space easier, from 0 - 100 components. That's where this component comes in. Clay Space Edit taps into the [plugin system](https://github.com/nymag/clay-kiln/blob/master/README.md#plugins) provided by Kiln to create a custom experience for working with a Space, but requires a precise API for you to use in your own projects.

The **Clay Space Edit** plugin is a component itself which runs client-side Javascript only when you are in edit mode. It taps into [Kiln's APIs](https://github.com/clay/clay-kiln/wiki/Kiln-APIs) to respond to changes in selections and add additional panes.

## What is a Space?
Clay Spaces allow for conditional rendering. The core of conditional rendering is a Space that you create. **A Space consists of two things**: a _Component List_ & a _Filter_. Creating this Space allows us to group conditional content so that we can control the editing experience of components that might conditionally occupy an area of your page, but it also allows us to be very specific in how we run our tests. You can have an unlimited number of Space components on your site, each with their own unique filter, the only requirement is that the name of each Space component begins with `clay-space`. Examples of Space names might be:
- `clay-space-first-wins`
- `clay-space-check-for-awesome`
- `clay-space-literally-anything`

The last trick to a Space is that you _only want to apply your Filter when **not** in edit mode_. When you're not in edit mode this plugin will control the visibility of all the components in the Space, but first, we need to render all the components to the DOM. Finally, here's an example of a very basic Space's template written in Nunjucks:
```javascript
<div data-uri="{{ _ref or _self }}" class="clay-space">
  {% if locals.edit %}
    {{ embed(state.getTemplate('clay-component-list'), content, state) | safe }}
  {% else %}
    {{ embed(state.getTemplate('clay-component-list'), content | myFilter, state) | safe }}
  {% endif %}
</div>
```
You can see that we're embedding a Component List in the Space and passing in the `content` Array. When not in edit mode the `content` array is being passed through a filter which is testing for some property, but in edit mode, all the components are getting rendered to the page.

When we talk about conditionally displaying a Component, it's easy to see how a filter (aka a `space-logic`) could work on a Component List and test for a certain set of properties or values, but there's one more layer. Because we don't want to have to put display logic every Component that is ever built, we need to somehow abstract the data about when a Component should be displayed into another area. For this, we "wrap" our Components in a Logic. Simply put, a Logic component only contains data about _WHEN_ a Component embedded inside of it should be displayed. Here's a sample Logic component:

```javascript
{
  "startTime": "",
  "endTime": "",
  "embeddedComponent": {
    "ref": "/components/related-posts/instances/new",
    "data": {
      "_ref": "/components/related-posts/instances/new"
    }
  }
}
```
Here we have a Logic component that contains three properties: `startTime`, `endTime` and `embeddedComponent`. Let's break these down into a little more detail:
- `startTime` & `endTime`: These are two properties exposed to a user in the component's settings which allow a user to set a time frame for the component to display itself. At render time the Logic tests the current date against the timeframe the user has defined and decides if it should display itself. If we are between the two times then the Component it wraps will be displayed.
- `embeddedComponent`: This is an object which contains a reference to some instance of a component. This can be _ANY_ component on your site. The important part of this is that the Logic is **not aware** of what component it wraps, the reference is added to the Logic but it doesn't matter what the reference is.

By creating this separation between the display logic around a Component and grouping all the components into one Component List inside a Space, we're able to create an easy editing flow around how you manage your conditional logic while still being able to edit the base Components easily.


## Implementing A Logic
1. Determine the type of logic(s) you need. Is it based on categories? Author(s)? Time?
2. Write the `schema.yml` file for your Logic component. Add all the properties you will need to determine if something passes.
3. Make your filter. Does only 1 Logic win in a Space? Or do multiple? A Filter will determine this!
4. Write the logic checker in your Logic's `server.js` file.

If all things are done properly then you should have a properly working Space! There are more details regarding the API for the editing experience, but following those steps will get you as far as proper rendering when a user visits your page.
