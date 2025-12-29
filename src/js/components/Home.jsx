import React, { useEffect, useState } from "react";
const BASE_URL = "https://playground.4geeks.com/todo";
const USERNAME = "felix_mauricio_britez_87";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchTasks = async () => {
  setErrorMsg("");
  setLoading(true);
  try {
    const resp = await fetch(`${BASE_URL}/users/${USERNAME}`); // 👈 CAMBIO CLAVE
    if (!resp.ok) throw new Error(`Error loading tasks (${resp.status})`);

    const data = await resp.json();
    const list = Array.isArray(data) ? data : Array.isArray(data.todos) ? data.todos : [];
    setTasks(list);
  } catch (err) {
    setTasks([]);
    setErrorMsg(err.message);
  } finally {
    setLoading(false);
  }
};


  const createUserIfNeeded = async () => {
    try {
      const resp = await fetch(`${BASE_URL}/users/${USERNAME}`, {
        method: "POST",
      });

      if (!resp.ok && resp.status !== 409 && resp.status !== 400) {
        console.warn("User could not be created:", resp.status);
      }
    } catch (err) {
      console.warn("Error creating user:", err);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    setErrorMsg("");
    try {
      const newTask = { label: text, is_done: false };

      const resp = await fetch(`${BASE_URL}/todos/${USERNAME}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (!resp.ok) throw new Error(`Could not create task (${resp.status})`);

      setInputValue("");
      await fetchTasks();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const deleteTask = async (id) => {
    setErrorMsg("");
    try {
      const resp = await fetch(`${BASE_URL}/todos/${id}`, { method: "DELETE" });

      // Si te da 404/405 acá, probá esta URL:
      // const resp = await fetch(`${BASE_URL}/todos/${USERNAME}/${id}`, { method: "DELETE" });

      if (!resp.ok) throw new Error(`Could not delete (${resp.status})`);

      await fetchTasks();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const clearAll = async () => {
    setErrorMsg("");
    try {
      await Promise.all(
        tasks.map((t) =>
          fetch(`${BASE_URL}/todos/${t.id}`, { method: "DELETE" })
        )
      );
      await fetchTasks();
    } catch (err) {
      setErrorMsg("Could not clear all");
    }
  };

  useEffect(() => {
    (async () => {
      await createUserIfNeeded();
      await fetchTasks();
    })();
  }, []);

  return (
    <div className="container" style={{ maxWidth: 520, marginTop: 40 }}>
      <h1 className="text-center">Todo List (Fetch)</h1>

      <form onSubmit={addTask} className="mt-4">
        <input
          className="form-control"
          placeholder="What needs to be done?"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={loading}
        />
      </form>

      <ul className="list-group mt-3">
        {tasks.length === 0 && !loading && (
          <li className="list-group-item text-muted">No tasks, add a task</li>
        )}

        {tasks.map((task) => (
          <li
            key={task.id ?? task.label}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>{task.label}</span>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => deleteTask(task.id)}
              title="Delete"
            >
              x
            </button>
          </li>
        ))}
      </ul>

      <div className="d-flex justify-content-between align-items-center mt-2">
        <small className="text-muted">
          {loading ? "Loading..." : `${tasks.length} item(s) left`}
        </small>

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={clearAll}
          disabled={tasks.length === 0 || loading}
        >
          Clear all
        </button>
      </div>

      {errorMsg && (
        <div className="alert alert-danger mt-3" role="alert">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
