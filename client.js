import { createRoot } from "react-dom/client";
import { createElement as h, useState } from "react";
import {
    createRouter,
    createRoute,
    createRootRoute,
    RouterProvider,
    Link,
    Outlet
} from "@tanstack/react-router";

// Route components
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

// Layout component
function Layout() {
    return h("div", null,
        h("nav", { style: { padding: "20px", borderBottom: "1px solid #ccc" } },
            h(Link, { to: "/", style: { marginRight: "20px" } }, "Home"),
            h(Link, { to: "/about" }, "About")
        ),
        h("main", { style: { padding: "20px" }, className: "main" },
            h(Outlet)
        )
    );
}

// Define routes
const rootRoute = createRootRoute({
    component: Layout,
});

const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: Home,
});

const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/about",
    component: About,
});

// Create route tree
const routeTree = rootRoute.addChildren([homeRoute, aboutRoute]);

// Create router
const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
});

// Use createRoot instead of hydrateRoot
function App() {
    return h(RouterProvider, { router });
}

const root = createRoot(document.getElementById("root"));
root.render(h(App));
