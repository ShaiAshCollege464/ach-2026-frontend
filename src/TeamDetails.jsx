import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import {BACKEND_URL} from "./Dashboard.jsx";

function TeamDetails (props) {
    const { id } = useParams();
    const [details, setDetails] = useState(null)
    const [showOnlyMyWorkers, setShowOnlyMyWorkers] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [newTeamName, setNewTeamName] = useState("")

    useEffect(() => {
        axios.get(BACKEND_URL + "/team-details?id=" +id).then(response => {
            setDetails(response.data);
            setNewTeamName(response.data.team.name)
        })
    }, []);

    return (
        <div style={{
            padding: "20px"
        }}>
            {
                details &&
                <>
                    Team
                    {
                        editMode ?
                            <>
                                <input value={newTeamName} onChange={(event) => {
                                    setNewTeamName(event.target.value)
                                }}/>
                                <button onClick={() => {
                                    axios.get(BACKEND_URL + "/update-team?id=" + id + "&name=" + newTeamName).then(response => {
                                        setDetails(response.data);
                                        setEditMode(false)
                                    })
                                }}>
                                    Save
                                </button>
                            </>
                            :
                            <>
                                {details.team.name}
                            </>
                    }
                    <button onClick={() => {
                        setEditMode(!editMode)
                    }}>
                        Edit
                    </button>
                    <br/>
                    Workers count: {details.team.workers.length}
                    <br/>
                    {
                        details.team.workers.length == 0 ?
                            <>
                                No Workers in this team
                            </>
                            :
                            <>
                                Show Only my workers
                                <input type={"checkbox"} checked={showOnlyMyWorkers} onChange={() => {
                                    setShowOnlyMyWorkers(!showOnlyMyWorkers)
                                }}/>
                                <table>
                                    <tr>
                                        <th>
                                            First Name
                                        </th>
                                        <th>
                                            Last Name
                                        </th>

                                        <th>
                                            Manager
                                        </th>

                                    </tr>
                                    {
                                        details.team.workers.filter(item => {
                                            if (!showOnlyMyWorkers) {
                                                return true;
                                            } else {
                                                return item.managerId == details.myId ;
                                            }
                                        }).map(item => {
                                            return (
                                                <tr style={{
                                                    color: item.myWorker ? "blue" : "black"
                                                }}>
                                                    <td>
                                                        {item.firstName}
                                                    </td>
                                                    <td>
                                                        {item.lastName}
                                                    </td>
                                                    <td>
                                                        {item.managerName}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </table>
                            </>
                    }
                </>
            }
        </div>
    )
}

export default TeamDetails;