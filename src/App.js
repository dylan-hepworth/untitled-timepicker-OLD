import { React } from "react";
import TimePicker from "./TimePicker/TimePicker";
import "./App.css";

const timeSelected = (time) => {
	console.log("time", time);
};

function App() {
	return (
		<div className="App">
			<TimePicker 
				timeSelected={timeSelected} 
				defaultTime={"09:49 AM"}
				// label={"Select a Time"}
				// showDropdown={false}
				// allowInlineEdit={false}
				// use24HourFormat={true}
				// compactMode={true}
				// incrementBy={15}

			/>
		</div>
	);
}

export default App;
