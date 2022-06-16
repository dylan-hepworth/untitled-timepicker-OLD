import logo from './logo.svg';
import './App.css';
import TimePicker from './TimePicker/TimePicker';

const timeSelected = (time) => {
  console.log("time", time);
}

function App() {
  return (
    <div className="App">
      <h2>TimePicker</h2>
      <TimePicker 
        timeSelected={timeSelected} 
        // defaultTime={"09:49 AM"}
        // label={"Select a Time"}
        // showDropdown={false}
        // allowInlineEdit={false}

        // TODOS -=============
        // use24HourFormat={true}
      />
    </div>
  );
}

export default App;
