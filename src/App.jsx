import {BrowserRouter, Route, Routes} from "react-router-dom";
import Login from "./Login.jsx";
import Dashboard, {BACKEND_URL} from "./Dashboard.jsx";
import {useEffect, useState} from "react";
import axios from "axios";
import TeamDetails from "./TeamDetails.jsx";
import GetQrPage from "./GetQrPage.jsx";

function App() {
    const [signedIn, setSignedIn] = useState(false);

    useEffect(() => {
        axios.defaults.withCredentials = true;
        axios.get(BACKEND_URL + "/me").then((response) => {
            setSignedIn(response.data.success)
        })
    }, []);

    return (
        <div className="app-container">
            <BrowserRouter>
                <Routes>
                    {
                        signedIn ?
                            <Route path="/" element={<Dashboard/>}/>
                            :
                            <Route path="/" element={<Login/>}/>
                    }
                    <Route path={"team/:id"} element={<TeamDetails/>}/>
                    <Route path={"temp"} element={<GetQrPage/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;