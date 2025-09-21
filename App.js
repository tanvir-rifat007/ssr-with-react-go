const { createElement: h, useState } = React;

// Heavy Home component
function Home() {
    const [count, setCount] = useState(0);

    // Simulate heavy computation / large DOM
    const largeList = [];
    for (let i = 0; i < 10000; i++) {
        largeList.push(h("li", { key: i }, `Item #${i}`));
    }

    return h("div", null,
        h("h1", null, "This is SSR - Heavy Render"),
        h("p", null, "This SSR is built with React + Go"),
        h("button", { onClick: () => setCount(count + 1) }, `click me: ${count} times`),
        h("ul", null, ...largeList)
    );
}

function About() {
    return h("div", null,
        h("h1", null, "About Page"),
        h("p", null, "Learn more about us")
    );
}

function App(props) {
    const pathname = props.ssrPathname || '/';

    let PageComponent;
    switch (pathname) {
        case '/':
            PageComponent = Home;
            break;
        case '/about':
            PageComponent = About;
            break;
        default:
            PageComponent = () => h("div", null, h("h1", null, "404"));
    }

    return h("div", null,
        h("nav", { style: { padding: "20px", borderBottom: "1px solid #ccc" } },
            h("a", { href: "/", style: { marginRight: "20px" } }, "Home"),
            h("a", { href: "/about" }, "About")
        ),
        h("main", { style: { padding: "20px" }, className: "main" },
            h(PageComponent)
        )
    );
}

globalThis.App = App;

