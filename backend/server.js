const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // อนุญาตให้ React frontend เรียก API ได้
app.use(express.json());

let tasks = [
  { id: 1, title: 'ทำการบ้าน', completed: false, dueDate: '2025-05-31' },
  { id: 2, title: 'ล้างจาน', completed: true, dueDate: '2025-05-20' },
];

// ดึงรายการงานทั้งหมด
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// เพิ่มงานใหม่
app.post('/tasks', (req, res) => {
  const newTask = {
    id: tasks.length + 1,
    title: req.body.title,
    completed: false,
    dueDate: req.body.dueDate,
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// แก้งาน (mark complete / update title, dueDate)
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  task.title = req.body.title ?? task.title;
  task.completed = req.body.completed ?? task.completed;
  task.dueDate = req.body.dueDate ?? task.dueDate;

  res.json(task);
});

// ลบงาน
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  tasks = tasks.filter(t => t.id !== id);
  res.status(204).end();
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
