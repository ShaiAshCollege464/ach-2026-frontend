import {useEffect, useState} from 'react'
import './App.css'
import axios from "axios";




const BACKEND_URL = import.meta.env.BACKEND_URL || "http://localhost:8085/";


function App() {
    console.log("BACKEND_URL", BACKEND_URL)
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [teams, setTeams] = useState([]);
    const [currentTeam, setCurrentTeam] = useState(null)


    useEffect(() => {
        axios.get(BACKEND_URL + "get-workers-by-manager?token=1070477").then(resposne => {
            setWorkers(resposne.data);
        })
        axios.get(BACKEND_URL + "get-teams").then(resposne => {
            setTeams(resposne.data);
        })

    }, []);

    return (
        <>
            <div style={{
                fontWeight: "bold",
                fontSize: "26px",
                marginBottom: "16px",
                marginTop: "20px"
            }}>
                Worker List
            </div>
            {
                <table style={{
                    border: "1px solid white",
                    padding: "10px"
                }}>
                    <tr>
                        <th>
                            First Name
                        </th>
                        <th>
                            Last Name
                        </th>
                        <th>
                            Team
                        </th>
                        <th>
                            Show Details
                        </th>

                    </tr>
                    {
                        workers.map(item => {
                            return (
                                <tr>
                                    <td>
                                        {item.firstName}
                                    </td>
                                    <td>
                                        {item.lastName}
                                    </td>
                                    <td>
                                        {item.teamName}
                                    </td>
                                    <td>
                                        <button  onClick={() => {
                                            if (selectedWorker && selectedWorker.id == item.id) {
                                                setSelectedWorker(null)
                                                setCurrentTeam(null)
                                            } else {
                                                axios.get(BACKEND_URL + "get-worker-details?workerId=" + item.id)
                                                    .then(response => {
                                                        setSelectedWorker(response.data);
                                                        setCurrentTeam(response.data.teamId);
                                                    })

                                            }
                                        }}>
                                            {
                                                selectedWorker && selectedWorker.id == item.id ? "Hide Details" : "Show Details"
                                            }
                                        </button>
                                    </td>
                                </tr>
                            )
                        })

                    }
                </table>

            }

            <div style={{
                marginTop: "30px"
            }}>
                {
                    selectedWorker &&
                    <div>
                        WorkerDetails:
                        <div>
                            {selectedWorker.firstName}
                        </div>
                        <div>
                            {selectedWorker.lastName}
                        </div>


                        <div>
                            Teams:

                            <select value={currentTeam} onChange={(event => {
                                setCurrentTeam(event.target.value)
                                axios.get(BACKEND_URL + "change-team?workerId=" + selectedWorker.id + "&teamId=" + event.target.value)
                                    .then(response => {
                                    })
                            })}>
                                {
                                    teams.map(item => {
                                        return (
                                            <option value={item.id}>
                                                {item.name}
                                            </option>
                                        )
                                    })
                                }

                            </select>

                        </div>

                    </div>
                }
            </div>

        </>
    )
}

export default App
