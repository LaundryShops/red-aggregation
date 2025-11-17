export abstract class Field {

	// /**
	//  * Returns the raw of the field.
	//  *
	//  * @return must not be {@literal null}.
	//  */
	// abstract getRaw(): string;

	/**
	 * Returns the name of the field.
	 *
	 * @return must not be {@literal null}.
	 */
	abstract getName(): string;

	/**
	 * Returns the target of the field. In case no explicit target is available {@link #getName()} should be returned.
	 *
	 * @return must not be {@literal null}.
	 */
	abstract getTarget(): string;

	abstract isAliased(): boolean;

	isInternal() {
		return false;
	}
}