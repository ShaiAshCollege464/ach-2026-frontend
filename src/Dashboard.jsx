import {useEffect, useState} from 'react'
import './App.css'
import axios from "axios";
import {useNavigate} from "react-router-dom";


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
    const navigate = useNavigate();
    const [uri, setUri] = useState("");

    useEffect(() => {
        //TODO: from the server I will send an ArrayList of the teams that the manager workers in
        axios.get(BACKEND_URL + "get-teams").then(response => {
            setTeams(Array.isArray(response.data) ? response.data : []);
        }).catch(error => {
            console.error("Failed to load teams", error);
            setTeams([]);
        })

        getTeammates();

    }, []);

    useEffect(() => {
        axios.get(BACKEND_URL + "/get-authenticator-uri").then(response => {
            setUri(response.data.uri);
        })
    }, []);

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
                    style={{ borderColor: '#ff4d4d', color: '#ff4d4d' }} // קצת צבע אדום שירגיש כמו התנתקות
                >
                    Logout
                </button>
            </section>

            <section className="panel">
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
            </section>

            <section className="panel">
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
                            </tr>
                        ))}
                        {visibleWorkers.length === 0 && (
                            <tr>
                                <td className="empty-cell" colSpan="4">No workers to show</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </section>


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
