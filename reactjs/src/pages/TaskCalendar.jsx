import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Table, Alert, Card, Row, Col, FloatingLabel, Toast, ToastContainer} from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import TopNavbar from '../components/TopNavbar';
import '../TasksCalendar.css';


const TaskCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]); // To hold list of users
  const [activeTab, setActiveTab] = useState('taskscalendar');
  const [username, setUserName] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [createSuccess, setCreateSuccess] = useState('');
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Task form state
  const [task, setTask] = useState({
    taskName: '',
    taskDescription: '',
    taskStartDate: '',
    taskEndDate: '',
    taskOwner: '',
    taskColor: '',
  });

  // Fetch users on component mount or after user creation
  useEffect(() => {
    if (username) {
      fetchTasksByUser(username);
    }
  }, [username]);
  
  // add task data
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formattedTask = {
        ...task,
        taskOwner: username, // ✅ inject username at submission time
      };

      console.log('Submitting task:', formattedTask);
      const response = await axios.post('http://localhost:8080/servletapp/api/tasks', formattedTask ,{headers: {'Content-Type': 'application/json',},withCredentials: true,});
      console.log('Task created:', response.data);
      console.log('Fetching tasks after creation');
      setCreateSuccess(response.data.message);

      if (username) {
        fetchTasksByUser(username);

        // ✅ Reset form fields here
        setTask({
          taskName: '',
          taskDescription: '',
          taskStartDate: '',
          taskEndDate: '',
          taskOwner: username,
          taskColor: '',
        });

        setShowModal(false);
      }
    } catch (error) {
      console.error('Error creating task:', error.response?.data || error.message);
      setCreateError(error.response?.data?.error || 'Failed to create task. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update task state
    setTask(prev => {
      const updatedTask = { ...prev, [name]: value };

      if (name === 'taskStartDate') {
      updatedTask.taskEndDate = value;
    }

      return updatedTask;
    });
  };

  const fetchTasksByUser = async (username) => {
    try {
      const response = await fetch(`http://localhost:8080/servletapp/api/tasks?user=${username}`, {
        credentials: 'include',
      });

      const rawData = await response.json();
      console.log("Raw fetched data:", rawData);

      const grouped = rawData.reduce((acc, task) => {
        const startDate = new Date(task.taskStartDate);
        const endDate = new Date(task.taskEndDate);

        let current = new Date(startDate);
        while (current <= endDate) {
          const dateKey = current.toISOString().split('T')[0]; // YYYY-MM-DD

          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          acc[dateKey].push(task);

          current.setDate(current.getDate() + 1); // move to next day
        }

        return acc;
      }, {});

      setTasks(grouped);
      console.log('Grouped tasks (spanning dates):', grouped);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  // Format date to YYYY-MM-DD for easy key matching
  const formatDate = (date) => date.toLocaleDateString('en-CA'); // en-CA → 2025-06-28

  const formatDateTime = (input) => {
    const date = new Date(input);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    let hours = date.getHours();
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // hour '0' should be '12'

    const formattedTime = `${hours}:${minutes} ${ampm}`;

    return `${year}-${month}-${day} ${formattedTime}`;
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null; // Only show dots on month view

    const formatted = formatDate(date); // "YYYY-MM-DD"
    if (tasks[formatted]) {
      return <div className="dot" />;
    }
    return null;
  };

  const handleEditTaskClick = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedTask(prev => {
      const updated = { ...prev, [name]: value };

      if (name === 'taskStartDate') {
        updated.taskEndDate = value;
      }

      return updated;
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(`http://localhost:8080/servletapp/api/tasks/${selectedTask.taskID}`, selectedTask, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      setEditSuccess('Task updated successfully!');
      fetchTasksByUser(username);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating task:', error);
      setEditError('Failed to update task. Please try again.');
    }
  };


  const renderTasksForDate = () => {
    const formatted = formatDate(selectedDate);
    const dayTasks = tasks[formatted];
    return dayTasks ? (
      <ul className="task-list">
        {dayTasks.map((task, index) => (
          <li key={index} onClick={() => handleEditTaskClick(task)} style={{backgroundColor: task.taskColor, padding: '10px',borderRadius: '8px',marginBottom: '10px'}}>
            <div><strong>Task:</strong> {task.taskName}</div>
            <div><strong>Start:</strong> {formatDateTime(task.taskStartDate)}</div>
            <div><strong>End:</strong> {formatDateTime(task.taskEndDate)}</div>
          </li>
        ))}
      </ul>
    ) : (
      <ul className="task-list">
        <li>No tasks for this day.</li>
      </ul>
    );
  };

  // success and error message timers
  useEffect(() => {
    let timer;

    if (createSuccess) {
      timer = setTimeout(() => {
        setCreateSuccess(null); // Clear success message after delay
      }, 3000); // 3 secs
    }

    return () => clearTimeout(timer);
  }, [createSuccess]);

  useEffect(() => {
    let timer;

    if (editError) {
      timer = setTimeout(() => {
        setEditError(null); // Clear error message after delay
      }, 3000);
    }

    return () => clearTimeout(timer); // Cleanup on unmount or when editError changes
  }, [editError]);

  useEffect(() => {
    let timer;

    if (editSuccess) {
      timer = setTimeout(() => {
        setEditSuccess(null); // Clear success message after delay
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [editSuccess]);

  useEffect(() => {
    let timer;

    if (createError) {
      timer = setTimeout(() => {
        setCreateError(null); // Clear success message after delay
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [createError]);

  return (
    <>
      <TopNavbar activeTab={activeTab} onTabChange={setActiveTab} setName={setUserName} />
       <div className="calendar-container">
        {/* Show edit success message*/}
          {createSuccess && (
            <Alert variant="success" className="mt-2">
              {createSuccess}
            </Alert>
          )}

          {/* Show edit error message*/}
          {editError && (
            <Alert variant="danger" className="mt-2">
              {editError}
            </Alert>
          )}

          {/* Show edit success message*/}
          {editSuccess && (
            <Alert variant="success" className="mt-2">
              {editSuccess}
            </Alert>
          )}
        <Row className="align-items-center">
          <Col md={10} className="mb-1">
            <h4>Task Calendar</h4>
          </Col>
          <Col md={2} className="mb-1">
            <Button style={{ minWidth: '50%' }} variant="success" onClick={() => setShowModal(true)}>Add a Task</Button>
          </Col>
        </Row>

        <div className="calendar-task-wrapper">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
          />
          <div className="task-display">
            <h5>Date: {selectedDate.toLocaleDateString('en-CA')}:</h5>
            {renderTasksForDate()}
          </div>
        </div>
      </div>
      {/* Create Task Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add a Task</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="mb-1">
              <Col md={6}>
                <FloatingLabel controlId="formName" label="Task Name:">
                  <Form.Control type="text" name="taskName" onChange={handleChange} value={task.taskName} placeholder="Task Name" required/>
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel controlId="formDescription" label="Task Description:">
                  <Form.Control type="text" name="taskDescription" onChange={handleChange} value={task.taskDescription} placeholder="Task Description"/>
                </FloatingLabel>
              </Col>
            </Row>
            <Row className="mb-1">
              <Col md={6}>
                  <FloatingLabel controlId="formStartDate" label="Start Date:">
                    <Form.Control type="datetime-local" name="taskStartDate" onChange={handleChange} value={task.taskStartDate} placeholder="Task Start Date" onKeyDown={(e) => e.preventDefault()} required/>
                  </FloatingLabel>
                </Col>
              <Col md={6}>
                <FloatingLabel controlId="formEndDate" label="End Date:">
                  <Form.Control type="datetime-local" name="taskEndDate" onChange={handleChange} value={task.taskEndDate} placeholder="Task End Date" onKeyDown={(e) => e.preventDefault() } disabled={!task.taskStartDate}/>
                </FloatingLabel>
              </Col>
            </Row>
            <Row className="mb-1">
              <Col md={12}>
                <FloatingLabel controlId="formColor" label="Task Color:">
                  <Form.Select name="taskColor" value={task.taskColor} onChange={handleChange} required>
                    <option value="">Select a color</option>
                    <option value="lightcyan" style={{ backgroundColor: 'lightcyan' }}>lightcyan</option>
                    <option value="lightyellow" style={{ backgroundColor: 'lightyellow' }}>lightyellow</option>
                    <option value="lightgreen" style={{ backgroundColor: 'lightgreen' }}>lightgreen</option>
                    <option value="lightsalmon" style={{ backgroundColor: 'lightsalmon' }}>lightsalmon</option>
                    <option value="lightblue" style={{ backgroundColor: 'lightblue' }}>lightblue</option>
                    <option value="lavender" style={{ backgroundColor: 'lavender' }}>lavender</option>
                    <option value="mistyrose" style={{ backgroundColor: 'mistyrose' }}>mistyrose</option>
                    <option value="honeydew" style={{ backgroundColor: 'honeydew' }}>honeydew</option>
                    <option value="papayawhip" style={{ backgroundColor: 'papayawhip' }}>papayawhip</option>
                    <option value="mintcream" style={{ backgroundColor: 'mintcream' }}>mintcream</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
            </Row>
            <Row className="mb-1">
              <Col md={12}>
              {/* Show edit success message*/}
              {createError && (
                <Alert variant="success" className="mt-2">
                  {createError}
                </Alert>
              )}
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer className="justify-content-center">
            <Button type="submit" variant="success">Create</Button>
            <Button variant="danger" onClick={() => setShowModal(false)}>Cancel</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Row className="mb-1">
              <Col md={6}>
                <FloatingLabel controlId="editTaskName" label="Task Name">
                  <Form.Control
                    type="text"
                    name="taskName"
                    value={selectedTask?.taskName || ''}
                    onChange={(e) => handleEditChange(e)}
                    required
                  />
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel controlId="editTaskDescription" label="Task Description">
                  <Form.Control
                    type="text"
                    name="taskDescription"
                    value={selectedTask?.taskDescription || ''}
                    onChange={handleEditChange}
                  />
                </FloatingLabel>
              </Col>
            </Row>
            <Row className="mb-1">
              <Col md={6}>
                <FloatingLabel controlId="editTaskStartDate" label="Start Date">
                  <Form.Control
                    type="datetime-local"
                    name="taskStartDate"
                    value={selectedTask?.taskStartDate || ''}
                    onChange={handleEditChange}
                    required
                  />
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel controlId="editTaskEndDate" label="End Date">
                  <Form.Control
                    type="datetime-local"
                    name="taskEndDate"
                    value={selectedTask?.taskEndDate || ''}
                    onChange={handleEditChange}
                    required
                  />
                </FloatingLabel>
              </Col>
            </Row>
            <Row className="mb-1">
              <Col md={12}>
                <FloatingLabel controlId="editTaskColor" label="Task Color">
                  <Form.Select name="taskColor" value={selectedTask?.taskColor || ''} onChange={handleEditChange} required>
                    <option value="">Select a color</option>
                    <option value="lightcyan">lightcyan</option>
                    <option value="lightyellow">lightyellow</option>
                    <option value="lightgreen">lightgreen</option>
                    <option value="lightsalmon">lightsalmon</option>
                    <option value="lightblue">lightblue</option>
                    <option value="lavender">lavender</option>
                    <option value="mistyrose">mistyrose</option>
                    <option value="honeydew">honeydew</option>
                    <option value="papayawhip">papayawhip</option>
                    <option value="mintcream">mintcream</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="justify-content-center">
            <Button variant="primary" type="submit">Save Changes</Button>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </>
  );
};

export default TaskCalendar;
