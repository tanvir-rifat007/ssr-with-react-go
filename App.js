const { createElement: h, useState } = React;

function App() {
    const [count, setCount] = useState(0);
    return h("div", null,
        h("h1", null, "This is ssr"),
        h("p", null, "This ssr is built with react+go"),
        h("button", { onClick: () => setCount(count + 1) }, `click me: ${count} times`)
    );
}

globalThis.App = App;
