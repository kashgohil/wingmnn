import { Popover, PopoverProps } from '@components/popover/popover';
import { useFocusTrap } from '@hooks/useFocusTrap';
import { castArray } from '@utility/castArray';
import { classVariance } from '@utility/classVariance';
import { cx } from '@utility/cx';
import { filter } from '@utility/filter';
import { forEachArray } from '@utility/forEach';
import { map } from '@utility/map';
import React, { KeyboardEvent } from 'react';

export interface MenuProps
	extends Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'onSelect'> {
	open: boolean;
	onClose(): void;
	options: Array<Option>;
	value: string | Array<string>;
	onSelect?(option: Option): void;
	variant?: PopoverProps['variant'];
	placement: PopoverProps['placement'];
	anchor: React.RefObject<HTMLElement | null>;
}

export interface MenuOptionProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	option: Option;
	selected?: boolean;
	variant: PopoverProps['variant'];
}

const optionVariantClasses = classVariance({
	compact: 'px-4 py-1',
	normal: 'px-8 py-2',
	selected: 'bg-black-200/20',
});

function MenuOption(props: MenuOptionProps) {
	const { option, selected, className, variant = 'normal', ...rest } = props;
	const { label } = option;
	return (
		<div
			{...rest}
			className={cx(className, optionVariantClasses(variant, selected ? 'selected' : undefined), 'rounded-lg')}
		>
			{label}
		</div>
	);
}

export function Menu(props: MenuProps) {
	const { ref, value, options, variant, className, onKeyDown, onClose, onSelect, ...rest } = props;

	const refs = React.useRef<MapOf<TSAny>>({});
	const currentIndex = React.useRef<number>(0);
	const menuRef = React.useRef<HTMLDivElement>(null);

	const selectableOptions = React.useMemo(() => filter(options, (option) => option.type === 'value'), [options]);

	const selectedOptions = React.useMemo(() => {
		const set = new Set();
		forEachArray(castArray(value), (value) => {
			set.add(value);
		});
		return set;
	}, [value]);

	const focusOption = React.useCallback(
		(index: number) => {
			const option = selectableOptions[index];
			if (option && refs.current[option.id]) {
				refs.current[option.id].focus();
				currentIndex.current = index;
			}
		},
		[selectableOptions]
	);

	const keydown = React.useCallback(
		(e: KeyboardEvent<HTMLDivElement>) => {
			if (onKeyDown) {
				onKeyDown(e);
			} else {
				const len = selectableOptions.length;

				switch (e.key) {
					case 'ArrowUp':
						e.preventDefault();
						focusOption((currentIndex.current - 1 + len) % len);
						break;

					case 'ArrowDown':
						e.preventDefault();
						focusOption((currentIndex.current + 1) % len);
						break;

					case 'Enter':
					case ' ': {
						e.preventDefault();
						const selectedOption = selectableOptions[currentIndex.current];
						if (selectedOption) {
							onSelect?.(selectedOption);
						}
						break;
					}

					case 'Home':
						e.preventDefault();
						focusOption(0);
						break;

					case 'End':
						e.preventDefault();
						focusOption(len - 1);
						break;

					case 'Escape':
						e.preventDefault();
						onClose();
						break;
				}
			}
		},
		[onSelect, onKeyDown, onClose, selectableOptions, focusOption]
	);

	React.useImperativeHandle(ref, () => menuRef.current!);

	useFocusTrap(menuRef, props.open);

	return (
		<Popover
			{...rest}
			role="menu"
			ref={menuRef}
			onClose={onClose}
			variant={variant}
			onKeyDown={keydown}
			className={cx(className, 'p-2 rounded-lg')}
		>
			{map(options, (option) => {
				const { type } = option;
				return (
					<MenuOption
						role="menuitem"
						key={option.id}
						option={option}
						variant={variant}
						tabIndex={type === 'value' ? 0 : -1}
						selected={selectedOptions.has(option.id)}
						onClick={() => type === 'value' && onSelect?.(option)}
						ref={
							type === 'value'
								? (ref) => {
										refs.current[option.id] = ref;
									}
								: undefined
						}
					/>
				);
			})}
		</Popover>
	);
}
