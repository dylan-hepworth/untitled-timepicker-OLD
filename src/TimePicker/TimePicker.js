import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import "./TimePicker.scss";

const TimePicker = ({
    timeSelected,
    defaultTime
}) => {
    const date = new Date();

    // Set a reference to the time input
    const inputTime = useRef();

    // Is the dropdown open?
    const [isOpen, setIsOpen] = useState(false);

    const [timeValue, setTimeValue] = useState(defaultTime || "");

    // The select hour. By default set to current hour (1-12)
    const [selectedHour, setSelectedHour] = useState((date.getHours() > 12) ? date.getHours() - 12 : date.getHours());

    // The select minute. By default set to current minute
    const [selectedMinute, setSelectedMinute] = useState(() => {
        // Make sure we add a "0" in front of the minute if it's less than 10.
        const val = "0" + date.getMinutes().toString();
        return val.slice(-2);
    });

    // The selected AM/PM. By default set to current AM/PM
    const [selectedAmPm, setSelectedAmPm] = useState(date.getHours() >= 12 ? "PM" : "AM");

    useEffect(() => {
        document.addEventListener("click", handleOutsideClick);
    }, [1]);

    useEffect(() => {
        handleUpdateDisplayTime();
    }, [selectedHour, selectedMinute, selectedAmPm]);

    // Call the callback function and pass the selected time
    useEffect(() => {
        timeSelected(timeValue);
    }, [timeValue]);

    // Bold the selected time that was clicked, and remove the bold from the other times
    const handleBoldSelectedTimeItem = (e) => {
        const parent = e.target.parentElement;

        for (let child of parent.children) {
            if (child.nodeName === "DIV") {
                for (let subChild of child.children) {
                    subChild.style.fontWeight = "normal";
                }
            }
            child.style.fontWeight = "normal";
        }

        if (parent.nodeName === "DIV") {
            for (let child of parent.parentElement.children) {
                child.style.fontWeight = "normal";
            }
        }

        // Scroll the item to the top of the list so that it's easily visible to the user.
        parent.scroll({
            top: e.target.offsetTop,
            behavior: "smooth"
        });

        e.target.style.fontWeight = "bold";
    };

    // When the hour value is selected, set the selected hour
    const onSelectedHour = (e) => {
        handleBoldSelectedTimeItem(e);
        setSelectedHour(e.target.innerText);
    };

    // When the minute value is selected, set the selected minute
    const onSelectedMinute = (e) => {
        handleBoldSelectedTimeItem(e);
        setSelectedMinute(e.target.innerText);
    };

    // When the AM/PM value is selected, set the selected AM/PM
    const onSelectedAmPm = (e) => {
        handleBoldSelectedTimeItem(e);
        setSelectedAmPm(e.target.innerText);
    };

    const handleUpdateDisplayTime = () => {
        let time = selectedHour || "00";
        time += ":";
        time += selectedMinute || "00";
        time += " " + selectedAmPm;

        setTimeValue(time);
    };

    const generateTime = (type) => {
        let num = 12;
        let clickEvent = onSelectedHour;
        if (type === "minute") {
            num = 59;
            clickEvent = onSelectedMinute;
        }

        return [...Array(num)].map((e, i) => {
            const val = "0" + (i + 1).toString();

            if (i == 0 && type === "minute") {
                return (
                    // We have to set a key for the div wrapper so that we don't receive an error
                    <div key="b">
                        <li key={-1} onClick={clickEvent}>00</li>
                        <li key={i} onClick={clickEvent}>{val.slice(-2)}</li>
                    </div>
                );
            } else {
                return (
                    <li key={i} onClick={clickEvent}>{val.slice(-2)}</li>
                );
            }
        });
    };

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    const handleOutsideClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.target) {
            let parentElement = e.target.parentElement;

            let clickedInComponent = false;

            while (parentElement) {
                if (parentElement.classList.contains("time_picker_wrapper")) {
                    clickedInComponent = true;
                    break;
                }
                parentElement = parentElement.parentElement;
            }

            if (!clickedInComponent) {
                setIsOpen(false);
            }
        }
    };

    const handleInlineInput = (e) => {
        let val = e.target.value;


        // val = val.replace(/[^\dh:\D]/, "");
        // val = val.replace(/^[^0-2]/, "");
        // val = val.replace(/^([2-9])[4-9]/, "$1");
        // val = val.replace(/^\d[:h]/, "");
        // val = val.replace(/^([01][0-9])[^:h]/, "$1");
        // val = val.replace(/^(2[0-3])[^:h]/, "$1");
        // val = val.replace(/^(\d{2}[:h])[^0-5]/, "$1");
        // val = val.replace(/^(\d{2}h)./, "$1");
        // val = val.replace(/^(\d{2}:[0-5])[^0-9]/, "$1");
        // val = val.replace(/^(\d{2}:\d[0-9]\D[AaPp][Mm])./, "$1");
        // val = val.replace(/^(\d{2}:\d{2}]\D{2})./, "$1");

        // // TODO: THIS REGEX ISN'T PERFECT. 

        // setTimeValue(val);
    };

    return (
        <div className={`time_picker_wrapper ${(isOpen) ? "selection_open" : ""}`}>
            <span className="time_picker_input" onClick={toggleOpen}>
                {timeValue}
                {/* TODO: Need to hide and show this value with an edit ring around the input */}
                {/* <input
                    className="input_overlay"
                    // value={timeValue}
                    // onChange={handleInlineInput}
                    type="time"
                    // ref={inputTime}
                /> */}
            </span>
            {/* We will always render the selection dropdown, otherwise it will re-render every time the dropdown is opened and we'll lose our selections */}
            <div className={`selection_wrapper ${(isOpen) ? "" : "hidden"}`}>
                <div className="dropdown_wrapper">
                    <ul>
                        {generateTime()}
                    </ul>
                </div>
                <div className="dropdown_wrapper">
                    <ul>
                        {generateTime("minute")}
                    </ul>
                </div>
                <div className="dropdown_wrapper">
                    <ul>
                        <li onClick={onSelectedAmPm}>AM</li>
                        <li onClick={onSelectedAmPm}>PM</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

TimePicker.propTypes = {
    timeSelected: PropTypes.func.isRequired,
    defaultTime: PropTypes.string
};

export default TimePicker;
