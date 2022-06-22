# Untitled TimePicker

<p align="center">
    <img src="https://i.imgur.com/sekTOYo.gif" />
</p>

A simple reusable time picking component for React apps.

## Installation

Install using npm:

`npm install --save untitled-timepicker`

Install using yarn:

`yarn add untitled-timepicker`

## Usage

Here is a basic example of displaying the Untitled TimePicker in a React app.

```
// import the library
import TimePicker from "untitled-timepicker";
// import styles
import "/untitled-timepicker/dist/index.css";

// Callback function which will returned the selected time from the component
const displayTime = time => {
    console.log(time)
}

function App() {
    return (
        <TimePicker timeSelected={displayTime} />
    );
}

export default App;
```

## Prop Options/Configuration

| Prop Name         | Type      | Default Value | Description                                                                                                                            |
| ----------------- | --------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `timeSelected`    | _func_    | () => {}      | The timeSelected function is called when the user selects a time. This will pass back the string of the selected time.                 |
| `defaultTime`     | _string_  |               | The defaultTime string is the time that is selected by default.<br><br>**12 Hour example:** "09:49 AM"<br>**24 Hour example:** "09:49" |
| `label`           | _string_  |               | The label string is the label that is displayed above the time picker.                                                                 |
| `showDropdown`    | _boolean_ | false         | The showDropdown boolean is true if the dropdown is shown when clicking on the input.                                                  |
| `allowInlineEdit` | _boolean_ | true          | The allowInlineEdit boolean is true if the user can edit the time within the input.                                                    |
| `use24HourForamt` | _boolean_ | false         | The use24HourFormat boolean is true if the time is displayed in 24 hour format.                                                        |
| `compactMode`     | _boolean_ | false         | The compactMode boolean is true if the time picker is in compact mode. This will display a smaller time picker.                        |
| `incrementBy`     | _number_  | 0             | The incrementBy number is the number of minutes that the time picker increments by.<br><br>**Available options:** 5, 10, 15, 30, 60.   |

**Enjoy!**
