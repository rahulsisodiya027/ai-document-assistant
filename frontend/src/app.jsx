import API from "./api";

function App() {

    const testBackend = async () => {

        try {
            const response = await API.get("/");

            console.log(response.data);

            alert(response.data.message);

        } catch (error) {

            console.error(error);

            alert("Backend connection failed");
        }
    };

    return (
        <div>
            <h1>AI Document Assistant</h1>

            <button onClick={testBackend}>
                Test Backend
            </button>
        </div>
    );
}

export default App;