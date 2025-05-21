// import logo from './logo.svg';
// import './App.css';

import React, { useEffect, useState } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  // โหลดงานจาก backend
  const fetchTasks = async () => {
    const res = await fetch('http://localhost:5000/tasks');
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // เพิ่มงาน
  const addTask = async () => {
    if (!newTitle || !newDueDate) return alert('กรุณากรอกชื่อและวันที่หมดเขต');
    await fetch('http://localhost:5000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, dueDate: newDueDate }),
    });
    setNewTitle('');
    setNewDueDate('');
    fetchTasks();
  };

  // แก้สถานะงาน (completed)
  const toggleComplete = async (id, completed) => {
    await fetch(`http://localhost:5000/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    });
    fetchTasks();
  };

  // ลบงาน
  const deleteTask = async (id) => {
    await fetch(`http://localhost:5000/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Manager</h1>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="ชื่องาน"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
        />
        <button onClick={addTask}>เพิ่มงาน</button>
      </div>

      <ul>
        {tasks.map((task) => (
          <li key={task.id} style={{ marginBottom: '10px' }}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleComplete(task.id, task.completed)}
            />
            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
              {task.title} (หมดเขต: {task.dueDate})
            </span>
            <button onClick={() => deleteTask(task.id)} style={{ marginLeft: '10px' }}>
              ลบ
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

