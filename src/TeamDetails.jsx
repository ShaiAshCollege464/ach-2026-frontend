import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import {BACKEND_URL} from "./Dashboard.jsx";

function TeamDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [showOnlyMyWorkers, setShowOnlyMyWorkers] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [newTeamName, setNewTeamName] = useState("");

    useEffect(() => {
        axios.defaults.withCredentials = true;
        axios.get(BACKEND_URL + "/team-details?id=" + id)
            .then(response => {
                setDetails(response.data);
                setNewTeamName(response.data.team.name);
                setErrorMessage("");
            })
            .catch(error => {
                console.error("Failed to load team details", error);
                setErrorMessage("Team details could not be loaded");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [id]);

    const workers = details?.team?.workers || [];
    const myWorkers = workers.filter(item => item.myWorker || item.managerId == details?.myId);
    const visibleWorkers = showOnlyMyWorkers ? myWorkers : workers;

    const saveTeamName = () => {
        axios.get(BACKEND_URL + "/update-team?id=" + id + "&name=" + encodeURIComponent(newTeamName))
            .then(response => {
                setDetails(response.data);
                setNewTeamName(response.data.team.name);
                setEditMode(false);
            })
            .catch(error => {
                console.error("Failed to update team name", error);
                setErrorMessage("Team name could not be updated");
            });
    };

    return (
        <main className="app-shell">
            <section className="page-header team-details-header">
                <div>
                    <p className="eyebrow">Team details</p>
                    {editMode ? (
                        <input
                            className="team-name-input"
                            value={newTeamName}
                            onChange={event => setNewTeamName(event.target.value)}
                        />
                    ) : (
                        <h1>{details?.team?.name || "Team"}</h1>
                    )}
                </div>
                <div className="header-actions">
                    {editMode ? (
                        <button className="action-button" onClick={saveTeamName}>
                            Save
                        </button>
                    ) : (
                        <button className="secondary-button" onClick={() => setEditMode(true)} disabled={!details}>
                            Edit
                        </button>
                    )}
                    <button className="secondary-button" onClick={() => navigate("/")}>
                        Back to dashboard
                    </button>
                </div>
            </section>

            {isLoading && (
                <section className="panel state-panel">
                    <p>Loading team details...</p>
                </section>
            )}

            {!isLoading && errorMessage && (
                <section className="panel state-panel error-state">
                    <p>{errorMessage}</p>
                </section>
            )}

            {!isLoading && details && (
                <>
                    <section className="team-summary">
                        <div className="summary-item">
                            <span>Total workers</span>
                            <strong>{workers.length}</strong>
                        </div>
                        <div className="summary-item">
                            <span>My workers</span>
                            <strong>{myWorkers.length}</strong>
                        </div>
                        <div className="summary-item">
                            <span>Current view</span>
                            <strong>{visibleWorkers.length}</strong>
                        </div>
                    </section>

                    <section className="panel">
                        <div className="section-header">
                            <div>
                                <h2>Workers in team</h2>
                                <p>{visibleWorkers.length} workers shown</p>
                            </div>
                            <label className="toggle-control">
                                <input
                                    type="checkbox"
                                    checked={showOnlyMyWorkers}
                                    onChange={() => setShowOnlyMyWorkers(!showOnlyMyWorkers)}
                                />
                                <span>Only my workers</span>
                            </label>
                        </div>

                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Manager</th>
                                    <th>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {visibleWorkers.map(item => (
                                    <tr key={item.id} className={item.myWorker ? "selected-row" : ""}>
                                        <td className="name-cell">{item.firstName}</td>
                                        <td>{item.lastName}</td>
                                        <td>{item.managerName || "No manager"}</td>
                                        <td>
                                            <span className={item.myWorker ? "status-pill owned" : "status-pill"}>
                                                {item.myWorker ? "My worker" : "Team worker"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {visibleWorkers.length === 0 && (
                                    <tr>
                                        <td className="empty-cell" colSpan="4">
                                            {workers.length === 0 ? "No workers in this team" : "No workers match this filter"}
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}

export default TeamDetails;
