// App.js - Server-side that mimics RouterProvider output
// because insides main.go the v8go doesn't understand the tanstack router

const { createElement: h, useState } = React;

function Home() {

    const [count, setCount] = useState(0);
    return h("div", null,
        h("h1", null, "This is ssr"),
        h("p", null, "This ssr is built with react+go"),
        h("button", { onClick: () => setCount(count + 1) }, `click me: ${count} times`)
    )

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

    // This structure must exactly match what RouterProvider + Layout + Outlet produces
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
