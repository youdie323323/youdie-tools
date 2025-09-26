import { useState } from "react";

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import { validateFormat, generateActivatableCiphers } from "./MathematicaLicenseCracker";

export default () => {
    const [expirationDate, setExpirationDate] = useState(new Date());

    return (
        <div className="flex flex-col justify-center items-center h-full">
            <p className="text-4xl" style={{ fontVariant: "small-caps" }}>Cracker</p>

            <div className="flex flex-col items-start">
                <label htmlFor="machine-id-input">Machine Id</label>
                <input
                    type="text"
                    id="machine-id-input"
                    className="form-control string-inputter"
                    placeholder="XXXX-XXXXX-XXXXX"
                />
            </div>

            <br />

            <div className="flex flex-col items-start">
                <label htmlFor="expiration-date-picker">Expiration Date</label>
                <DatePicker
                    className="form-control string-inputter"
                    selected={expirationDate}
                    onChange={(date) => date && setExpirationDate(date)}
                    id="expiration-date-picker"
                />
            </div>

            <br />

            <button
                onClick={() => {
                    const machineIdInput = document.getElementById("machine-id-input") as HTMLInputElement;

                    const activationKeyInput = document.getElementById("activation-key-input") as HTMLInputElement;
                    const passwordInput = document.getElementById("password-input") as HTMLInputElement;

                    const machineId = machineIdInput.value;
                    if (!validateFormat("XXXX-XXXXX-XXXXX", machineId)) { // Validate
                        alert("Machine Id is not valid format");

                        return;
                    }

                    [activationKeyInput.value, passwordInput.value] = generateActivatableCiphers(machineId, expirationDate)
                }}
                className={`general-purpose-input`}
            >
                Crack License
            </button>

            <br />

            <p className="text-4xl" style={{ fontVariant: "small-caps" }}>Cracked</p>

            <div className="flex flex-col items-start">
                <label htmlFor="activation-key-input">Activation Key</label>
                <input
                    type="text"
                    id="activation-key-input"
                    className="form-control string-inputter"
                    placeholder="XXXX-XXXX-XXXXXX"
                    readOnly={true}
                />
            </div>

            <br />

            <div className="flex flex-col items-start">
                <label htmlFor="password-input">Password</label>
                <input
                    type="text"
                    id="password-input"
                    className="form-control string-inputter"
                    readOnly={true}
                />
            </div>
        </div>
    );
};