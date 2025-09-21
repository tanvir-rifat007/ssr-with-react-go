import { createRoot } from "react-dom/client";
import {
    createRouter,
    createRoute,
    createRootRoute,
    RouterProvider,
} from "@tanstack/react-router";
import Home from "./Home";
import About from "./About";
import Layout from "./Layout";

// Route components


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
    defaultPreload: "intent",
});

// App component
function App() {
    return <RouterProvider router={router} />;
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);

