import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import "./TimePicker.scss";

const TimePicker = ({
    timeSelected,
    defaultTime,
    label,
    showDropdown=true,
    allowInlineEdit=true,
    use24HourFormat=false
}) => {
    const date = new Date();

    const wrapperRef = useRef();

    const hourInputRef = useRef();
    const minuteInputRef = useRef();
    const morningNightInputRef = useRef();

    const hourDropDownRef = useRef();
    const minuteDropDownRef = useRef();
    const morningNightDropDownRef = useRef();

    // Is the dropdown open?
    const [isOpen, setIsOpen] = useState(false);

    const [timeValue, setTimeValue] = useState(defaultTime || "");

    // The select hour. By default set to current hour (1-12)
    const [selectedHour, setSelectedHour] = useState("12");

    // The select minute. By default set to current minute
    const [selectedMinute, setSelectedMinute] = useState("00");

    // The selected AM/PM. By default set to current AM/PM
    const [selectedAmPm, setSelectedAmPm] = useState("AM");

    const [showError, setShowError] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    
    // When the component loads for the first time, if there is a default time, make sure that it matches the correct format.
    useEffect(() => {
        if (defaultTime) {
            if (use24HourFormat) {
                if (!defaultTime.match(/^(\d{2}):(\d{2})$/)) {
                    setShowError(true);
                    setErrorMessage("Invalid time format. Please use the format: HH:MM AM/PM");
                }
            } else {
                if (!defaultTime.match(/^(\d{2}):(\d{2})\s([PpAa][Mm])$/)) {
                    setShowError(true);
                    setErrorMessage("Invalid time format. Please use the format: HH:MM AM/PM");
                }
            }
        }
        
        // Set the hour
        let hour;

        if (defaultTime) {
            hour = parseInt(defaultTime.split(":")[0]);
        } else {
            if (use24HourFormat) {
                hour = date.getHours();
            } else {
                hour = (date.getHours() > 12) ? date.getHours() - 12 : date.getHours();
            }
        }

        // Update the dropdown value
        updateInlineHour(hour.toString());


        // Set the minute
        let minute;

        if (defaultTime) {
            minute = defaultTime.split(":")[1].split(" ")[0];
        } else {
            // Make sure we add a "0" in front of the minute if it's less than 10.
            minute = "0" + date.getMinutes().toString().slice(-2);
        }

        // Update the dropdown value
        updateInlineMinute(minute.toString());

        if (!use24HourFormat) {
            // Set the AM/PM
            let amPm;
            if (defaultTime) {
                amPm = defaultTime.split(" ")[1].toUpperCase();
            } else {
                amPm = date.getHours() >= 12 ? "PM" : "AM";
            }

            updateInlineAmPm(amPm);
        }
    }, []);

    // Keep reference to each value once set so that we can add the value back to the inputs if set and click away
    const [prevSetHour, setPrevSetHour] = useState(selectedHour);
    const [prevSetMinute, setPrevSetMinute] = useState(selectedMinute);
    const [prevSetMorningNight, setPrevSetMorningNight] = useState(selectedAmPm);

    useEffect(() => {
        document.addEventListener("click", handleOutsideClick);
    }, []);

    useEffect(() => {
        handleUpdateDisplayTime();
    }, [selectedHour, selectedMinute, selectedAmPm]);

    // Call the callback function and pass the selected time
    useEffect(() => {
        if (timeValue) {
            timeSelected(timeValue);
        }
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
        let num;

        if (use24HourFormat) {
            num = 23;
        } else {
            num = 12;
        }

        let clickEvent = onSelectedHour;
        if (type === "minute") {
            num = 59;
            clickEvent = onSelectedMinute;
        }

        return [...Array(num)].map((e, i) => {
            const val = "0" + (i + 1).toString();

            if ((i === 0 && type === "minute") || (i === 0 && use24HourFormat)) {
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

    const handleOutsideClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.target) {
            let parentElement = e.target.parentElement;

            let clickedInComponent = false;

            while (parentElement) {
                if (parentElement.classList.contains("time_picker_wrapper") || parentElement.classList.contains("time_picker_input")) {
                    clickedInComponent = true;
                    break;
                }
                parentElement = parentElement.parentElement;
            }

            if (clickedInComponent) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        }
    };

    const handleInputMask = (input, type, ref) => {
        let val = input;

        if (!(/^[0-9]+$/i).test(input[input.length - 1])) {
            val = val.slice(0, -1);
        }

        if (val.length >= 2) {
            if (type === "minute") {
                if (val > 59) {
                    val = val.slice(0, -1);
                } else {
                    // When we first pass in the minute value, there is no "0" in front of it so it will only be 2 digits long. Use that value.
                    // Otherwise check if the value passed was "00"
                    if (val.length !== 2 && val !== "00") {
                        val = val.slice(1);
                    }                   

                    // Change focus to the next reference
                    if (ref) {
                        // Set the minute to reference in case we click away
                        setPrevSetMinute(val);

                        setTimeout(() => {
                            if (ref.current) {
                                ref.current.focus();
                            }
                        }, 100);
                    }
                }
            } else {
                if (!use24HourFormat) {
                    if (val[0] === "0") {
                        val = val.slice(1);
                    } else {
                        val = val.slice(0, 2);
                    }
                }
                
                if (use24HourFormat && val > 23) {
                    val = val.slice(0, -1);
                } else if (!use24HourFormat && val > 12) {
                    val = val.slice(0, -1);
                } else {
                    // Set the hour to reference in case we click away
                    setPrevSetHour(val);

                    // Change focus to the next reference
                    if (ref) {
                        setTimeout(() => {
                            ref.current.focus();        
                        }, 100);
                    }
                }
            }
        }

        if (!use24HourFormat) {
            if (val.length === 1 && val > 0) {
                val = "0" + val;
                if (val > 1 && type === "hour") {
                    if (ref) {
                        setTimeout(() => {
                            ref.current.focus();
                        }, 100);
                    }
                }
            }
        }

        // Update the dropdown list with the new value
        updateDropDownValue(val, type);

        return val;
    }

    const updateDropDownValue = (val, type) => {
        const highlightItem = (ref) => {
            for (let child of ref.current.children) {
                if (child.nodeName === "DIV") {
                    for (let subChild of child.children) {
                        if (subChild.innerText === val) {
                            handleBoldSelectedTimeItem({ target: subChild });
                        } 
                    }
                } else {
                    if (child.innerText === val) {
                        handleBoldSelectedTimeItem({ target: child });
                    } 
                }
            }
        }

        switch (type) {
            case "hour":
                highlightItem(hourDropDownRef);
                break;
            case "minute":
                highlightItem(minuteDropDownRef);
                break;
            case "ampm":
                highlightItem(morningNightDropDownRef);
                break;
            default:
                break;
        }
    }

    const updateInlineHour = (e) => {
        let input;

        if (typeof e === "string" || typeof e === "number") {
            if (parseInt(e) < 10) {
                input = "0" + parseInt(e);
            } else {
                input = e;
            }
        } else {
            input = e.target.value;
        }

        const val = handleInputMask(input, 'hour', minuteInputRef);

        setSelectedHour(val);
    }

    const handleEditHour = () => {
        if (!prevSetHour) {
            setSelectedHour("");
        } else {
            hourInputRef.current.select();
        }
    }

    const updateInlineMinute = (e) => {
        let input;

        if (typeof e === "string" || typeof e === "number") {
            if (parseInt(e) < 10) {
                input = "0" + parseInt(e);
            } else {
                input = e;
            }
        } else {
            input = e.target.value;
        }

        const val = handleInputMask(input, 'minute', morningNightInputRef);

        setSelectedMinute(val);
    }

    const handleEditMinute = () => {
        if (!prevSetMinute) {
            setSelectedMinute("");
        } else {
            minuteInputRef.current.select();
        }
    }

    const handleEnterPressAmPm = (e) => {
        if (e.key === "Enter") {
            if (selectedAmPm === "") {
                setSelectedAmPm(prevSetMorningNight);
            }

            setIsOpen(false);

            wrapperRef.current.focus();
        }
    }

    const handleHourBlur = () => {
        if (selectedHour === "" || selectedHour.length < 2) {
            setSelectedHour(prevSetHour);
        }
    }

    const handleMinuteBlur = () => {
        if (selectedMinute === "" || selectedMinute.length < 2) {
            setSelectedMinute(prevSetMinute);
        }
    }

    const handleAmPmBlur = () => {
        if (selectedAmPm === "") {
            setSelectedAmPm(prevSetMorningNight);
        }
    }

    const updateInlineAmPm = (e) => {
        let val;

        if (typeof e === "string" || typeof e === "number") {
            val = e[0].toUpperCase();
        } else {
            val = e.target.value.toUpperCase();
        }

        if (val !== "A" && val !== "P") {
            setSelectedAmPm("");
        } else {
            val = val + "M"
            setSelectedAmPm(val);

            setPrevSetMorningNight(val);
        
            for (let child of morningNightDropDownRef.current.children) {               
                if (child.innerText === val) {
                    handleBoldSelectedTimeItem({ target: child });
                } 
            }

            setIsOpen(false);
        }

        setTimeout(() => {
            // Give the DOM time to update then focus on the next hidden input
            wrapperRef.current.focus();
        }, 100);
    }

    const handleEditAmPm = () => {
        if (!prevSetMorningNight) {
            setSelectedAmPm("");
        } else {
            morningNightInputRef.current.select();
        }
    }

    if (showError) {
        return (
            <div className="time_picker_wrapper error">
                Error: {errorMessage}
            </div>
        );
    } else {
        return (
            <div>
                {label && <p className="label">{label}</p>}
                <div className={`time_picker_wrapper ${(showDropdown && isOpen) ? "selection_open" : ""}`}>
                    <div className="time_picker_input">
                        <input className="time_input" type="text" value={selectedHour} disabled={!allowInlineEdit} onChange={updateInlineHour} onClick={handleEditHour} onFocus={handleEditHour} onBlur={handleHourBlur} ref={hourInputRef} />
                        <span>:</span>
                        <input className="time_input" type="text" value={selectedMinute} disabled={!allowInlineEdit} onChange={updateInlineMinute} onClick={handleEditMinute} onFocus={handleEditMinute} onBlur={handleMinuteBlur} ref={minuteInputRef}/>
                        {!use24HourFormat && (
                            <input className="time_input" type="text" value={selectedAmPm} disabled={!allowInlineEdit} onChange={updateInlineAmPm} onKeyUp={handleEnterPressAmPm} onClick={handleEditAmPm} onFocus={handleEditAmPm} onBlur={handleAmPmBlur} ref={morningNightInputRef} />
                        )}
                        
                        <input className="time_input" type="text" ref={wrapperRef} />
                    </div>
                    {/* We will always render the selection dropdown, otherwise it will re-render every time the dropdown is opened and we'll lose our selections */}
                    <div className={`selection_wrapper ${(showDropdown && isOpen) ? "" : "hidden"}`}>
                        <div className="dropdown_wrapper">
                            <ul ref={hourDropDownRef}>
                                {generateTime()}
                            </ul>
                        </div>
                        <div className="dropdown_wrapper">
                            <ul ref={minuteDropDownRef}>
                                {generateTime("minute")}
                            </ul>
                        </div>
                        <div className={`dropdown_wrapper ${use24HourFormat ? "hidden": ""}`}>
                            <ul ref={morningNightDropDownRef}>
                                <li onClick={onSelectedAmPm}>AM</li>
                                <li onClick={onSelectedAmPm}>PM</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

TimePicker.propTypes = {
    timeSelected: PropTypes.func.isRequired,
    defaultTime: PropTypes.string
};

export default TimePicker;
