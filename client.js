import { hydrateRoot } from "react-dom/client";
import { createElement as h, useState } from "react";

function App() {
    const [count, setCount] = useState(0);
    return h("div", null,
        h("h1", null, "This is ssr"),
        h("p", null, "This ssr is built with react+go"),
        h("button", { onClick: () => setCount(count + 1) }, `click me: ${count} times`)
    );
}

// Hydrate the app
hydrateRoot(document.getElementById("root"), h(App));
