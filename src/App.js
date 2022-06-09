import logo from './logo.svg';
import './App.css';
import TimePicker from './TimePicker/TimePicker';

const timeSelected = (time) => {
  console.log(time);
}

function App() {
  return (
    <div className="App">
      <h2>TimePicker</h2>
      <TimePicker timeSelected={timeSelected} />
    </div>
  );
}

export default App;
