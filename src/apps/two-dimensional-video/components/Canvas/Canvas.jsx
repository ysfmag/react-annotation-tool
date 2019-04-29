import React from 'react';
import PropTypes from 'prop-types';
import {
	Stage, Layer, Rect, Group, Text,
} from 'react-konva';
import { SHOW } from 'models/2DVideo';

import ResizingAnchor from './ResizingAnchor/ResizingAnchor.jsx';
import { getInterpolatedData, INTERPOLATION_TYPE } from '../../utils/interpolationUtils';
import './Canvas.scss';

const handleGroupDragMove = (e, canvasWidth, canvasHeight) => {
	if (e.target.getClassName() !== 'Group') return;
	const group = e.target;
	const topLeft = group.get('.topLeft')[0];
	const rect = group.get('Rect')[0];
	let absX; let absY;
	// boundary
	absX = topLeft.getAbsolutePosition().x;
	absY = topLeft.getAbsolutePosition().y;
	absX = absX < 0 ? 0 : absX;
	absY = absY < 0 ? 0 : absY;
	absX = absX + rect.width() > canvasWidth ? canvasWidth - rect.width() : absX;
	absY = absY + rect.height() > canvasHeight ? canvasHeight - rect.height() : absY;
	topLeft.setAbsolutePosition({ x: absX, y: absY });
	group.x(topLeft.getAbsolutePosition().x);
	group.y(topLeft.getAbsolutePosition().y);
	topLeft.position({ x: 0, y: 0 });
};

