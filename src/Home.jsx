import { useState } from "react";

export default function Home() {
    const [count, setCount] = useState(0);

    // Simulate heavy computation / large DOM
    const largeList = [];
    for (let i = 0; i < 10000; i++) {
        largeList.push(<li key={i}>Item #{i}</li>);
    }

    return (
        <div>
            <h1>This is SSR - Heavy Render</h1>
            <p>This SSR is built with React + Go</p>
            <button onClick={() => setCount(count + 1)}>
                click me: {count} times
            </button>
            <ul>{largeList}</ul>
        </div>
    );


}
