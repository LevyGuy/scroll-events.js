# Scroll-Events.js

Enable some events callback for any element with scroll.

See the index.html file for example.

### Example
```
ScrollElement(".scroll-container").listen({
    onTopThumbClick: function () {
        console.log("%cThumb Click Top", "color: green;");
    },
    onBottomThumbClick: function () {
        console.log("%cThumb Click Bottom", "color: purple;");
    },
    onTrack: function () {
        console.log("on Track");
    },
    onMouseWheel: function () {
        console.log("%con Mouse Wheel", "color: blue;");
    }
});
```

see [jsfiddle](https://jsfiddle.net/GM09D/k36gvjfa/)

License
----

MIT
