import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "./Dashboard.jsx";

/**
 * מודל להעברת עובד לצוות אחר
 * Props:
 *   worker   – אובייקט העובד (חובה: id, firstName, lastName, teamName)
 *   onClose  – פונקציה לסגירת המודל
 *   onSuccess – פונקציה שנקראת לאחר העברה מוצלחת (לרענון הרשימה)
 */
function TransferWorkerModal({ worker, onClose, onSuccess }) {
    const [allTeams, setAllTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [error, setError] = useState(null);

    // טעינת כל הצוותים בעת פתיחת המודל
    useEffect(() => {
        axios.defaults.withCredentials = true;
        axios.get(BACKEND_URL + "get-all-teams")
            .then(response => {
                setAllTeams(Array.isArray(response.data) ? response.data : []);
            })
            .catch(() => setError("שגיאה בטעינת רשימת הצוותים"))
            .finally(() => setLoadingTeams(false));
    }, []);

    const handleTransfer = () => {
        if (!selectedTeamId) return;
        setLoading(true);
        setError(null);

        axios.get(BACKEND_URL + `change-team?workerId=${worker.id}&teamId=${selectedTeamId}`)
            .then(() => {
                onSuccess();  // רענון הרשימה בקומפוננטה האב
                onClose();
            })
            .catch(() => setError("שגיאה בהעברת העובד, נסה שוב"))
            .finally(() => setLoading(false));
    };

    const selectedTeamName = allTeams.find(t => t.id == selectedTeamId)?.name;

    return (
        <div
            style={{
                position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
                justifyContent: "center", alignItems: "center", zIndex: 1000
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                background: "white", padding: "32px", borderRadius: "12px",
                width: "420px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                display: "flex", flexDirection: "column", gap: "18px", color: "#333"
            }}>
                {/* כותרת */}
                <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "12px" }}>
                    <p className="eyebrow" style={{ margin: "0 0 4px" }}>Transfer Worker</p>
                    <h3 style={{ margin: 0, fontSize: "20px", color: "#111827" }}>
                        {worker.firstName} {worker.lastName}
                    </h3>
                </div>

                {/* צוות נוכחי */}
                <div style={{
                    background: "#f8fafc", border: "1px solid #e2e8f0",
                    borderRadius: "8px", padding: "12px 16px"
                }}>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                        Current Team
                    </span>
                    <p style={{ margin: "4px 0 0", fontWeight: 600, color: "#1f2937" }}>
                        {worker.teamName || "No team"}
                    </p>
                </div>

                {/* בחירת צוות יעד */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontWeight: 700, fontSize: "14px", color: "#374151" }}>
                        Transfer to Team
                    </label>
                    {loadingTeams ? (
                        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Loading teams...</p>
                    ) : (
                        <select
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            style={{
                                padding: "10px 12px", borderRadius: "8px",
                                border: "1px solid #d1d5db", fontSize: "14px",
                                background: "white", color: "#1f2937", cursor: "pointer"
                            }}
                        >
                            <option value="" disabled>— Select a team —</option>
                            {allTeams.map(team => (
                                <option
                                    key={team.id}
                                    value={team.id}
                                    disabled={team.name === worker.teamName}
                                >
                                    {team.name}{team.name === worker.teamName ? " (current)" : ""}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* תצוגת יעד נבחר */}
                {selectedTeamName && selectedTeamName !== worker.teamName && (
                    <div style={{
                        background: "#f0fdf4", border: "1px solid #bbf7d0",
                        borderRadius: "8px", padding: "10px 14px",
                        fontSize: "14px", color: "#166534"
                    }}>
                        ✓ Will transfer to: <strong>{selectedTeamName}</strong>
                    </div>
                )}

                {/* שגיאה */}
                {error && (
                    <div style={{
                        background: "#fef2f2", border: "1px solid #fecaca",
                        borderRadius: "8px", padding: "10px 14px",
                        fontSize: "14px", color: "#991b1b"
                    }}>
                        ⚠ {error}
                    </div>
                )}

                {/* כפתורים */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
                    <button
                        className="secondary-button"
                        onClick={onClose}
                        style={{ padding: "9px 18px" }}
                    >
                        Cancel
                    </button>
                    <button
                        className="action-button"
                        onClick={handleTransfer}
                        disabled={!selectedTeamId || loading || selectedTeamName === worker.teamName}
                        style={{ padding: "9px 18px" }}
                    >
                        {loading ? "Transferring..." : "Transfer"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TransferWorkerModal;
