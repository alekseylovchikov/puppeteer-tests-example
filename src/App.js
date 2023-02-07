import Login from "./Login";
import SuccessMessage from "./SuccessMessage";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [complete, setComplete] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [data, setData] = useState({});

  useEffect(() => {
    fetch("https://swapi.dev/api/people/1")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (document.cookie.includes("JWT")) {
      setComplete(true);
    }

    document.cookie = `firstName=${firstName}`;
  };

  const handleChangeFirstName = (e) => {
    setFirstName(e.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 data-testid="h1" className="App-title">
          Welcome to React
        </h1>
        <nav data-testid="navbar" className="navbar" role="navigation">
          <ul>
            <li data-testid="navBarLi" className="nav-li">
              <a href="/#">Home</a>
            </li>
            <li data-testid="navBarLi" className="nav-li">
              <a href="/#">About 3</a>
            </li>
            <li data-testid="navBarLi" className="nav-li">
              <a href="/#">Skills</a>
            </li>
            <li data-testid="navBarLi" className="nav-li">
              <a href="/#">Works</a>
            </li>
          </ul>
        </nav>
      </header>
      <h3 data-testid="starWars">
        {data.url ? "Received StarWars data!" : "Something went wrong"}
      </h3>
      {complete ? (
        <SuccessMessage />
      ) : (
        <Login
          submit={handleSubmit}
          handleChangeFirstName={handleChangeFirstName}
        />
      )}
    </div>
  );
}

export default App;
