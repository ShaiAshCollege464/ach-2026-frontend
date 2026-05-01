import {useEffect, useState} from 'react'
import './App.css'
import axios from "axios";

function App() {

    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [teams, setTeams] = useState([]);
    const [currentTeam, setCurrentTeam] = useState(null)


    useEffect(() => {
        axios.get("https://ach-2026-server.onrender.com/get-workers-by-manager").then(resposne => {
            setWorkers(resposne.data);
        })
        axios.get("https://ach-2026-server.onrender.com/get-teams").then(resposne => {
            setTeams(resposne.data);
        })

    }, []);

    return (
        <>
            <div>
                Worker
            </div>
            {
                workers.map(item => {
                    return (
                        <div onClick={() => {
                            axios.get("https://ach-2026-server.onrender.com/get-worker-details?workerId=" + item.id)
                                .then(response => {
                                    setSelectedWorker(response.data);
                                    setCurrentTeam(response.data.teamId);
                                })
                        }}>
                            {item.firstName}
                        </div>
                    )
                })
            }

            <div>
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
                                axios.get("https://ach-2026-server.onrender.com/change-team?workerId=" + selectedWorker.id + "&teamId=" + event.target.value)
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
