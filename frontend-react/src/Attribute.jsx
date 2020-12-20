import React from "react";
import { Draggable } from "react-beautiful-dnd";

import grip from "./grip.svg";

import AttributeValue from "./AttributeValue";

export default function Attribute(props) {
	return (
		<Draggable draggableId={props.attribute.ID} index={props.index}>
			{(provided, snapshot) => (
				<tr
					{...provided.draggableProps}
					ref={provided.innerRef}
					style={{
						backgroundColor: snapshot.isDragging && "#abcdef",
						...provided.draggableProps.style,
					}}
					className="attribute-row"
				>
					<td className="drag-cell" {...provided.dragHandleProps}>
						<img src={grip} alt="drag" />
					</td>

					<td className="property-cell">
						{props.attribute.property.label ||
							props.attribute.property.uri}
					</td>

					<td className="value-cell">
						<ul>
							{props.attribute.value.map((value) => (
								<AttributeValue key={value.ID} value={value} />
							))}
						</ul>
					</td>

					<td className="show-cell">
						<input
							type="checkbox"
							name={props.attribute.ID}
							checked={props.attribute.show}
						/>
					</td>
				</tr>
			)}
		</Draggable>
	);
}
