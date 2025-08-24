const SelectDropdown = ({ label, id, value, onChange, options }) => {
	return (
		<div className="form-group flex-1 min-w-[120px]">
			{label && (
				<label htmlFor={id} className="form-label">
					{label}
				</label>
			)}
			<select
				id={id}
				value={value}
				onChange={onChange}
				className="input appearance-none bg-no-repeat"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
					backgroundPosition: "right 0.5rem center",
					backgroundSize: "1.5em 1.5em",
				}}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
};

export default SelectDropdown;
