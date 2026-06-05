import { useEffect, useState } from 'react';
import './App.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TransferWorkerModal from "./TransferWorkerModal.jsx";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || "http://localhost:8085/";

function normalizeWorker(worker) {
    const teamEntity = worker.teamEntity;
    return {
        ...worker,
        teamName: worker.teamName || teamEntity?.name || "",
        teamId: worker.teamId || teamEntity?.id || null,
    };
}

function normalizeWorkers(workers) {
    return Array.isArray(workers) ? workers.map(normalizeWorker) : [];
}

function Dashboard() {
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [transferWorker, setTransferWorker] = useState(null);
    const [isManager, setIsManager] = useState(false);
    const [teamTasks, setTeamTasks] = useState([]);
    const navigate = useNavigate();
    const [uri, setUri] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [allTasks, setAllTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDetails, setTaskDetails] = useState("");
    const [taskStartDate, setTaskStartDate] = useState("");
    const [taskHoursEstimate, setTaskHoursEstimate] = useState("");
    const [taskTeamId, setTaskTeamId] = useState("");
    const [taskNotice, setTaskNotice] = useState(null);

    const [filterText, setFilterText] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterTime, setFilterTime] = useState("all");

    const getTeammates = () => {
        axios.defaults.withCredentials = true;
        axios.get(BACKEND_URL + "get-workers-by-manager").then(response => {
            setWorkers(normalizeWorkers(response.data));
        }).catch(error => {
            console.error("Failed to load workers", error);
            setWorkers([]);
        });
    };

    useEffect(() => {
        axios.get(BACKEND_URL + "get-teams").then(response => {
            setTeams(Array.isArray(response.data) ? response.data : []);
        }).catch(error => {
            console.error("Failed to load teams", error);
            setTeams([]);
        });

        getTeammates();

        axios.get(BACKEND_URL + "is-manager").then(response => {
            setIsManager(response.data.isManager === true);
        }).catch(() => setIsManager(false));

        axios.get(BACKEND_URL + "get-team-tasks").then(response => {
            setTeamTasks(Array.isArray(response.data) ? response.data : []);
        }).catch(() => setTeamTasks([]));
    }, []);

    useEffect(() => {
        axios.get(BACKEND_URL + "/get-authenticator-uri").then(response => {
            setUri(response.data.uri);
        });
    }, []);

    useEffect(() => {
        axios.get(BACKEND_URL + "get-tasks")
            .then(response => {
                setAllTasks(Array.isArray(response.data) ? response.data : []);
                console.log(allTasks);
            })
            .catch(() => setAllTasks([]));
    }, []);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTaskTitle("");
        setTaskDetails("");
        setTaskStartDate("");
        setTaskHoursEstimate("");
        setTaskTeamId("");
    };

    const missingTaskFields = [
        !taskTitle.trim() ? "title" : null,
        !taskDetails.trim() ? "details" : null,
        !taskTeamId ? "team" : null,
        !taskStartDate ? "start date and time" : null,
        !taskHoursEstimate ? "hours estimate" : null,
    ].filter(Boolean);
    const taskValidationMessage = missingTaskFields.length > 0
        ? "Please fill: " + missingTaskFields.join(", ")
        : "";

    const handleSaveTask = () => {
        if (missingTaskFields.length > 0) return;

        const params = new URLSearchParams({
            title: taskTitle,
            description: taskDetails,
            start: taskStartDate,
            duration: taskHoursEstimate,
            teamId: taskTeamId,
        });

        axios.post(BACKEND_URL + "add-task?" + params.toString())
            .then(() => {
                handleCloseModal();
                setTaskNotice({ type: "success", message: "Task saved successfully" });
                window.setTimeout(() => setTaskNotice(null), 2600);
                axios.get(BACKEND_URL + "get-tasks").then(res => setAllTasks(res.data));
            })
            .catch(error => {
                console.error("Failed to save", error);
                handleCloseModal();
                setTaskNotice({ type: "error", message: "Task could not be saved" });
                window.setTimeout(() => setTaskNotice(null), 3200);
            });
    };



    const filteredTasks = allTasks.filter(task => {
        const matchesText =
            task.title?.toLowerCase().includes(filterText.toLowerCase()) ||
            task.details?.toLowerCase().includes(filterText.toLowerCase());

        let matchesStatus = true;
        if (filterStatus === "completed") matchesStatus = task.isCompleted === true;
        if (filterStatus === "pending") matchesStatus = task.isCompleted !== true;

        let matchesTime = true;
        if (task.start && filterTime !== "all") {
            const taskDate = new Date(task.start).getTime();
            const now = Date.now();
            if (filterTime === "future") matchesTime = taskDate > now;
            if (filterTime === "past") matchesTime = taskDate <= now;
        }

        return matchesText && matchesStatus && matchesTime;
    });

    const visibleWorkers = selectedTeam
        ? workers.filter(worker => worker.teamId == selectedTeam.id)
        : workers;

    return (
        <main className="app-shell">
            {taskNotice && (
                <div className={"task-toast " + taskNotice.type} role="status" aria-live="polite">
                    <span className="task-toast-icon">{taskNotice.type === "success" ? "✓" : "!"}</span>
                    <span>{taskNotice.message}</span>
                </div>
            )}

            {uri && (
                <div style={{ padding: "30px" }}>
                    <img src={"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(uri)} alt="QR"/>
                </div>
            )}

            <section className="page-header">
                <div>
                    <p className="eyebrow">Team dashboard</p>
                    <h1>Workers Management</h1>
                </div>
            </section>

            <button className="action-button" onClick={() => setIsModalOpen(true)} style={{ marginBottom: "20px", padding: "10px 20px" }}>
                 Add Task / Team
            </button>

            {isModalOpen && (
                <div className="modal-overlay" style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex",
                    justifyContent: "center", alignItems: "center", zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        background: "white", padding: "30px", borderRadius: "12px",
                        width: "400px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                        display: "flex", flexDirection: "column", gap: "15px", color: "#333"
                    }}>
                        <h3 style={{ margin: "0 0 10px 0", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Add New Task</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <label style={{ fontWeight: "bold", fontSize: "14px" }}>Title (כותרת):</label>
                            <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Enter title" style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <label style={{ fontWeight: "bold", fontSize: "14px" }}>Details (פרטים):</label>
                            <textarea value={taskDetails} onChange={(e) => setTaskDetails(e.target.value)} placeholder="Enter task details" style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", minHeight: "60px", resize: "vertical" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <label style={{ fontWeight: "bold", fontSize: "14px" }}>Team:</label>
                            <select
                                value={taskTeamId}
                                onChange={(e) => setTaskTeamId(e.target.value)}
                                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "white" }}
                            >
                                <option value="" disabled>Select team</option>
                                {teams.map(team => (
                                    <option key={team.id} value={team.id}>{team.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <label style={{ fontWeight: "bold", fontSize: "14px" }}>Start Date (מועד התחלה):</label>
                            <input type="datetime-local" value={taskStartDate} onChange={(e) => setTaskStartDate(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <label style={{ fontWeight: "bold", fontSize: "14px" }}>Hours Estimate (הערכת שעות):</label>
                            <input type="number" value={taskHoursEstimate} onChange={(e) => setTaskHoursEstimate(e.target.value)} placeholder="e.g. 5" style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
                        </div>
                        {taskValidationMessage && (
                            <p style={{ margin: 0, color: "#b42318", fontSize: "13px", fontWeight: 600 }}>
                                {taskValidationMessage}
                            </p>
                        )}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
                            <button className="secondary-button" onClick={handleCloseModal} style={{ padding: "8px 15px" }}>Cancel</button>
                            <button className="action-button" onClick={handleSaveTask} style={{ padding: "8px 15px" }} disabled={missingTaskFields.length > 0}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            <section className="panel" style={{ marginBottom: "25px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 15px 0" }}> Filters</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>

                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: "1 1 200px" }}>
                        <label style={{ fontSize: "13px", fontWeight: "bold" }}>Free Search:</label>
                        <input
                            type="text"
                            placeholder="Search by title or details..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", width: "150px" }}>
                        <label style={{ fontSize: "13px", fontWeight: "bold" }}>Status:</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "white" }}
                        >
                            <option value="all">All</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", width: "150px" }}>
                        <label style={{ fontSize: "13px", fontWeight: "bold" }}>Time:</label>
                        <select
                            value={filterTime}
                            onChange={(e) => setFilterTime(e.target.value)}
                            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "white" }}
                        >
                            <option value="all">All Times</option>
                            <option value="future">Future Tasks</option>
                            <option value="past">Past Tasks</option>
                        </select>
                    </div>
                </div>
            </section>

            <section className="panel">
                <div className="section-header">
                    <div>
                        <h2>Total Tasks</h2>
                        <p>Showing {filteredTasks.length} out of {allTasks.length} tasks</p>
                    </div>
                </div>
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th>Details</th>
                            <th>Team</th>
                            <th>Start</th>
                            <th>Hours Estimate</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredTasks.map(task => (
                            <tr key={task.id}>
                                <td className="name-cell">
                                    {task.title}
                                </td>
                                <td>{task.details || task.description}</td>
                                <td>{task.teamName || "No team"}</td>
                                <td>{task.start ? new Date(task.start).toLocaleString("he-IL") : "—"}</td>
                                <td><span className="count-pill">{task.hoursEstimation}h</span></td>
                                <td>
                                    {task.completed ? "Completed" : " Pending"}
                                </td>

                            </tr>
                        ))}
                        {filteredTasks.length === 0 && (
                            <tr>
                                <td className="empty-cell" colSpan="6">No tasks match your filters</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </section>

            {isManager && (
                <section className="panel">
                    <div className="section-header">
                        <h2>Teams List</h2>
                        <p>{teams.length} teams available</p>
                    </div>
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead><tr><th>Name</th><th>Workers Count</th><th>Show Details</th></tr></thead>
                            <tbody>
                            {teams.map(item => (
                                <tr key={item.id}>
                                    <td className="name-cell">{item.name}</td>
                                    <td><span className="count-pill">{item.workersCount}</span></td>
                                    <td><button className="action-button" onClick={() => navigate("/team/" + item.id)}>To details page</button></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {isManager && (
                <section className="panel">
                    <div className="section-header">
                        <h2>{selectedTeam ? selectedTeam.name + " Workers" : "Worker List"}</h2>
                    </div>
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead><tr><th>First Name</th><th>Last Name</th><th>Team</th><th>Show Details</th><th>Transfer</th></tr></thead>
                            <tbody>
                            {visibleWorkers.map(item => (
                                <tr key={item.id}>
                                    <td className="name-cell">{item.firstName}</td>
                                    <td>{item.lastName}</td>
                                    <td>{item.teamName}</td>
                                    <td>
                                        <button className="action-button" onClick={() => {
                                            if (selectedWorker?.id == item.id) setSelectedWorker(null);
                                            else axios.get(BACKEND_URL + "get-worker-details?workerId=" + item.id).then(res => setSelectedWorker(normalizeWorker(res.data)));
                                        }}>{selectedWorker?.id == item.id ? "Hide Details" : "Show Details"}</button>
                                    </td>
                                    <td><button className="secondary-button" onClick={() => setTransferWorker(item)}>⇄ Transfer Team</button></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {transferWorker && <TransferWorkerModal worker={transferWorker} onClose={() => setTransferWorker(null)} onSuccess={getTeammates} />}
            {selectedWorker && (
                <section className="details-panel">
                    <h2>{selectedWorker.firstName} {selectedWorker.lastName}</h2>
                    <div className="details-field"><span>Team</span><strong>{selectedWorker.teamName || "No team"}</strong></div>
                </section>
            )}

            {Array.isArray(filteredTasks) && filteredTasks.length > 0 && (
                <section className="panel">
                    <div className="section-header">
                        <div>
                            <h2>Tasks List (Detailed View)</h2>
                            <p>{filteredTasks.length} filtered tasks displayed</p>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
                        {filteredTasks.map(task => (
                            <div key={task.id} style={{
                                border: task.isCompleted ? "3px solid #2ecc71" : "3px solid #4a90e2",
                                borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                            }}>
                                <h3 style={{ marginBottom: "10px", color: "#222" }}>{task.title}</h3>
                                <p style={{ marginBottom: "15px", color: "#555" }}>{task.details || task.description}</p>

                                <div style={{ fontSize: "13px", color: "#777", marginBottom: "15px" }}>
                                     <strong>Start:</strong> {task.start ? new Date(task.start).toLocaleString("he-IL") : "—"}
                                </div>

                                {task.isCompleted ? (
                                    <div style={{ marginBottom: "15px", color: "green", fontWeight: "bold", fontSize: "18px" }}>
                                         Completed Task
                                    </div>
                                ) : (
                                    <div style={{ marginBottom: "15px", color: "#e67e22", fontWeight: "bold", fontSize: "16px" }}>
                                         In Progress / Pending
                                    </div>
                                )}

                                <button
                                    className="action-button"
                                    onClick={() => {
                                        axios.post(BACKEND_URL + "task-completed?taskId=" + task.id).then(() => {
                                            setAllTasks(prev =>
                                                prev.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t)
                                            );
                                        }).catch(error => console.error("Failed to update task", error));
                                    }}
                                    style={{ backgroundColor: task.isCompleted ? "#e74c3c" : "#2ecc71" }}
                                >
                                    {task.isCompleted ? " Mark as Pending" : " Mark as Completed"}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}

export default Dashboard;
