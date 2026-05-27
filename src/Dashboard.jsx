import {useEffect, useState} from 'react'
import './App.css'
import axios from "axios";
import {useNavigate} from "react-router-dom";
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
    const [currentManagerToken, setCurrentManagerToken] = useState("");
    const [transferWorker, setTransferWorker] = useState(null);
    const [isManager, setIsManager] = useState(false);
    const [teamTasks, setTeamTasks] = useState([]);
    const navigate = useNavigate();
    const [uri, setUri] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDetails, setTaskDetails] = useState("");
    const [taskStartDate, setTaskStartDate] = useState("");
    const [taskHoursEstimate, setTaskHoursEstimate] = useState("");
    const getTeammates = () => {
        axios.defaults.withCredentials = true;
        axios.get(BACKEND_URL + "get-workers-by-manager").then(response => {
            console.log(response.data)
            setWorkers(normalizeWorkers(response.data));
            setCurrentManagerToken("");
        }).catch(error => {
            console.error("Failed to load workers", error);
            setWorkers([]);
        })
    }
    useEffect(() => {
        //TODO: from the server I will send an ArrayList of the teams that the manager workers in
        axios.get(BACKEND_URL + "get-teams").then(response => {
            setTeams(Array.isArray(response.data) ? response.data : []);
        }).catch(error => {
            console.error("Failed to load teams", error);
            setTeams([]);
        })

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
        })

    }, []);


    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTaskTitle("");
        setTaskDetails("");
        setTaskStartDate("");
        setTaskHoursEstimate("");
    };
    const handleSaveTask = () => {

        axios.post(BACKEND_URL + "add-task?title="+taskTitle+"&description="+taskDetails+"&start="+taskStartDate+"&duration="+taskHoursEstimate)
            .then(response => {
                alert("Saved successfully!");
                handleCloseModal();
                // במידת הצורך, רענן כאן נתונים (למשל קריאה מחדש לשרת)
            })
            .catch(error => {
                console.error("Failed to save", error);
                // זמנית נסגור בכל זאת כדי שתוכל לראות שזה עובד גם אם השרת לא מגיב עדיין
                handleCloseModal();
            });
    };
    const handleLogout = () => {
        // מחיקת העוגייה
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        // ריענון וחזרה למסך הבית
        window.location.href = "/";
    };

    const visibleWorkers = selectedTeam
        ? workers.filter(worker => worker.teamId == selectedTeam.id)
        : workers;

    return (

        <main className="app-shell">
            {
                uri &&
                <>
                    <div style={{
                        padding: "30px"
                    }}>
                        <img src={"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(uri)}/>
                    </div>
                </>
            }
            <section className="page-header">
                <div>
                    <p className="eyebrow">Team dashboard</p>
                    <h1>Workers Management</h1>
                </div>

                <button
                    className="secondary-button"
                    onClick={handleLogout}
                    style={{ borderColor: '#ff4d4d', color: '#ff4d4d' }}
                    Logout
                </button>
            </section>

            {/* כפתור פתיחת הפופאפ שמילאנו בלוגיקה */}
            <button className="action-button" onClick={() => setIsModalOpen(true)} style={{ marginBottom: "20px", padding: "10px 20px" }}>
                ➕ Add Task / Team
            </button>

            {/* --- קוד ה-POPUP (MODAL) --- */}
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
                            <input
                                type="text"
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                placeholder="Enter title"
                                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <label style={{ fontWeight: "bold", fontSize: "14px" }}>Details (פרטים):</label>
                            <textarea
                                value={taskDetails}
                                onChange={(e) => setTaskDetails(e.target.value)}
                                placeholder="Enter task details"
                                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", minHeight: "60px", resize: "vertical" }}
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <label style={{ fontWeight: "bold", fontSize: "14px" }}>Start Date (מועד התחלה):</label>
                            <input
                                type="datetime-local"
                                value={taskStartDate}
                                onChange={(e) => setTaskStartDate(e.target.value)}
                                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <label style={{ fontWeight: "bold", fontSize: "14px" }}>Hours Estimate (הערכת שעות):</label>
                            <input
                                type="number"
                                value={taskHoursEstimate}
                                onChange={(e) => setTaskHoursEstimate(e.target.value)}
                                placeholder="e.g. 5"
                                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
                            <button className="secondary-button" onClick={handleCloseModal} style={{ padding: "8px 15px" }}>
                                Cancel (ביטול)
                            </button>
                            <button className="action-button" onClick={handleSaveTask} style={{ padding: "8px 15px" }} disabled={!taskTitle}>
                                Save (שמירה)
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <section className="panel">
                <div className="section-header">
                    <div>
                        <h2>My Team Tasks</h2>
                        <p>{teamTasks.length} tasks in your team</p>
                    </div>
                </div>
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th>Details</th>
                            <th>Start</th>
                            <th>Hours Estimate</th>
                        </tr>
                        </thead>
                        <tbody>
                        {teamTasks.map(task => (
                            <tr key={task.id}>
                                <td className="name-cell">{task.title}</td>
                                <td>{task.details}</td>
                                <td>{task.start ? new Date(task.start).toLocaleString("he-IL") : "—"}</td>
                                <td><span className="count-pill">{task.hoursEstimation}h</span></td>
                            </tr>
                        ))}
                        {teamTasks.length === 0 && (
                            <tr>
                                <td className="empty-cell" colSpan="4">No tasks assigned to your team</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </section>
            {isManager && <section className="panel">
                <div className="section-header">
                    <div>
                        <h2>Teams List</h2>
                        <p>{teams.length} teams available</p>
                    </div>
                </div>

                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Workers Count</th>
                            <th>Show Details</th>

                        </tr>
                        </thead>
                        <tbody>
                        {teams.map(item => (
                            <tr key={item.id} className={selectedTeam && selectedTeam.id == item.id ? "selected-row" : ""}>
                                <td className="name-cell">{item.name}</td>
                                <td>
                                    <span className="count-pill">{item.workersCount}</span>
                                </td>
                                <td>
                                    <button className="action-button" onClick={() => {
                                        navigate("/team/" + item.id)
                                    }}>
                                        To details page
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </section>}

            {isManager && <section className="panel">
                <div className="section-header">
                    <div>
                        <h2>{selectedTeam ? selectedTeam.name + " Workers" : "Worker List"}</h2>
                        <p>{visibleWorkers.length} workers shown</p>
                    </div>
                    {selectedTeam && (
                        <button className="secondary-button" onClick={() => setSelectedTeam(null)}>
                            Clear Filter
                        </button>
                    )}
                </div>

                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Team</th>
                            <th>Show Details</th>
                            <th>Transfer Worker</th>
                        </tr>
                        </thead>
                        <tbody>
                        {visibleWorkers.map(item => (
                            <tr key={item.id} className={selectedWorker && selectedWorker.id == item.id ? "selected-row" : ""}>
                                <td className="name-cell">{item.firstName}</td>
                                <td>{item.lastName}</td>
                                <td>{item.teamName}</td>
                                <td>
                                    <button className="action-button" onClick={() => {
                                        if (selectedWorker && selectedWorker.id == item.id) {
                                            setSelectedWorker(null)
                                        } else {
                                            axios.get(BACKEND_URL + "get-worker-details?workerId=" + item.id)
                                                .then(response => {
                                                    const workerDetails = normalizeWorker(response.data);
                                                    setSelectedWorker(workerDetails);
                                                }).catch(error => {
                                                console.error("Failed to load worker details", error);
                                                setSelectedWorker(item);
                                            })
                                        }
                                    }}>
                                        {selectedWorker && selectedWorker.id == item.id ? "Hide Details" : "Show Details"}
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="secondary-button"
                                        onClick={() => setTransferWorker(item)}
                                        style={{ whiteSpace: "nowrap" }}
                                    >
                                        ⇄ Transfer Team
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {visibleWorkers.length === 0 && (
                            <tr>
                                <td className="empty-cell" colSpan="5">No workers to show</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </section>}

            {transferWorker && (
                <TransferWorkerModal
                    worker={transferWorker}
                    onClose={() => setTransferWorker(null)}
                    onSuccess={getTeammates}
                />
            )}
            {selectedWorker && (
                <section className="details-panel">
                    <div>
                        <p className="eyebrow">Worker Details</p>
                        <h2>{selectedWorker.firstName} {selectedWorker.lastName}</h2>
                    </div>

                    <div className="details-field">
                        <span>Team</span>
                        <strong>{selectedWorker.teamName || "No team"}</strong>
                    </div>
                </section>
            )}
        </main>
    )
}

export default Dashboard
