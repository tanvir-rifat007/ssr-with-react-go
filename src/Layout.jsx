import { Link, Outlet } from "@tanstack/react-router";

export default function Layout() {
    return (
        <div>
            <nav style={{ padding: "20px", borderBottom: "1px solid #ccc" }}>
                <Link to="/" style={{ marginRight: "20px" }}>
                    Home
                </Link>
                <Link to="/about">About</Link>
            </nav>
            <main style={{ padding: "20px" }} className="main">
                <Outlet />
            </main>
        </div>
    );
}

