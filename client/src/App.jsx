
import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

const emptyForm = {
  name: "",
  college: "",
  email: "",
  password: "",
  category: "Technical"
};

function App() {
  const [page, setPage] = useState("register");
  const [form, setForm] = useState(emptyForm);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("codetech_token")
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async response => {
        if (!response.ok) throw new Error("Session expired");
        return response.json();
      })
      .then(data => {
        setUser(data.user);
        setPage("dashboard");
      })
      .catch(() => {
        localStorage.removeItem("codetech_token");
        setToken(null);
      });
  }, [token]);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const endpoint =
        page === "register" ? "register" : "login";

      const body =
        page === "register"
          ? form
          : { email: form.email, password: form.password };

      const response = await fetch(`${API}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      localStorage.setItem("codetech_token", data.token);
      setUser(data.user);
      setToken(data.token);
      setPage("dashboard");
      setForm(emptyForm);
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("codetech_token");
    setToken(null);
    setUser(null);
    setPage("login");
    setForm(emptyForm);
    setMessage("You have logged out.");
  }

  return (
    <div className="app">
      <header>
        <div className="brand">
          CodeTech <span>Crafters LLP</span>
        </div>

        {user && page === "dashboard" && (
          <button className="secondary" onClick={logout}>
            Logout
          </button>
        )}
      </header>

      {page === "dashboard" && user ? (
        <main className="dashboard">
          <p className="eyebrow">STUDENT DASHBOARD</p>
          <h1>Welcome, {user.name}!</h1>
          <p>You have successfully logged in.</p>

          <div className="card">
            <h2>Your Details</h2>
            <p><b>Name:</b> {user.name}</p>
            <p><b>College:</b> {user.college}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Category:</b> {user.category}</p>
          </div>
        </main>
      ) : (
        <main className="layout">
          <section className="intro">
            <p className="eyebrow">CODETECH CRAFTERS LLP</p>
            <h1>Innovate.<br />Code.<br /><span>Create.</span></h1>
            <p>
              Join our college hackathon for Technical,
              Python, and MERN Stack developers.
            </p>
          </section>

          <section className="card">
            <div className="tabs">
              <button
                className={page === "register" ? "active" : ""}
                onClick={() => {
                  setPage("register");
                  setMessage("");
                }}
              >
                Register
              </button>
              <button
                className={page === "login" ? "active" : ""}
                onClick={() => {
                  setPage("login");
                  setMessage("");
                }}
              >
                Login
              </button>
            </div>

            <h2>
              {page === "register"
                ? "Create Account"
                : "Welcome Back"}
            </h2>

            <p className="muted">
              {page === "register"
                ? "Register for the hackathon."
                : "Login to your student account."}
            </p>

            <form onSubmit={handleSubmit}>
              {page === "register" && (
                <>
                  <label>
                    Full Name
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your name"
                    />
                  </label>

                  <label>
                    College Name
                    <input
                      name="college"
                      value={form.college}
                      onChange={handleChange}
                      required
                      placeholder="Enter your college"
                    />
                  </label>
                </>
              )}

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  placeholder="student@example.com"
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={page === "register" ? 8 : undefined}
                  autoComplete={
                    page === "register"
                      ? "new-password"
                      : "current-password"
                  }
                  placeholder="Enter password"
                />
              </label>

              {page === "register" && (
                <label>
                  Hackathon Category
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option>Technical</option>
                    <option>Python</option>
                    <option>MERN Stack</option>
                  </select>
                </label>
              )}

              {message && <p className="message">{message}</p>}

              <button className="submit" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : page === "register"
                    ? "Create Account"
                    : "Login"}
              </button>
            </form>

            <p className="switch">
              {page === "register"
                ? "Already registered?"
                : "New student?"}
              {" "}
              <button
                className="link"
                onClick={() => {
                  setPage(
                    page === "register" ? "login" : "register"
                  );
                  setMessage("");
                }}
              >
                {page === "register"
                  ? "Login here"
                  : "Register here"}
              </button>
            </p>
          </section>
        </main>
      )}

      <footer>
        © 2026 CodeTech Crafters LLP | College Hackathon
      </footer>
    </div>
  );
}

export default App;
