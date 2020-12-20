import React from "react";

export default function AttributeValue(props) {
	return props.value.editing ? (
		<li>
			<input
				type="text"
				name="propertyValue"
				id="values"
				value={props.value.label || props.value.value}
			/>
			<label htmlFor="valueType">
				Seleziona il tipo di confronto vuoi che avvenga:
			</label>
			<select
				id="valueType"
				name="valueTypes"
				value={props.value.comparison}
			>
				<option value="default">Default (exactString or equal)</option>
				<option value="substring">Substring</option>
				<option value="numeric">Numeric</option>
				<option value="regex">Regular Expression</option>
			</select>

			<span id="editButtonSpan">[ Apply | Undo]</span>
		</li>
	) : (
		<li className={props.value.edited ? "modified" : "non-modified"}>
			{props.value.label ? props.value.label : props.value.value}
			<span id="editButtonSpan">[Edit]</span>
		</li>
	);
}
