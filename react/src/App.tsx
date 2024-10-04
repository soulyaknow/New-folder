import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  // Dynamic ID
  const dynamicID = `form-element-${Date.now()}`;

  // Form state
  const [firstname, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  // Form submission handler
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:9090/execute-tagUI-script",
        {
          firstname: firstname,
          surname: surname,
          contactNumber: contactNumber,
          email: email,
        }
      );
      // Handle response
      setResponseMessage(response.data.message || "Success");
    } catch (error) {
      setResponseMessage("An error occurred during the request");
    }
  };

  return (
    <div className="App">
      <h1>Simple Form with Dynamic ID</h1>
      <form id={dynamicID} onSubmit={handleSubmit}>
        <div>
          <label htmlFor={`${dynamicID}-firstname`}>First Name:</label>
          <input
            id={`${dynamicID}-firstname`}
            type="text"
            value={firstname}
            ng-model="$mdAutocompleteCtrl.scope.searchText"
            aria-label="First name"
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${dynamicID}-surname`}>Surname:</label>
          <input
            id={`${dynamicID}-surname`}
            type="text"
            value={surname}
            ng-model="$ctrl.contact.familyName"
            onChange={(e) => setSurname(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${dynamicID}-contactNumber`}>Contact Number:</label>
          <input
            id={`${dynamicID}-contactNumber`}
            type="text"
            value={contactNumber}
            ng-model="$ctrl.contact.phone"
            onChange={(e) => setContactNumber(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${dynamicID}-email`}>Email:</label>
          <input
            id={`${dynamicID}-email`}
            type="email"
            value={email}
            ng-model="$ctrl.contact.email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      <div>{responseMessage}</div>
    </div>
  );
}

export default App;
