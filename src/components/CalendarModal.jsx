import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useMemo } from "react";
import { getCalendarDateRange } from "../api/menuApi";

import { enGB } from "date-fns/locale";

/**
 * A themed, accessible, and centered modal for selecting a date.
 * It dynamically restricts the selectable date range based on the available menu data.
 * @param {{
 * isOpen: boolean;
 * onClose: () => void;
 * selectedDate: Date;
 * onDateSelect: (date: Date) => void;
 * }} props
 */
const CalendarModal = ({ isOpen, onClose, selectedDate, onDateSelect }) => {
	const dateRange = useMemo(() => getCalendarDateRange(), []);

	if (!isOpen) return null;

	const isDarkMode = document.documentElement.classList.contains("dark");
	const primaryColor = "#f97316"; // Your app's primary orange

	const muiTheme = createTheme({
		palette: {
			mode: isDarkMode ? "dark" : "light",
			primary: {
				main: primaryColor,
			},
			background: {
				paper: isDarkMode ? "#1f2937" : "#ffffff",
			},
		},
		typography: {
			fontFamily: '"Poppins", sans-serif',
		},
		components: {
			MuiDateCalendar: {
				styleOverrides: {
					root: {
						backgroundColor: "transparent",
					},
				},
			},
			MuiPickersDay: {
				styleOverrides: {
					root: {
						borderRadius: "9999px",
						"&:hover": {
							backgroundColor: isDarkMode
								? "rgba(249, 115, 22, 0.1)"
								: "#ffedd5",
						},
					},
					today: {
						borderColor: primaryColor,
						borderWidth: "2px",
					},
				},
			},
			MuiPickersArrowSwitcher: {
				styleOverrides: {
					button: {
						"&:hover": {
							backgroundColor: isDarkMode
								? "rgba(255, 255, 255, 0.08)"
								: "#f1f5f9",
						},
					},
				},
			},
		},
	});

	const handleDateChange = (newDate) => {
		if (newDate) {
			onDateSelect(newDate);
		}
		onClose();
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm animate-fade-in"
			onClick={onClose}
		>
			<div
				className="rounded-xl shadow-2xl border border-border overflow-hidden bg-bg"
				onClick={(e) => e.stopPropagation()}
			>
				<ThemeProvider theme={muiTheme}>
					<LocalizationProvider
						dateAdapter={AdapterDateFns}
						adapterLocale={enGB}
					>
						<DateCalendar
							value={selectedDate}
							onChange={handleDateChange}
							fixedWeekNumber={6}
							views={["day"]}
							minDate={dateRange?.minDate}
							maxDate={dateRange?.maxDate}
						/>
					</LocalizationProvider>
				</ThemeProvider>
			</div>
		</div>
	);
};

export default CalendarModal;
