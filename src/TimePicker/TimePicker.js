import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import "./TimePicker.scss";

const TimePicker = ({
    timeSelected,
    defaultTime
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
    const [selectedHour, setSelectedHour] = useState((date.getHours() > 12) ? date.getHours() - 12 : date.getHours());

    // The select minute. By default set to current minute
    const [selectedMinute, setSelectedMinute] = useState(() => {
        // Make sure we add a "0" in front of the minute if it's less than 10.
        const val = "0" + date.getMinutes().toString();
        return val.slice(-2);
    });

    // The selected AM/PM. By default set to current AM/PM
    const [selectedAmPm, setSelectedAmPm] = useState(date.getHours() >= 12 ? "PM" : "AM");

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
                    if (val !== "00") {
                        val = val.slice(1);
                    }                   

                    // Change focus to the next reference
                    if (ref) {
                        // Set the minute to reference in case we click away
                        setPrevSetMinute(val);

                        setTimeout(() => {
                            ref.current.focus();
                        }, 100);
                    }
                }
            } else {
                if (val[0] === "0") {
                    val = val.slice(1);
                } else {
                    val = val.slice(0, 2);
                }

                if (val > 12) {
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
        const val = handleInputMask(e.target.value, 'hour', minuteInputRef);

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
        const val = handleInputMask(e.target.value, 'minute', morningNightInputRef);

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

    const handleAmPmBlur = (e) => {
        if (selectedAmPm === "") {
            setSelectedAmPm(prevSetMorningNight);
        }
    }

    const updateInlineAmPm = (e) => {
        let val = e.target.value.toUpperCase();

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

            wrapperRef.current.focus();
        }
    }

    const handleEditAmPm = () => {
        if (!prevSetMorningNight) {
            setSelectedAmPm("");
        } else {
            morningNightInputRef.current.select();
        }
    }

    return (
        <div className={`time_picker_wrapper ${(isOpen) ? "selection_open" : ""}`}>
            <div className="time_picker_input">
                <input className="time_input" type="text" value={selectedHour} onChange={updateInlineHour} onClick={handleEditHour} onFocus={handleEditHour} ref={hourInputRef} />
                <span>:</span>
                <input className="time_input" type="text" value={selectedMinute} onChange={updateInlineMinute} onClick={handleEditMinute} onFocus={handleEditMinute} ref={minuteInputRef}/>
                <input className="time_input" type="text" value={selectedAmPm} onChange={updateInlineAmPm} onKeyUp={handleEnterPressAmPm} onClick={handleEditAmPm} onFocus={handleEditAmPm} onBlur={handleAmPmBlur} ref={morningNightInputRef} />
                <input className="time_input" type="text" ref={wrapperRef} />
            </div>
            {/* We will always render the selection dropdown, otherwise it will re-render every time the dropdown is opened and we'll lose our selections */}
            <div className={`selection_wrapper ${(isOpen) ? "" : "hidden"}`}>
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
                <div className="dropdown_wrapper">
                    <ul ref={morningNightDropDownRef}>
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