const Canvas = ({
	className,
	dotLength,
	width: canvasWidth,
	height: canvasHeight,
	objects,
	played,
	focusing,
	adding,
	entities,
	annotations,
	checkEmpty,
	onStageMouseDown,
	onGroupDragEnd,
	onGroupMouseDown,
	onDotDragEnd,
	onDotMouseDown,
}) => {

	const layerItems = [];
	annotations.slice().reverse().forEach((annotationId) => {
		const {
			trajectories, color, id, name, label, isManipulatable,
		} = entities.annotations[annotationId];

		for (let i = 0; i < trajectories.length; i++) {
			let x;
			let y;
			let width;
			let height;

			if (played >= trajectories[i].time) {
				if (i !== trajectories.length - 1 && played >= trajectories[i + 1].time) {
					continue;
				}
				if (trajectories[i].status !== SHOW) break; // todo

				if (i === trajectories.length - 1) {
					({
						x,
						y,
						width,
						height,
					} = trajectories[i]);
				} else {
					const interpoArea = getInterpolatedData({
						startEvent: trajectories[i],
						endEvent: trajectories[i + 1],
						currentTime: played,
						type: INTERPOLATION_TYPE.LENGTH,
					});
					const interpoPos = getInterpolatedData({
						startEvent: trajectories[i],
						endEvent: trajectories[i + 1],
						currentTime: played,
						type: INTERPOLATION_TYPE.POSITION,
					});
					({
						x, y,
					} = interpoPos);
					({
						width, height,
					} = interpoArea);
				}

				const dots = [];
				const fill = (focusing === name) ? color.replace(/,1\)/, ',.3)') : '';
				const rect = (
					<Rect
						x={ 0 }
						y={ 0 }
						fill={ fill }
						width={ width }
						height={ height }
						stroke={ color }
						strokeWidth={ 1 }
						onFocus={ () => {} }
						onMouseOver={ () => {
							if (!isManipulatable || adding) return;
							document.body.style.cursor = 'pointer';
						} }
					/>
				);
				const labelText = (
					<Text
						offsetY={ 20 }
						x={ 0 }
						y={ 0 }
						fontFamily='Calibri'
						text={ label }
						fontSize={ 16 }
						lineHeight={ 1.2 }
						fill='#fff'
					/>
				);
				const warningText = checkEmpty && trajectories.length < 2 && (
					<Text
						offsetY={ -5 }
						x={ 0 }
						y={ height }
						fontFamily='Calibri'
						text='You should track the cell bound by this box'
						fontSize={ 16 }
						lineHeight={ 1.2 }
						fill='#fff'
					/>
				);
				if (isManipulatable) {
					dots.push(
						<ResizingAnchor
							dotLength={ dotLength }
							color={ color }
							isManipulatable={ isManipulatable }
							x={ 0 }
							y={ 0 }
							name='topLeft'
							canvasWidth={ canvasWidth }
							canvasHeight={ canvasHeight }
							onDragEnd={ onDotDragEnd }
							onMouseDown={ onDotMouseDown }
						/>,
					);
					dots.push(
						<ResizingAnchor
							dotLength={ dotLength }
							color={ color }
							isManipulatable={ isManipulatable }
							x={ width }
							y={ 0 }
							name='topRight'
							canvasWidth={ canvasWidth }
							canvasHeight={ canvasHeight }
							onDragEnd={ onDotDragEnd }
							onMouseDown={ onDotMouseDown }
						/>,
					);
					dots.push(
						<ResizingAnchor
							dotLength={ dotLength }
							color={ color }
							isManipulatable={ isManipulatable }
							x={ width }
							y={ height }
							name='bottomRight'
							canvasWidth={ canvasWidth }
							canvasHeight={ canvasHeight }
							onDragEnd={ onDotDragEnd }
							onMouseDown={ onDotMouseDown }
						/>,
					);
					dots.push(
						<ResizingAnchor
							dotLength={ dotLength }
							color={ color }
							isManipulatable={ isManipulatable }
							x={ 0 }
							y={ height }
							name='bottomLeft'
							canvasWidth={ canvasWidth }
							canvasHeight={ canvasHeight }
							onDragEnd={ onDotDragEnd }
							onMouseDown={ onDotMouseDown }
						/>,
					);
					dots.push(
						<ResizingAnchor
							dotLength={ dotLength }
							color={ color }
							isManipulatable={ isManipulatable }
							x={ width / 2 }
							y={ 0 }
							name='top'
							canvasWidth={ canvasWidth }
							canvasHeight={ canvasHeight }
							onDragEnd={ onDotDragEnd }
							onMouseDown={ onDotMouseDown }
						/>,
					);
					dots.push(
						<ResizingAnchor
							dotLength={ dotLength }
							color={ color }
							isManipulatable={ isManipulatable }
							x={ 0 }
							y={ height / 2 }
							name='left'
							canvasWidth={ canvasWidth }
							canvasHeight={ canvasHeight }
							onDragEnd={ onDotDragEnd }
							onMouseDown={ onDotMouseDown }
						/>,
					);
					dots.push(
						<ResizingAnchor
							dotLength={ dotLength }
							color={ color }
							isManipulatable={ isManipulatable }
							x={ width }
							y={ height / 2 }
							name='right'
							canvasWidth={ canvasWidth }
							canvasHeight={ canvasHeight }
							onDragEnd={ onDotDragEnd }
							onMouseDown={ onDotMouseDown }
						/>,
					);
					dots.push(
						<ResizingAnchor
							dotLength={ dotLength }
							color={ color }
							isManipulatable={ isManipulatable }
							x={ width / 2 }
							y={ height }
							name='bottom'
							canvasWidth={ canvasWidth }
							canvasHeight={ canvasHeight }
							onDragEnd={ onDotDragEnd }
							onMouseDown={ onDotMouseDown }
						/>,
					);
				}
				layerItems.push(
					<Group
						x={ x }
						y={ y }
						key={ name }
						id={ id }
						name={ name }
						draggable={ isManipulatable }
						onMouseDown={ (e) => {
							const group = e.target.findAncestor('Group');
							if (!isManipulatable) return;
							group.moveToTop();
							onGroupMouseDown(e);
						} }
						onDragEnd={ (e) => {
							if (e.target.getClassName() !== 'Group') return;
							onGroupDragEnd(e);
						} }
						onDragMove={ e => handleGroupDragMove(e, canvasWidth, canvasHeight) }
					>
						{labelText}
						{rect}
						{dots}
						{warningText}
					</Group>
				);
				break;
			}
		}
	});
	let addingLayer;
	if (adding) {
		addingLayer = (
			<Layer>
				<Rect fill='#ffffff' width={ canvasWidth } height={ canvasHeight } opacity={ 0.3 } />
				<Text y={ canvasHeight / 2 } width={ canvasWidth } text='Click and Drag here to add new box' align='center' fontSize={ 16 } fill='#fff' />
			</Layer>
		);
	}
	return (
		<Stage
			width={ canvasWidth }
			height={ canvasHeight }
			className='konva-wrapper'
			onMouseDown={ e => onStageMouseDown(e) }
			onMouseOver={ () => {
				if (adding) {
					document.body.style.cursor = 'crosshair';
				}
			} }
			onMouseLeave={ () => {
				document.body.style.cursor = 'default';
			} }
			onMouseOut={ () => {
				document.body.style.cursor = 'default';
			} }
			onBlur={ () => {} }
			onFocus={ () => {} }
		>
			{addingLayer}
			<Layer>{layerItems}</Layer>
		</Stage>
	);
};

Canvas.propTypes = {
	className: PropTypes.string,
	dotLength: PropTypes.number,
};
Canvas.defaultProps = {
	className: '',
	dotLength: 6,
};
export default Canvas;